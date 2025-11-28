// src/telemetry.ts
import * as vscode from "vscode";
import TelemetryReporter from "vscode-extension-telemetry";

export class TelemetryService {
  private static _instance: TelemetryService | null = null;

  private reporter: TelemetryReporter | null = null;
  private initialized = false;

  private constructor() {}

  /**
   * Access the singleton instance.
   */
  public static get instance(): TelemetryService {
    if (!this._instance) {
      this._instance = new TelemetryService();
    }
    return this._instance;
  }

  /**
   * Initialize telemetry. Call once during extension activation.
   */
  public init(context: vscode.ExtensionContext): void {
    if (this.initialized) {
      return;
    }

  const appInsightsKey = "1fbf884b-5a35-45ba-8c84-8b21fd6ac538";

    try {
      const extension = vscode.extensions.getExtension(
        "TheEnggs.Laeyrd"
      );

      if (!extension) {
        console.warn("[telemetry] Extension metadata not found");
        return;
      }

      if (!appInsightsKey) {
        console.warn("[telemetry] No Application Insights key. Telemetry disabled.");
        return;
      }

      const extensionId = extension.id;
      const extensionVersion = extension.packageJSON.version;

      this.reporter = new TelemetryReporter(
        extensionId,
        extensionVersion,
        appInsightsKey
      );

      context.subscriptions.push(this.reporter);

      this.initialized = true;
      console.log(
        "[telemetry] Initialized for",
        extensionId,
        extensionVersion
      );
    } catch (error) {
      console.error("[telemetry] Failed to initialize:", error);
      this.reporter = null;
      this.initialized = false;
    }
  }

  /**
   * Send a normal telemetry event.
   */
  public sendEvent(
    name: string,
    properties?: Record<string, string>,
    measurements?: Record<string, number>
  ): void {
    if (!this.reporter || !this.initialized) {
      return;
    }

    try {
      this.reporter.sendTelemetryEvent(name, properties, measurements);
    } catch (error) {
      console.warn("[telemetry] Failed to send event:", name, error);
    }
  }

  /**
   * Send an error telemetry event.
   * Avoid dumping full stack traces / paths into properties.
   */
  public sendError(
    name: string,
    error: unknown,
    properties?: Record<string, string>
  ): void {
    if (!this.reporter || !this.initialized) {
      return;
    }

    const baseProps: Record<string, string> = {
      ...(properties ?? {}),
    };

    if (error instanceof Error) {
      baseProps.message = error.message;
      // Intentionally NOT adding stack to avoid PII
      // baseProps.stack = error.stack ?? "";
    }

    try {
      this.reporter.sendTelemetryErrorEvent(name, baseProps);
    } catch (err) {
      console.warn("[telemetry] Failed to send error event:", name, err);
    }
  }

  /**
   * Dispose reporter on extension deactivate.
   */
  public dispose(): void {
    if (!this.reporter) {
      return;
    }

    this.reporter.dispose();
    this.reporter = null;
    this.initialized = false;
  }
}
