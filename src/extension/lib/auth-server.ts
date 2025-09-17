import * as http from "http";
import * as vscode from "vscode";
import { AuthUser, AuthSession } from "../../types/user-preferences";
import { log } from "../../lib/debug-logs";

export class AuthServer {
  private server: http.Server | null = null;
  private port: number = 0;
  private authCallback:
    | ((authData: { user: AuthUser; session: AuthSession }) => void)
    | null = null;

  constructor() {}

  /**
   * Start the local auth server
   */
  public async start(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.listen(0, "localhost", () => {
        const address = this.server?.address();
        if (address && typeof address === "object") {
          this.port = address.port;
          log(`[AuthServer] Started on port ${this.port}`);
          resolve(this.port);
        } else {
          reject(new Error("Failed to get server port"));
        }
      });

      this.server.on("error", (error) => {
        log(`[AuthServer] Error: ${error}`);
        reject(error);
      });
    });
  }

  /**
   * Stop the auth server
   */
  public stop(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
      log("[AuthServer] Stopped");
    }
  }

  /**
   * Set the callback for when auth data is received
   */
  public setAuthCallback(
    callback: (authData: { user: AuthUser; session: AuthSession }) => void
  ): void {
    this.authCallback = callback;
  }

  /**
   * Get the server port
   */
  public getPort(): number {
    return this.port;
  }

  /**
   * Get the callback URL for the webapp
   */
  public getCallbackUrl(): string {
    return `http://localhost:${this.port}/auth-callback`;
  }

  /**
   * Handle incoming requests
   */
  private handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): void {
    const url = new URL(req.url || "", `http://localhost:${this.port}`);

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    if (url.pathname === "/auth-callback" && req.method === "POST") {
      this.handleAuthCallback(req, res);
    } else if (url.pathname === "/health" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", port: this.port }));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
    }
  }

  /**
   * Handle auth callback from webapp
   */
  private handleAuthCallback(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): void {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const authData = JSON.parse(body);

        // Validate the auth data structure
        if (this.validateAuthData(authData)) {
          log("[AuthServer] Received valid auth data");

          if (this.authCallback) {
            this.authCallback(authData);
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        } else {
          log("[AuthServer] Invalid auth data received");
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid auth data" }));
        }
      } catch (error) {
        log(`[AuthServer] Error parsing auth data: ${error}`);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  }

  /**
   * Validate auth data structure
   */
  private validateAuthData(
    data: any
  ): data is { user: AuthUser; session: AuthSession } {
    return (
      data &&
      typeof data === "object" &&
      data.user &&
      typeof data.user === "object" &&
      typeof data.user.id === "string" &&
      data.session &&
      typeof data.session === "object" &&
      typeof data.session.id === "string" &&
      typeof data.session.userId === "string"
    );
  }
}
