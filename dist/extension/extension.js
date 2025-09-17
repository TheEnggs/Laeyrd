"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const theme_1 = require("./controller/theme");
const userSettings_1 = require("./controller/userSettings");
const userPreferences_1 = require("./controller/userPreferences");
const auth_1 = require("./controller/auth");
const history_1 = require("./controller/history");
const panelManager_1 = require("./controller/panelManager");
let panelManager;
let authController;
async function activate(context) {
    const controllers = {
        theme: theme_1.ThemeController.getInstance(context),
        userSettings: new userSettings_1.UserSettingsController(context),
        auth: auth_1.AuthController.getInstance(context),
        preferences: userPreferences_1.UserPreferencesController.getInstance(context),
        history: history_1.HistoryController.getInstance(context),
    };
    // Store auth controller reference for cleanup
    controllers.userSettings.ensureOriginalBackup();
    panelManager = new panelManager_1.ThemeYourCodePanelManager(context);
    authController = controllers.auth;
    authController.onAuthChanged((user) => {
        panelManager.messageHandler?.POST_MESSAGE({
            command: "UPDATE_AUTH_USER",
            payload: user || undefined,
            requestId: "",
            status: "success",
        });
    });
    const openCommand = vscode.commands.registerCommand("themeYourCode.open", () => panelManager.open());
    context.subscriptions.push(openCommand, panelManager);
}
function deactivate() {
    // Cleanup auth server when extension is deactivated
    if (authController) {
        authController.dispose();
    }
}
const isDev = false;
