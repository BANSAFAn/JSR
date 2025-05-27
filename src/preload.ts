// preload.ts is used to safely expose Electron APIs to the renderer
import { contextBridge, ipcRenderer } from 'electron';

// Export API for use in renderer
contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getJavaInfo: () => ipcRenderer.invoke('get-java-info'),
  getJavaInstallations: () => ipcRenderer.invoke('get-java-installations'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.send('save-settings', settings),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  isFirstRun: () => ipcRenderer.invoke('is-first-run'),
  getInstallConfig: () => ipcRenderer.invoke('get-install-config'),
  saveInstallConfig: (config: any) => ipcRenderer.invoke('save-install-config', config),
  selectInstallDirectory: () => ipcRenderer.invoke('select-install-directory'),
  openExternalLink: (url: string) => ipcRenderer.invoke('open-external-link', url)
});

// Define types for the exposed API
declare global {
  interface Window {
    electronAPI: {
      getSystemInfo: () => Promise<any>;
      getJavaInfo: () => Promise<any>;
      getJavaInstallations: () => Promise<any>;
      getSettings: () => Promise<any>;
      saveSettings: (settings: any) => void;
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
      isFirstRun: () => Promise<boolean>;
      getInstallConfig: () => Promise<any>;
      saveInstallConfig: (config: any) => Promise<boolean>;
      selectInstallDirectory: () => Promise<string | null>;
      openExternalLink: (url: string) => Promise<boolean>;
    }
  }
}