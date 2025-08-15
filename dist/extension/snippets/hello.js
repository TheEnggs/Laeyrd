"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
function getActive(users) {
    return users.filter((u) => u.active);
}
exports.data = getActive([
    { id: "1", name: "Ada", active: true },
    { id: "2", name: "Grace", active: false },
]);
