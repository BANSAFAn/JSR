// preload.ts is used to safely expose Electron APIs to the renderer
import { contextBridge, ipcRenderer } from 'electron';

// Export API for use in renderer
contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.send('save-settings', settings)
});

// Define types for the exposed API
declare global {
  interface Window {
    electronAPI: {
      getSystemInfo: () => Promise<any>;
      getSettings: () => Promise<any>;
      saveSettings: (settings: any) => void;
    }
  }
}