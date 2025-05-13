// Файл preload.js используется для безопасного предоставления API Electron в рендерер
const { contextBridge, ipcRenderer } = require('electron');

// Экспортируем API для использования в рендерере
contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.send('save-settings', settings)
});