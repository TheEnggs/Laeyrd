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
exports.copyCurrentThemeToBase = copyCurrentThemeToBase;
exports.isExpired = isExpired;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const debug_logs_1 = require("../../lib/debug-logs");
async function copyCurrentThemeToBase(context) {
    const currentTheme = vscode.workspace
        .getConfiguration("workbench")
        .get("colorTheme");
    (0, debug_logs_1.log)("Current active theme:", currentTheme);
    // Find theme extension
    const themeExt = vscode.extensions.all.find((ext) => {
        const themes = ext.packageJSON?.contributes?.themes || [];
        return themes.some((t) => t.label === currentTheme || t.id === currentTheme);
    });
    if (!themeExt) {
        console.warn("Theme extension not found for:", currentTheme);
        return;
    }
    // Find theme info
    const themeInfo = themeExt.packageJSON.contributes.themes.find((t) => t.label === currentTheme || t.id === currentTheme);
    if (!themeInfo) {
        console.warn("Theme info not found inside extension:", themeExt.id);
        return;
    }
    // Resolve path
    const themeJsonPath = path.join(themeExt.extensionPath, themeInfo.path);
    const themeJson = JSON.parse(fs.readFileSync(path.join(themeJsonPath), "utf8"));
    const myThemeFolder = path.join(context.extensionPath, "./src/themes");
    if (!fs.existsSync(myThemeFolder))
        fs.mkdirSync(myThemeFolder, { recursive: true });
    const myThemePath = path.join(myThemeFolder, "laeyrd.json");
    fs.writeFileSync(myThemePath, JSON.stringify(themeJson, null, 2));
    // Do not auto-apply theme here to avoid forcing user's selection
    // If needed, provide a command to apply: workbench.colorTheme = "Laeyrd"
}
function isExpired(token, graceSeconds = 30) {
    try {
        const [, payloadBase64] = token.split(".");
        const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf8"));
        const exp = payload.exp;
        if (!exp)
            return true;
        return Date.now() >= (exp - graceSeconds) * 1000;
    }
    catch {
        return true;
    }
}
