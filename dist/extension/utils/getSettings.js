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
exports.productMap = void 0;
exports.getSettingsPath = getSettingsPath;
exports.detectFork = detectFork;
exports.getUserSettingsFile = getUserSettingsFile;
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const vscode = __importStar(require("vscode"));
exports.productMap = {
    vscode: {
        productName: "Visual Studio Code",
        baseName: "Code",
    },
    vscodium: {
        productName: "VSCodium",
        baseName: "VSCodium",
    },
    cursor: {
        productName: "Cursor",
        baseName: "Cursor",
    },
    // 🚀 add more forks here easily
};
function resolvePath(baseName, platform) {
    switch (platform) {
        case "linux":
            return path.join(os.homedir(), ".config", baseName, "User", "settings.json");
        case "darwin":
            return path.join(os.homedir(), "Library", "Application Support", baseName, "User", "settings.json");
        case "win32":
            return path.join(process.env.APPDATA || "", baseName, "User", "settings.json");
        default:
            throw new Error(`Unsupported platform: ${platform}`);
    }
}
function getSettingsPath(fork, platform = process.platform) {
    const product = exports.productMap[fork];
    if (!product)
        throw new Error(`Unknown fork: ${fork}`);
    return resolvePath(product.baseName, platform);
}
// Auto-detect fork
function detectFork() {
    const appName = vscode.env.appName.toLowerCase();
    if (appName.includes("vscodium"))
        return "vscodium";
    if (appName.includes("cursor"))
        return "cursor";
    return "vscode";
}
function getUserSettingsFile() {
    const fork = detectFork();
    return getSettingsPath(fork);
}
