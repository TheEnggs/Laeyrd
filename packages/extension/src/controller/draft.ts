import {
  DraftChangeHandlerMap,
  DraftFile,
  draftFile,
  DraftState,
  DraftStatePayload,
  DraftStatePayloadKeys,
} from "@shared/types/theme";
import { log } from "@shared/utils/debug-logs";
import * as vscode from "vscode";
import { ThemeController } from "./theme";
import { PublishType, SaveThemeModes } from "@shared/types/event";

const defaultDraft: DraftFile = {
  lastUpdatedOn: new Date().toISOString(),
  draftState: {
    colorCustomization: {},
    tokenCustomization: {},
    settingsCustomization: {},
    semanticTokenCustomization: {},
  },
  oldSettings: {
    colorCustomization: {},
    tokenCustomization: {},
    settingsCustomization: {},
    semanticTokenCustomization: {},
  },
  isSettingsRestored: true,
  isEditing: false,
  isContentSaved: false,
};

type DraftHandlerContext = {
  existingColors: Record<string, string>;
  existingTokenColors: Record<string, string>;
  existingSemanticRules: Record<string, any>;
  pendingColors: Record<string, string>;
  pendingTokenColors: Record<string, string>;
  pendingSemanticRules: Record<string, any>;
  pendingSettings: Record<string, string | number | boolean>;
};
export default class DraftManager {
  public draftFileContent: DraftFile;
  private readonly DRAFT_FILE_NAME = "laeyrd-draft.json";

  private constructor(private context: vscode.ExtensionContext) {
    this.draftFileContent = structuredClone(defaultDraft);
  }

  private getFilePath() {
    return vscode.Uri.joinPath(
      this.context.globalStorageUri,
      this.DRAFT_FILE_NAME
    );
  }

  private async getVSCodeConfig() {
    return vscode.workspace.getConfiguration();
  }

  /**
   * Ensure the draft file exists or initialize a new one.
   */
  public static async init(
    context: vscode.ExtensionContext
  ): Promise<DraftManager> {
    const draftManager = new DraftManager(context);
    await draftManager.loadFromFile();
    return draftManager;
  }
  private async loadFromFile() {
    try {
      const fileContent = await this.getFile();
      if (!fileContent) throw new Error("Failed to read file content");
      this.draftFileContent = fileContent;
    } catch (err) {
      log("File not found or corrupted, creating new one:", err);
      await this.writeFile();
    }
  }

  /**
   * Safely read and validate the draft file.
   */
  private async getFile(): Promise<DraftFile | null> {
    const filePath = this.getFilePath();
    try {
      const bytes = await vscode.workspace.fs.readFile(filePath);
      const content = new TextDecoder().decode(bytes);
      const parsed = JSON.parse(content);
      const validate = draftFile.safeParse(parsed);
      return validate.success ? validate.data : null;
    } catch (err) {
      console.error("DraftManager: failed to read file:", err);
      return null;
    }
  }

  /**
   * Persist current draftFileContent to file.
   */
  public async writeFile() {
    if (!this.draftFileContent) throw new Error("No draft file content");
    try {
      const filePath = this.getFilePath();
      const bytes = new TextEncoder().encode(
        JSON.stringify(this.draftFileContent, null, 2)
      );

      await vscode.workspace.fs.writeFile(filePath, bytes);
      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Update the draft state and persist immediately.
   */
  public async applyDraftChanges(
    payload: DraftStatePayload[]
  ): Promise<boolean> {
    log("applyDraftChanges", payload);
    const draft = this.draftFileContent;
    const config = await this.getVSCodeConfig();

    // Take snapshots ONCE so we don't keep reading config
    const existingColors =
      config.get<Record<string, string>>("workbench.colorCustomizations") || {};
    const existingTokenColors =
      config.get<Record<string, string>>("editor.tokenColorCustomizations") ||
      {};
    const existingSemanticTokens =
      config.get<{ rules?: Record<string, any> }>(
        "editor.semanticTokenColorCustomizations"
      ) || {};
    const existingSemanticRules = existingSemanticTokens.rules || {};

    // Accumulators for new values
    const pendingColors: Record<string, string> = {};
    const pendingTokenColors: Record<string, string> = {};
    const pendingSemanticRules: Record<string, any> = {};
    const pendingSettings: Record<string, string | number | boolean> = {};

    // We pass these through to the handlers
    const handlers = this.applyDraftChangeHandlers(draft, {
      existingColors,
      existingTokenColors,
      existingSemanticRules,
      pendingColors,
      pendingTokenColors,
      pendingSemanticRules,
      pendingSettings,
    });

    // Process all payload items, but don't touch config yet
    payload.forEach((item) => {
      switch (item.type) {
        case "color":
          handlers.color(item.key, item.value);
          break;

        case "token":
          handlers.token(item.key, item.value);
          break;

        case "semanticToken":
          handlers.semanticToken(item.key, item.value);
          break;

        case "settings":
          handlers.settings(item.key, item.value);
          break;
      }
    });

    // Now apply batched updates

    // 1. workbench.colorCustomizations
    if (Object.keys(pendingColors).length > 0) {
      await this.updateConfigSection<Record<string, string>>(
        "workbench.colorCustomizations",
        (existing) => ({
          ...existing,
          ...pendingColors,
        })
      );
    }

    // 2. editor.tokenColorCustomizations
    if (Object.keys(pendingTokenColors).length > 0) {
      await this.updateConfigSection<Record<string, string>>(
        "editor.tokenColorCustomizations",
        (existing) => ({
          ...existing,
          ...pendingTokenColors,
        })
      );
    }

    // 3. editor.semanticTokenColorCustomizations
    if (Object.keys(pendingSemanticRules).length > 0) {
      await this.updateConfigSection<{ rules?: Record<string, any> }>(
        "editor.semanticTokenColorCustomizations",
        (existing) => {
          const rules = { ...(existing.rules ?? {}), ...pendingSemanticRules };
          return { ...existing, rules };
        }
      );
    }

    // 4. arbitrary settings (each key is its own setting)
    for (const [key, value] of Object.entries(pendingSettings)) {
      await this.updateSettingsConfig(key, (existing) => {
        if (!(key in draft.oldSettings.settingsCustomization)) {
          draft.oldSettings.settingsCustomization[key] = existing;
        }
        return value;
      });
    }

    draft.lastUpdatedOn = new Date().toISOString();
    draft.isEditing = true;
    draft.isSettingsRestored = false;
    this.draftFileContent = draft;
    return await this.writeFile();
  }

  public applyDraftChangeHandlers(
    draft: DraftFile,
    ctx: DraftHandlerContext
  ): DraftChangeHandlerMap {
    return {
      color: (key: string, value: string) => {
        const { existingColors, pendingColors } = ctx;

        if (!(key in draft.oldSettings.colorCustomization)) {
          draft.oldSettings.colorCustomization[key] = existingColors[key] ?? "";
        }

        draft.draftState.colorCustomization[key] = value;
        pendingColors[key] = value;
      },

      token: (key: string, value: string) => {
        const { existingTokenColors, pendingTokenColors } = ctx;

        if (!(key in draft.oldSettings.tokenCustomization)) {
          draft.oldSettings.tokenCustomization[key] =
            existingTokenColors[key] ?? "";
        }

        draft.draftState.tokenCustomization[key] = value;
        pendingTokenColors[key] = value;
      },

      semanticToken: (key: string, value: string) => {
        const { existingSemanticRules, pendingSemanticRules } = ctx;

        if (!(key in draft.oldSettings.semanticTokenCustomization)) {
          draft.oldSettings.semanticTokenCustomization[key] =
            existingSemanticRules[key] ?? "";
        }

        draft.draftState.semanticTokenCustomization[key] = value;
        pendingSemanticRules[key] = value;
      },

      settings: (key: string, value: string | boolean | number) => {
        draft.draftState.settingsCustomization[key] = value;
        ctx.pendingSettings[key] = value;
      },
    };
  }

  public async removeDraftChange(payload: DraftStatePayload[]) {
    const successData: DraftStatePayload[] = [];
    try {
      const draft = this.draftFileContent.draftState;
      const oldSettings = this.draftFileContent.oldSettings;
      const colorCustomizations = payload.filter((p) => p.type === "color");
      const semanticTokenCustomizations = payload.filter(
        (p) => p.type === "semanticToken"
      );
      const tokenCustomizations = payload.filter((p) => p.type === "token");
      const settingsCustomizations = payload.filter(
        (p) => p.type === "settings"
      );

      if (colorCustomizations.length > 0) {
        await this.updateConfigSection(
          "workbench.colorCustomizations",
          (existing) => {
            const copy = { ...existing };
            colorCustomizations.forEach(({ key, value, type }) => {
              const keyInOldSettings = oldSettings.colorCustomization[key];
              if (keyInOldSettings && keyInOldSettings !== "") {
                // restore old value
                copy[key] = keyInOldSettings;
              } else {
                // delete value entirely
                delete copy[key];
              }
              delete draft.colorCustomization[key];
              successData.push({ key, value, type });
            });
            return copy;
          }
        );
      }
      if (tokenCustomizations.length > 0) {
        await this.updateConfigSection(
          "editor.tokenColorCustomizations",
          (existing) => {
            const copy = { ...existing };
            tokenCustomizations.forEach(({ key, value, type }) => {
              const keyInOldSettings = oldSettings.tokenCustomization[key];
              if (keyInOldSettings) {
                // restore old value
                existing[key] = keyInOldSettings;
              } else {
                // delete value entirely
                delete copy[key];
              }
              delete draft.tokenCustomization[key];
              successData.push({ key, value, type });
            });
            return copy;
          }
        );
      }
      if (semanticTokenCustomizations.length > 0) {
        await this.updateConfigSection(
          "editor.semanticTokenColorCustomizations",
          (existing) => {
            const copy = { ...existing.rules };
            semanticTokenCustomizations.forEach(({ key, value, type }) => {
              const keyInOldSettings =
                oldSettings.semanticTokenCustomization[key];
              if (keyInOldSettings && keyInOldSettings !== "") {
                // restore old value
                copy[key] = keyInOldSettings;
              } else {
                // delete value entirely
                delete copy[key];
              }
              delete draft.semanticTokenCustomization[key];
              successData.push({ key, value, type });
            });
            return { rules: copy };
          }
        );
      }
      if (settingsCustomizations.length > 0) {
        settingsCustomizations.forEach(({ key, value, type }) => {
          const hasKey = key in oldSettings.settingsCustomization;
          this.updateSettingsConfig(key, (existing) => {
            return hasKey ? oldSettings.settingsCustomization[key] : existing;
          });
          delete draft.settingsCustomization[key];
          successData.push({ type, key, value });
        });
      }
      await this.writeFile();
      return { success: true, data: successData };
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      if (successData.length > 0) {
        return { success: true, data: successData, error };
      }
      return {
        success: false,
        data: successData,
        error,
      };
    }
  }

  public async publishDraftChanges({
    publishType,
    theme,
  }: {
    publishType: PublishType;
    theme?: {
      mode: keyof typeof SaveThemeModes;
      themeName: string;
    };
  }): Promise<{
    success: boolean;
    data: {
      draftFile: DraftFile;
      publishType: PublishType;
    };
    error?: string;
  }> {
    try {
      if (
        (publishType === "theme" || publishType === "both") &&
        (!theme || !theme.themeName || theme.themeName.trim() === "")
      ) {
        return {
          success: false,
          data: {
            draftFile: this.draftFileContent,
            publishType,
          },
          error: "Theme name missing",
        };
      }

      if ((publishType === "theme" || publishType === "both") && theme) {
        const tc = await ThemeController.create();
        await tc.handleSaveTheme(
          {
            mode: theme.mode,
            themeName: theme.themeName,
            draftState: this.draftFileContent.draftState,
          },
          this.context
        );
      }

      await this.revertToOldSettings(publishType);
      return {
        success: true,
        data: {
          draftFile: this.draftFileContent,
          publishType,
        },
      };
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      console.log(error);
      return {
        success: false,
        error,
        data: {
          draftFile: this.draftFileContent,
          publishType,
        },
      };
    }
  }

  /**
   * Revert everything to the old settings stored before editing began.
   * Used after saving draft into theme.json.
   */
  public async revertToOldSettings(
    saveTrigger: PublishType | "discard_all"
  ): Promise<void> {
    try {
      const { oldSettings, draftState } = this.draftFileContent;

      if (saveTrigger === "both" || saveTrigger === "theme") {
        // Colors
        if (Object.keys(oldSettings.colorCustomization).length) {
          await this.revertConfigSection(
            "workbench.colorCustomizations",
            oldSettings.colorCustomization,
            (existing, oldValues) => {
              const reverted = { ...existing };
              for (const [key, val] of Object.entries(oldValues)) {
                if (val === "") delete reverted[key];
                else reverted[key] = val;
              }
              return reverted;
            }
          );
        }

        // Tokens
        if (Object.keys(oldSettings.tokenCustomization).length) {
          await this.revertConfigSection(
            "editor.tokenColorCustomizations",
            oldSettings.tokenCustomization,
            (existing, oldValues) => {
              const reverted = { ...existing };
              for (const [key, val] of Object.entries(oldValues)) {
                if (val === "") delete reverted[key];
                else reverted[key] = val;
              }
              return reverted;
            }
          );
        }

        // Semantic tokens
        if (Object.keys(oldSettings.semanticTokenCustomization).length) {
          await this.revertConfigSection(
            "editor.semanticTokenColorCustomizations",
            oldSettings.semanticTokenCustomization,
            (existing, oldValues) => {
              const reverted = { ...existing };
              for (const [key, val] of Object.entries(oldValues)) {
                if (!val) delete reverted[key];
                else reverted[key] = val;
              }
              return reverted;
            }
          );
        }
      }
      if (saveTrigger === "discard_all") {
        // General settings
        const config = await this.getVSCodeConfig();
        for (const [key, val] of Object.entries(
          oldSettings.settingsCustomization
        )) {
          await config.update(key, val, vscode.ConfigurationTarget.Global);
        }
      }
      const overrideDraft = { ...defaultDraft };
      if (saveTrigger === "settings") {
        overrideDraft.draftState = { ...draftState, settingsCustomization: {} };
        overrideDraft.oldSettings = {
          ...oldSettings,
          settingsCustomization: {},
        };
      }
      if (saveTrigger === "theme") {
        overrideDraft.draftState = {
          ...draftState,
          colorCustomization: {},
          semanticTokenCustomization: {},
          tokenCustomization: {},
        };
        overrideDraft.oldSettings = {
          ...oldSettings,
          colorCustomization: {},
          semanticTokenCustomization: {},
          tokenCustomization: {},
        };
      }
      this.draftFileContent = { ...overrideDraft };
      await this.writeFile();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  public async discardChanges(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.revertToOldSettings("discard_all");
      return { success: true };
    } catch (e) {
      log("error while discarding changes", e);
      return {
        success: false,
        error: "Failed to discard changes",
      };
    }
  }
  private async updateConfigSection<T extends Record<string, any>>(
    section: string,
    mergeFn: (existing: T) => T
  ) {
    const config = await this.getVSCodeConfig();
    const existing = config.get<T>(section) ?? ({} as T);
    const merged = mergeFn(existing);
    await config.update(section, merged, vscode.ConfigurationTarget.Global);
  }
  private async updateSettingsConfig<T extends string | boolean | number>(
    section: string,
    mergeFn: (existing: T) => T
  ) {
    const config = await this.getVSCodeConfig();
    const existing = config.get<T>(section) ?? ({} as T);
    const merged = mergeFn(existing);

    await config.update(section, merged, vscode.ConfigurationTarget.Global);
  }

  private async revertConfigSection<T extends Record<string, any>>(
    section: string,
    oldValues: T,
    normalize: (existing: T, oldValues: T) => T
  ) {
    const config = await this.getVSCodeConfig();
    const existing = config.get<T>(section) ?? ({} as T);

    const reverted = normalize(existing, oldValues);

    await config.update(section, reverted, vscode.ConfigurationTarget.Global);
  }
}
