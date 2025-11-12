import { DraftFile, draftFile, DraftStatePayload } from "@shared/types/theme";
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
  public async writeChangesToFile(
    payload: DraftStatePayload[]
  ): Promise<boolean> {
    const draft = this.draftFileContent;
    const config = await this.getVSCodeConfig();
    payload.forEach((item: DraftStatePayload) => {
      const { key, value, type } = item;
      // Store old values before overwriting them
      switch (type) {
        case "color": {
          const oldColors =
            config.get<Record<string, string>>(
              "workbench.colorCustomizations"
            ) || {};
          if (!(key in draft.oldSettings.colorCustomization)) {
            draft.oldSettings.colorCustomization[key] = oldColors[key] ?? "";
          }
          draft.draftState.colorCustomization[key] = value;
          break;
        }
        case "token": {
          const oldTokens =
            config.get<Record<string, string>>(
              "editor.tokenColorCustomizations"
            ) || {};
          if (!(key in draft.oldSettings.tokenCustomization)) {
            draft.oldSettings.tokenCustomization[key] = oldTokens[key] ?? "";
          }
          draft.draftState.tokenCustomization[key] = value;
          break;
        }
        case "semanticToken": {
          const oldTokens =
            config.get<Record<string, string>>(
              "editor.semanticTokenColorCustomizations"
            ) || {};
          if (!(key in draft.oldSettings.semanticTokenCustomization)) {
            draft.oldSettings.semanticTokenCustomization[key] = {
              foreground: oldTokens[key] ?? "",
            };
          }

          draft.draftState.semanticTokenCustomization[key] = value;
          break;
        }
        case "settings": {
          const oldSetting = config.get<string>(key);
          if (!(key in draft.oldSettings.settingsCustomization)) {
            draft.oldSettings.settingsCustomization[key] = oldSetting ?? "";
          }
          draft.draftState.settingsCustomization[key] = value;
          break;
        }
      }
    });
    draft.lastUpdatedOn = new Date().toISOString();
    this.draftFileContent = draft;
    await this.applyDraftToVSCode();
    return await this.writeFile();
  }

  /**
   * Apply all draft changes into VSCode for live preview.
   */
  public async applyDraftToVSCode(): Promise<void> {
    if (!this.draftFileContent) return;
    const { draftState } = this.draftFileContent;
    const config = await this.getVSCodeConfig();

    // Merge and apply color customizations
    if (Object.keys(draftState.colorCustomization).length) {
      const existingColors =
        config.get<Record<string, any>>("workbench.colorCustomizations") ?? {};
      const mergedColors = {
        ...existingColors,
        ...draftState.colorCustomization,
      };

      await config.update(
        "workbench.colorCustomizations",
        mergedColors,
        vscode.ConfigurationTarget.Global
      );
    }

    // Merge and apply token customizations
    if (Object.keys(draftState.tokenCustomization).length) {
      const existingTokens =
        config.get<Record<string, any>>("editor.tokenColorCustomizations") ??
        {};
      const mergedTokens = {
        ...existingTokens,
        ...draftState.tokenCustomization,
      };

      await config.update(
        "editor.tokenColorCustomizations",
        mergedTokens,
        vscode.ConfigurationTarget.Global
      );
    }

    // Merge and apply semantic token customizations
    if (Object.keys(draftState.semanticTokenCustomization).length) {
      const existingSemantic =
        config.get<Record<string, any>>(
          "editor.semanticTokenColorCustomizations"
        ) ?? {};
      const mergedSemantic = {
        rules: {
          ...existingSemantic,
          ...draftState.semanticTokenCustomization,
        },
      };

      await config.update(
        "editor.semanticTokenColorCustomizations",
        mergedSemantic,
        vscode.ConfigurationTarget.Global
      );
    }

    // Apply regular settings one by one
    for (const [key, value] of Object.entries(
      draftState.settingsCustomization
    )) {
      await config.update(key, value, vscode.ConfigurationTarget.Global);
    }

    this.draftFileContent.isEditing = true;
    await this.writeFile();
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
    const config = await this.getVSCodeConfig();

    // Revert color customizations (merge back)
    if (Object.keys(oldSettings.colorCustomization).length) {
      const existingColors =
        config.get<Record<string, any>>("workbench.colorCustomizations") ?? {};
      const revertedColors = { ...existingColors };

      for (const [key, value] of Object.entries(
        oldSettings.colorCustomization
      )) {
        if (value === "") delete revertedColors[key];
        else revertedColors[key] = value;
      }

      await config.update(
        "workbench.colorCustomizations",
        revertedColors,
        vscode.ConfigurationTarget.Global
      );
    }

    // Revert token customizations
    if (Object.keys(oldSettings.tokenCustomization).length) {
      const existingTokens =
        config.get<Record<string, any>>("editor.tokenColorCustomizations") ??
        {};
      const revertedTokens = { ...existingTokens };

      for (const [key, value] of Object.entries(
        oldSettings.tokenCustomization
      )) {
        if (value === "") delete revertedTokens[key];
        else revertedTokens[key] = value;
      }

      await config.update(
        "editor.tokenColorCustomizations",
        revertedTokens,
        vscode.ConfigurationTarget.Global
      );
    }

    // Revert semantic tokens
    if (Object.keys(oldSettings.semanticTokenCustomization).length) {
      const existingSemantic =
        config.get<Record<string, any>>(
          "editor.semanticTokenColorCustomizations"
        ) ?? {};
      const revertedSemantic = { ...existingSemantic };

      for (const [key, value] of Object.entries(
        oldSettings.semanticTokenCustomization
      )) {
        if (!value || !value.foreground) delete revertedSemantic[key];
        else revertedSemantic[key] = value;
      }

      await config.update(
        "editor.semanticTokenColorCustomizations",
        revertedSemantic,
        vscode.ConfigurationTarget.Global
      );
    }

    // Revert general settings
    if (action === "discard") {
      for (const [key, value] of Object.entries(
        oldSettings.settingsCustomization
      )) {
        await config.update(key, value, vscode.ConfigurationTarget.Global);
      }
    }

    // Reset draft file
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
}
