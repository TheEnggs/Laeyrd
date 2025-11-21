import * as path from "path";
import * as os from "os";
import * as vscode from "vscode";

type Platform = "linux" | "darwin" | "win32";

export interface ProductConfig {
  // Display name, e.g. "Visual Studio Code"
  productName: string;
  // Internal folder name (used in paths)
  baseName: string;
}

export const productMap: Record<string, ProductConfig> = {
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
  windsurf: {
    productName: "Windsurf",
    baseName: "Windsurf",
  },
  trae: {
    productName: "Trae",
    baseName: "Trae",
  },
  antigravity: {
    productName: "Antigravity",
    baseName: "Antigravity"
  }
  // add more as needed
};

function resolvePath(baseName: string, platform: Platform): string {
  switch (platform) {
    case "linux":
      return path.join(
        os.homedir(),
        ".config",
        baseName,
        "User",
        "settings.json"
      );
    case "darwin":
      return path.join(
        os.homedir(),
        "Library",
        "Application Support",
        baseName,
        "User",
        "settings.json"
      );
    case "win32":
      return path.join(
        process.env.APPDATA || "",
        baseName,
        "User",
        "settings.json"
      );
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

export function getSettingsPath(
  fork: keyof typeof productMap,
  platform: NodeJS.Platform = process.platform
): string {
  const product = productMap[fork];
  if (!product) throw new Error(`Unknown fork: ${fork}`);
  return resolvePath(product.baseName, platform as Platform);
}

// Auto-detect fork
export function detectFork(): keyof typeof productMap {
  const appName = vscode.env.appName.toLowerCase();
  if (appName.includes("vscodium")) return "vscodium";
  if (appName.includes("cursor")) return "cursor";
  return "vscode";
}

export function getUserSettingsFile(): string {
  const fork = detectFork();
  return getSettingsPath(fork);
}
