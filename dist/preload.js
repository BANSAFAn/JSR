"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// preload.ts is used to safely expose Electron APIs to the renderer
const electron_1 = require("electron");
// Export API for use in renderer
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getSystemInfo: () => electron_1.ipcRenderer.invoke('get-system-info'),
    getSettings: () => electron_1.ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => electron_1.ipcRenderer.send('save-settings', settings)
});
//# sourceMappingURL=preload.js.map