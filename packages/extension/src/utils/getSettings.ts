import * as path from "path";
import * as os from "os";
import * as vscode from "vscode";

type Platform = "linux" | "darwin" | "win32";

export interface ProductConfig {
  /** Display name, e.g. "Visual Studio Code" */
  productName: string;
  /** Internal folder name (used in paths like ~/.config/<baseName>/User/settings.json) */
  baseName: string;
}

const defaultProductMap: Record<string, ProductConfig> = {
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
    baseName: "Antigravity",
  },
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

/**
 * Try to infer a baseName from appRoot or appName for unknown forks.
 */
function inferBaseNameFromEnv(): string | undefined {
  const appName = vscode.env.appName.toLowerCase();
  const appRoot = vscode.env.appRoot; // e.g. /usr/share/code/resources/app

  // 1. check known substrings in appName
  if (appName.includes("vscodium")) return "VSCodium";
  if (appName.includes("cursor")) return "Cursor";
  if (appName.includes("windsurf")) return "Windsurf";
  if (appName.includes("trae")) return "Trae";
  if (appName.includes("antigravity")) return "Antigravity";

  // 2. try to extract something like ".../Code - OSS/resources/app"
  // take last non-empty path segment that isn't "resources" or "app"
  const segments = appRoot.split(/[\\/]/).filter(Boolean);
  const candidate = [...segments]
    .reverse()
    .find((seg) => !/^(resources|app)$/i.test(seg));

  if (candidate) {
    // Best-effort fallback
    return candidate;
  }

  return undefined;
}

/**
 * Allow extension config to override settings path / baseName.
 */
function getConfigOverrides() {
  const config = vscode.workspace.getConfiguration("themeYourCode");
  const explicitPath = config.get<string>("settingsPathOverride");
  const explicitBaseName = config.get<string>("settingsBaseName");
  return { explicitPath, explicitBaseName };
}

export function getSettingsPath(
  fork: keyof typeof defaultProductMap | "auto" = "auto",
  platform: NodeJS.Platform = process.platform
): string {
  const { explicitPath, explicitBaseName } = getConfigOverrides();

  // 1. Highest priority: explicit full path override
  if (explicitPath && explicitPath.trim().length > 0) {
    return explicitPath;
  }

  const normalizedPlatform = platform as Platform;

  // 2. If user set a custom baseName, use that
  if (explicitBaseName && explicitBaseName.trim().length > 0) {
    return resolvePath(explicitBaseName, normalizedPlatform);
  }

  // 3. Use known fork if not "auto"
  if (fork !== "auto") {
    const product = defaultProductMap[fork];
    if (!product) {
      throw new Error(`Unknown fork: ${fork}`);
    }
    return resolvePath(product.baseName, normalizedPlatform);
  }

  // 4. Auto-detect fork, then try map, then fallback inference
  const detectedFork = detectForkInternal();
  const fromMap = defaultProductMap[detectedFork];

  if (fromMap) {
    return resolvePath(fromMap.baseName, normalizedPlatform);
  }

  const inferredBaseName = inferBaseNameFromEnv();
  if (inferredBaseName) {
    return resolvePath(inferredBaseName, normalizedPlatform);
  }

  // 5. Final fallback: default to "Code" like vanilla VS Code
  return resolvePath("Code", normalizedPlatform);
}

// INTERNAL detect fork
function detectForkInternal(): string {
  const appName = vscode.env.appName.toLowerCase();

  if (appName.includes("vscodium")) return "vscodium";
  if (appName.includes("cursor")) return "cursor";
  if (appName.includes("windsurf")) return "windsurf";
  if (appName.includes("trae")) return "trae";
  if (appName.includes("antigravity")) return "antigravity";

  // everything else: treat like VS Code by default
  if (appName.includes("visual studio code") || appName.includes("code")) {
    return "vscode";
  }

  return "unknown";
}

// public API if you still want this
export function detectFork():
  | keyof typeof defaultProductMap
  | "unknown" {
  const fork = detectForkInternal();
  if (fork in defaultProductMap) {
    return fork as keyof typeof defaultProductMap;
  }
  return "unknown";
}

export function getUserSettingsFile(): string {
  return getSettingsPath("auto");
}
