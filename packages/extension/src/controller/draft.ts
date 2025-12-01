import {
  DraftChangeHandlerMap,
  DraftFile,
  DraftStatePayload,
  DraftTokenColorSettings,
  TextMateTokenRule,
  ThemeJson,
  TokenColorSettings,
  UserTokenColors,
  draftFile,
} from "@shared/types/theme";
import { log } from "@shared/utils/debug-logs";
import * as vscode from "vscode";
import { ThemeController } from "./theme";
import { PublishType, SaveThemeModes } from "@shared/types/event";
import {
  generateSemanticTokenColors,
  generateTextMateTokenColors,
} from "@shared/utils/themeGenerator";
import { convertDraftUserTokenColorsToTokenColors } from "@shared/data/token/tokenList";

const defaultDraft: DraftFile = {
  lastUpdatedOn: new Date().toISOString(),
  draftState: {
    colorCustomization: {},
    tokenCustomization: {},
    settingsCustomization: {},
  },
  oldSettings: {
    colorCustomization: {},
    tokenCustomization: {},
    settingsCustomization: {},
  },
  isSettingsRestored: true,
  isEditing: false,
  isContentSaved: false,
};

type DraftHandlerContext = {
  existingColors: Record<string, string>;
  existingTokenColors: Record<string, TokenColorSettings>;
  existingSemanticRules: Record<string, TokenColorSettings>;
  pendingColors: Record<string, string>;
  pendingTokenColors: Record<string, TokenColorSettings>;
  pendingSemanticRules: Record<string, TokenColorSettings>;
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
      if (!fileContent) {
        throw new Error("Failed to read file content");
      }
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
      const bytes = await vscode.workspace.fs.readFile(filePath),
        content = new TextDecoder().decode(bytes),
        parsed = JSON.parse(content),
        validate = draftFile.safeParse(parsed);
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
    if (!this.draftFileContent) {
      throw new Error("No draft file content");
    }
    try {
      const filePath = this.getFilePath(),
        bytes = new TextEncoder().encode(
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
    const originalTheme = (await ThemeController.getInstance(this.context))
        .currentTheme,
      draft = { ...this.draftFileContent },
      config = await this.getVSCodeConfig(),
      // Take snapshots ONCE so we don't keep reading config
      existingColors =
        config.get<Record<string, string>>("workbench.colorCustomizations") ||
        {},
      // Accumulators for new values
      pendingColors: Record<string, string> = {},
      pendingTokenColors: TextMateTokenRule[] = [],
      pendingSemanticRules: UserTokenColors = {},
      pendingSettings: Record<string, string | number | boolean> = {};
    console.log("payload", payload);

    // Process all payload items, but don't touch config yet
    payload.forEach((item) => {
      const key = item.key;

      switch (item.type) {
        case "color": {
          const value = item.value as Extract<
            DraftStatePayload,
            { type: typeof item.type }
          >["value"];
          if (!(key in draft.oldSettings.colorCustomization)) {
            draft.oldSettings.colorCustomization[key] =
              existingColors[key] ?? "";
          }
          draft.draftState.colorCustomization[key] = value;
          pendingColors[key] = value;
          break;
        }

        case "token": {
          if (!originalTheme)
            throw new Error(
              "Something went wrong while saving the token colors"
            );
          const value = item.value as Extract<
            DraftStatePayload,
            { type: typeof item.type }
          >["value"];
          const getTokenColoredMap = convertDraftUserTokenColorsToTokenColors({
              [key]: value as DraftTokenColorSettings,
            }),
            generatedScopedTokenColors =
              generateTextMateTokenColors(getTokenColoredMap),
            generatedSemanticTokenColors = generateSemanticTokenColors(
              originalTheme?.semanticTokenColors,
              getTokenColoredMap
            );
          console.log("getTokenMap", getTokenColoredMap);
          console.log("generatedScopedTokenColors", generatedScopedTokenColors);
          console.log(
            "generatedSemanticTokenColors",
            generatedSemanticTokenColors
          );
          // Add/overwrite with your new rules
          for (const rule of generatedScopedTokenColors) {
            pendingTokenColors.push(rule);
            // draft.draftState.tokenCustomization[key] = rule.settings;
          }
          for (const [key, value] of Object.entries(
            generatedSemanticTokenColors
          )) {
            pendingSemanticRules[key] = value;
          }
          draft.draftState.tokenCustomization[key] = value;
          break;
        }

        case "settings": {
          const value = item.value as Extract<
            DraftStatePayload,
            { type: typeof item.type }
          >["value"];
          pendingSettings[key] = value;
          break;
        }
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
    if (pendingTokenColors.length > 0) {
      await this.updateConfigSection<Record<string, any>>(
        "editor.tokenColorCustomizations",
        (existing) => {
          const existingRules: TextMateTokenRule[] =
            existing?.textMateRules ?? [];
          // Remove any existing rules that are being updated
          const filteredExistingRules = existingRules.filter(
            (rule) => !pendingTokenColors.some((p) => p.name === rule.name)
          );
          return {
            ...(existing ?? {}),
            textMateRules: [...filteredExistingRules, ...pendingTokenColors], // Convert map back to array
          };
        }
      );
    }

    // 3. editor.semanticTokenColorCustomizations
    if (Object.keys(pendingSemanticRules).length > 0) {
      await this.updateConfigSection<{
        rules?: Record<string, TokenColorSettings>;
      }>("editor.semanticTokenColorCustomizations", (existing) => {
        const rules = { ...(existing.rules ?? {}) };
        // Remove any existing rules that are being updated
        for (const key of Object.keys(pendingSemanticRules)) {
          if (key in rules) {
            delete rules[key];
          }
        }
        return {
          enabled: true,
          ...existing,
          rules: { ...rules, ...pendingSemanticRules },
        };
      });
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
    console.log("updated draft", draft);

    return await this.writeFile();
  }

  public async removeDraftChange(payload: DraftStatePayload[]) {
    const successData: DraftStatePayload[] = [];
    try {
      const draft = this.draftFileContent.draftState,
        { oldSettings } = this.draftFileContent,
        colorCustomizations = payload.filter((p) => p.type === "color"),
        tokenCustomizations = payload.filter((p) => p.type === "token"),
        settingsCustomizations = payload.filter((p) => p.type === "settings");

      if (colorCustomizations.length > 0) {
        await this.updateConfigSection(
          "workbench.colorCustomizations",
          (existing) => {
            const copy = { ...existing };
            colorCustomizations.forEach(({ key, value, type }) => {
              const keyInOldSettings = oldSettings.colorCustomization[key];
              if (keyInOldSettings && keyInOldSettings !== "") {
                // Restore old value
                copy[key] = keyInOldSettings;
              } else {
                // Delete value entirely
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
            let existingRules: TextMateTokenRule[] = copy.textMateRules ?? [];
            tokenCustomizations.forEach(({ key, value, type }) => {
              existingRules = existingRules.filter((rule) => rule.name !== key);
              delete draft.tokenCustomization[key];
              successData.push({ key, value, type });
            });
            return { ...copy, textMateRules: existingRules };
          }
        );
        await this.updateConfigSection(
          "editor.semanticTokenColorCustomizations",
          (existing) => {
            const existingRulesMap = new Map(
              Object.entries(existing.rules || {})
            );
            tokenCustomizations.forEach(({ key, value, type }) => {
              const similarTokens = Array.from(existingRulesMap.keys()).filter(
                (semanticKey) =>
                  semanticKey === key ||
                  semanticKey.split(".")[0] === key ||
                  semanticKey.split(":")[0] === key
              );
              similarTokens.forEach((semanticKey) => {
                existingRulesMap.delete(semanticKey);
              });
              delete draft.tokenCustomization[key];
              successData.push({ key, value, type });
            });
            return {
              enabled: true,
              rules: Object.fromEntries(existingRulesMap),
            };
          }
        );
      }
      if (settingsCustomizations.length > 0) {
        settingsCustomizations.forEach(({ key, value, type }) => {
          const hasKey = key in oldSettings.settingsCustomization;
          this.updateSettingsConfig(key, (existing) =>
            hasKey ? oldSettings.settingsCustomization[key] : existing
          );
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
        const tc = await ThemeController.getInstance(this.context);
        await tc.handleSaveTheme({
          mode: theme.mode,
          themeName: theme.themeName,
          draftState: this.draftFileContent.draftState,
        });
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
      const config = await this.getVSCodeConfig();

      if (saveTrigger === "both" || saveTrigger === "theme") {
        // Colors
        if (Object.keys(oldSettings.colorCustomization).length) {
          await this.revertConfigSection(
            "workbench.colorCustomizations",
            oldSettings.colorCustomization,
            (existing, oldValues) => {
              const reverted = { ...existing };
              for (const [key, val] of Object.entries(oldValues)) {
                if (val === "") {
                  delete reverted[key];
                } else {
                  reverted[key] = val;
                }
              }
              return reverted;
            }
          );
        }

        // Tokens
        const existingTokens =
          config.get("editor.tokenColorCustomizations") ?? {};
        await config.update(
          "editor.tokenColorCustomizations",
          { ...existingTokens, textMateRules: [] },
          vscode.ConfigurationTarget.Global
        );

        // Semantic tokens
        const existingSemantics =
          config.get("editor.semanticTokenColorCustomizations") ?? {};
        await config.update(
          "editor.semanticTokenColorCustomizations",
          { ...existingSemantics, rules: {} },
          vscode.ConfigurationTarget.Global
        );
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
          tokenCustomization: {},
        };
        overrideDraft.oldSettings = {
          ...oldSettings,
          colorCustomization: {},
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
    const config = await this.getVSCodeConfig(),
      existing = config.get<T>(section) ?? ({} as T),
      merged = mergeFn(existing);
    await config.update(section, merged, vscode.ConfigurationTarget.Global);
  }
  private async updateSettingsConfig<T extends string | boolean | number>(
    section: string,
    mergeFn: (existing: T) => T
  ) {
    const config = await this.getVSCodeConfig(),
      existing = config.get<T>(section) ?? ({} as T),
      merged = mergeFn(existing);

    await config.update(section, merged, vscode.ConfigurationTarget.Global);
  }

  private async revertConfigSection<T extends Record<string, any>>(
    section: string,
    oldValues: T,
    normalize: (existing: T, oldValues: T) => T
  ) {
    const config = await this.getVSCodeConfig(),
      existing = config.get<T>(section) ?? ({} as T),
      reverted = normalize(existing, oldValues);

    await config.update(section, reverted, vscode.ConfigurationTarget.Global);
  }
}
