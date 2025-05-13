import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import Store from 'electron-store';
import * as si from 'systeminformation';

// Initialize settings storage
const store = new Store();

// Save window reference to prevent automatic closing
let mainWindow: BrowserWindow | null;

function createWindow(): void {
  // Create browser window
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, '../preload.js')
    },
    icon: path.join(__dirname, '../assets/icons/icon.png')
  });

  // Load index.html
  mainWindow.loadFile(path.join(__dirname, '../index.html'));

  // Open DevTools in development mode
  // mainWindow.webContents.openDevTools();
}

// Create window when Electron is ready
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Get system information
ipcMain.handle('get-system-info', async () => {
  try {
    const cpu = await si.cpu();
    const mem = await si.mem();
    const os = await si.osInfo();
    const graphics = await si.graphics();
    
    return {
      cpu,
      mem,
      os,
      graphics
    };
  } catch (error) {
    console.error('Error getting system information:', error);
    return { error: (error as Error).message };
  }
});

// Save settings
ipcMain.on('save-settings', (event, settings) => {
  store.set('settings', settings);
});

// Get settings
ipcMain.handle('get-settings', () => {
  return store.get('settings', {
    theme: 'light',
    language: 'en'
  });
});