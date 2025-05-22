// preload.ts is used to safely expose Electron APIs to the renderer
import { contextBridge, ipcRenderer } from 'electron';

// Export API for use in renderer
contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getJavaInfo: () => ipcRenderer.invoke('get-java-info'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.send('save-settings', settings),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  isFirstRun: () => ipcRenderer.invoke('is-first-run')
});

// Define types for the exposed API
declare global {
  interface Window {
    electronAPI: {
      getSystemInfo: () => Promise<any>;
      getJavaInfo: () => Promise<any>;
      getSettings: () => Promise<any>;
      saveSettings: (settings: any) => void;
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
      isFirstRun: () => Promise<boolean>;
    }
  }
}