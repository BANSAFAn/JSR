"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// preload.ts is used to safely expose Electron APIs to the renderer
const electron_1 = require("electron");
// Export API for use in renderer
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getSystemInfo: () => electron_1.ipcRenderer.invoke('get-system-info'),
    getJavaInfo: () => electron_1.ipcRenderer.invoke('get-java-info'),
    getJavaInstallations: () => electron_1.ipcRenderer.invoke('get-java-installations'),
    getSettings: () => electron_1.ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => electron_1.ipcRenderer.send('save-settings', settings),
    minimizeWindow: () => electron_1.ipcRenderer.send('minimize-window'),
    maximizeWindow: () => electron_1.ipcRenderer.send('maximize-window'),
    closeWindow: () => electron_1.ipcRenderer.send('close-window'),
    isFirstRun: () => electron_1.ipcRenderer.invoke('is-first-run'),
    getInstallConfig: () => electron_1.ipcRenderer.invoke('get-install-config'),
    saveInstallConfig: (config) => electron_1.ipcRenderer.invoke('save-install-config', config),
    selectInstallDirectory: () => electron_1.ipcRenderer.invoke('select-install-directory'),
    openExternalLink: (url) => electron_1.ipcRenderer.invoke('open-external-link', url)
});
//# sourceMappingURL=preload.js.map