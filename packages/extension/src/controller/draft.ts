import {
  DraftChangeHandlerMap,
  DraftFile,
  draftFile,
  DraftStatePayload,
  DraftStatePayloadKeys,
} from "@shared/types/theme";
import { log } from "@shared/utils/debug-logs";
import * as vscode from "vscode";

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
  isSettingsRestored: false,
  isEditing: true,
  isContentSaved: false,
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
  private async writeFile(): Promise<boolean> {
    if (!this.draftFileContent) return false;
    try {
      const filePath = this.getFilePath();
      const bytes = new TextEncoder().encode(
        JSON.stringify(this.draftFileContent, null, 2)
      );
      await vscode.workspace.fs.writeFile(filePath, bytes);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Update the draft state and persist immediately.
   */
  public async applyDraftChanges(
    payload: DraftStatePayload[]
  ): Promise<boolean> {
    const draft = this.draftFileContent;
    const config = await this.getVSCodeConfig();
    const handlers = this.applyDraftChangeHandlers(draft, config);

    payload.forEach((item) => {
      const handlers = this.applyDraftChangeHandlers(draft, config);

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

    draft.lastUpdatedOn = new Date().toISOString();
    this.draftFileContent = draft;
    return await this.writeFile();
  }

  public applyDraftChangeHandlers(
    draft: DraftFile,
    config: vscode.WorkspaceConfiguration
  ): DraftChangeHandlerMap {
    return {
      color: (key: string, value: string) => {
        const oldColors =
          config.get<Record<string, string>>("workbench.colorCustomizations") ||
          {};

        if (!(key in draft.oldSettings.colorCustomization)) {
          draft.oldSettings.colorCustomization[key] = oldColors[key] ?? "";
        }
        draft.draftState.colorCustomization[key] = value;
        this.updateConfigSection(
          "workbench.colorCustomizations",
          (existing) => {
            return {
              ...existing,
              [key]: value,
            };
          }
        );
      },
      token: (key: string, value: string) => {
        const oldTokens =
          config.get<Record<string, string>>(
            "editor.tokenColorCustomizations"
          ) || {};

        if (!(key in draft.oldSettings.tokenCustomization)) {
          draft.oldSettings.tokenCustomization[key] = oldTokens[key] ?? "";
        }

        draft.draftState.tokenCustomization[key] = value;
        this.updateConfigSection(
          "editor.tokenColorCustomizations",
          (existing) => {
            return {
              ...existing,
              [key]: value,
            };
          }
        );
      },
      semanticToken: (key: string, value: { foreground: string }) => {
        const oldTokens =
          config.get<Record<string, any>>(
            "editor.semanticTokenColorCustomizations"
          ) || {};

        if (!(key in draft.oldSettings.semanticTokenCustomization)) {
          draft.oldSettings.semanticTokenCustomization[key] = {
            foreground: oldTokens[key]?.foreground ?? "",
          };
        }

        draft.draftState.semanticTokenCustomization[key] = value;
        this.updateConfigSection(
          "editor.semanticTokenColorCustomizations",
          (existing) => {
            const rules = { ...(existing.rules ?? {}) };
            rules[key] = value;
            return { rules };
          }
        );
      },
      settings: (key: string, value: string | boolean | number) => {
        const oldValue = config.get<string | boolean | number>(key);

        if (!(key in draft.oldSettings.settingsCustomization)) {
          draft.oldSettings.settingsCustomization[key] = oldValue ?? "";
        }

        draft.draftState.settingsCustomization[key] = value;
        this.updateSettingsConfig(key, (existing) => {
          return value;
        });
      },
    };
  }

  public async removeDraftChange(key: string, type: DraftStatePayloadKeys) {
    try {
      const draft = this.draftFileContent.draftState;
      const oldSettings = this.draftFileContent.oldSettings;
      switch (type) {
        case "color": {
          const keyInOldSettings = oldSettings.colorCustomization[key];
          this.updateConfigSection("editor.colorCustomizations", (existing) => {
            const copy = { ...existing };
            if (keyInOldSettings) {
              // restore old value
              existing[key] = keyInOldSettings;
            } else {
              // delete value entirely
              delete copy[key];
            }

            return copy;
          });
          delete draft.colorCustomization[key];
          break;
        }

        case "token": {
          const keyInOldSettings = oldSettings.tokenCustomization[key];
          this.updateConfigSection(
            "editor.tokenColorCustomizations",
            (existing) => {
              const copy = { ...existing };
              if (keyInOldSettings) {
                // restore old value
                existing[key] = keyInOldSettings;
              } else {
                // delete value entirely
                delete copy[key];
              }

              return copy;
            }
          );
          delete draft.tokenCustomization[key];
          break;
        }
        case "semanticToken": {
          const keyInOldSettings = oldSettings.semanticTokenCustomization[key];

          await this.updateConfigSection(
            "editor.semanticTokenColorCustomizations",
            (existing) => {
              const oldRules = existing.rules ?? {};

              let newRules: Record<string, any>;

              if (keyInOldSettings) {
                // restore previous
                newRules = {
                  ...oldRules,
                  [key]: keyInOldSettings,
                };
              } else {
                // remove key by reconstruction
                const { [key]: _, ...rest } = oldRules;
                newRules = rest;
              }

              return { rules: newRules };
            }
          );

          delete draft.semanticTokenCustomization[key];
          break;
        }

        case "settings": {
          const hasKey = key in oldSettings.settingsCustomization;
          this.updateSettingsConfig(key, (existing) => {
            return hasKey ? oldSettings.settingsCustomization[key] : existing;
          });
          delete draft.settingsCustomization[key];
          break;
        }
      }
      await this.writeFile();
      return { success: true, data: { key, type } };
    } catch (e) {
      return { success: false, data: { key, type }, error: e };
    }
  }

  /**
   * Revert everything to the old settings stored before editing began.
   * Used after saving draft into theme.json.
   */
  public async revertToOldSettings(
    action: "afterSave" | "discard" = "afterSave"
  ): Promise<void> {
    if (!this.draftFileContent) return;

    const { oldSettings } = this.draftFileContent;

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
            if (!val || !val.foreground) delete reverted[key];
            else reverted[key] = val;
          }
          return reverted;
        }
      );
    }

    // General settings
    if (action === "discard") {
      const config = await this.getVSCodeConfig();
      for (const [key, val] of Object.entries(
        oldSettings.settingsCustomization
      )) {
        await config.update(key, val, vscode.ConfigurationTarget.Global);
      }
    }

    this.draftFileContent = structuredClone(defaultDraft);
    await this.writeFile();
  }

  public async discardChanges(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.revertToOldSettings("discard");
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
