// Файл preload.js используется для безопасного предоставления API Electron в рендерер
const { contextBridge, ipcRenderer } = require('electron');

// Экспортируем API для использования в рендерере
contextBridge.exposeInMainWorld('electronAPI', {
  // Системная информация
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // Настройки
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // Управление окном
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  
  // Установщик
  isFirstRun: () => ipcRenderer.invoke('is-first-run'),
  getInstallConfig: () => ipcRenderer.invoke('get-install-config'),
  saveInstallConfig: (config) => ipcRenderer.invoke('save-install-config', config),
  selectInstallDirectory: () => ipcRenderer.invoke('select-install-directory'),
  
  // Java
  getJavaInfo: () => ipcRenderer.invoke('get-java-info'),
  
  // Внешние ссылки
  openExternalLink: (url) => ipcRenderer.invoke('open-external-link', url)
});