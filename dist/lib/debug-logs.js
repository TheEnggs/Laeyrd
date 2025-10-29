"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = log;
const debug = false; // set false for production
function log(...args) {
    if (debug) {
        console.log("[Laeyrd]", ...args);
    }
}
