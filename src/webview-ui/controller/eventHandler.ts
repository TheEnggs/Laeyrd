import { WebviewEventHandler } from "./webviewEventListener";
const events = new WebviewEventHandler();

// Register actions for each event
events.on("GET_THEME_COLORS", (colors) => {
  console.log("Received theme colors:", colors);

  // update local state, call context, etc.
});

events.on("GET_THEME_TOKEN_COLORS", (tokens) => {
  console.log("Received token colors:", tokens);
});

events.on("SETTINGS_UPDATED", (settings) => {
  console.log("Settings updated:", settings);
});

events.on("ERROR", (message) => {
  console.error("Error from extension:", message);
});

// Example: request theme colors from backend
