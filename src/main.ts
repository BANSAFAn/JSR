import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import Store from 'electron-store';
import * as si from 'systeminformation';
import * as fs from 'fs';

// Initialize settings storage
const store = new Store();

// Проверка первого запуска
const isFirstRun = !store.has('installed') || !store.get('installed');

// Очистка старых данных при необходимости
if (store.has('appName') && store.get('appName') === 'Minecraft Java Finder 2023') {
  store.clear();
  store.set('appName', 'JSR');
}

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
    icon: path.join(__dirname, '../assets/images/Logo.png'),
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    frame: true
  });

  // Load index.html
  // Определяем правильный путь к файлам в зависимости от режима разработки или продакшн
  const indexPath = app.isPackaged
    ? path.join(__dirname, '../index.html') // Путь в продакшн сборке
    : path.join(__dirname, '../index.html'); // Путь в режиме разработки
    
  // Установка пути к стилям
  if (app.isPackaged && mainWindow) {
    mainWindow.webContents.on('did-finish-load', () => {
      if (mainWindow) {
        mainWindow.webContents.insertCSS(`
          @import url('${path.join(__dirname, '../styles/main.css').replace(/\\/g, '/')}');
          @import url('${path.join(__dirname, '../styles/themes/light.css').replace(/\\/g, '/')}');
        `);
      }
    });  
  }
  
  if (mainWindow) {
    mainWindow.loadFile(indexPath);
  }

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
    // Используем try-catch для каждого вызова, чтобы получить максимум информации
    let cpuInfo = { manufacturer: 'Unknown', brand: 'Unknown', cores: 0 };
    let memInfo = { total: 0 };
    let osInfo = { platform: 'Unknown', release: 'Unknown', arch: 'Unknown' };
    let graphicsInfo = { controllers: [] };
    
    try {
      cpuInfo = await si.cpu();
    } catch (e) {
      console.error('Error getting CPU info:', e);
    }
    
    try {
      memInfo = await si.mem();
    } catch (e) {
      console.error('Error getting memory info:', e);
    }
    
    try {
      osInfo = await si.osInfo();
    } catch (e) {
      console.error('Error getting OS info:', e);
    }
    
    try {
      graphicsInfo = await si.graphics();
    } catch (e) {
      console.error('Error getting graphics info:', e);
      // Исправление типизации для контроллеров графики
      graphicsInfo = { controllers: [{ model: 'Unknown' }] };
    }
    
    return {
      cpu: cpuInfo,
      mem: memInfo,
      os: osInfo,
      graphics: graphicsInfo
    };
  } catch (error) {
    console.error('Error getting system information:', error);
    // Возвращаем базовую информацию, чтобы интерфейс не сломался
    return { 
      cpu: { manufacturer: 'Unknown', brand: 'Unknown', cores: 0 },
      mem: { total: 0 },
      os: { platform: process.platform, release: 'Unknown', arch: process.arch },
      graphics: { controllers: [{ model: 'Unknown' }] }
    };
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

// Проверка первого запуска
ipcMain.handle('is-first-run', () => {
  return isFirstRun;
});

// Получение настроек установки
ipcMain.handle('get-install-config', () => {
  return store.get('install-config', {
    installDir: path.join(app.getPath('appData'), 'JSR'),
    language: 'ru',
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    autoStart: false
  });
});

// Получение информации о Java
ipcMain.handle('get-java-info', async () => {
  try {
    const javaInfo = await si.versions();
    return javaInfo;
  } catch (error) {
    console.error('Error getting Java information:', error);
    return { error: (error as Error).message };
  }
});

// Открытие внешних ссылок
ipcMain.handle('open-external-link', async (event, url) => {
  try {
    await shell.openExternal(url);
    return true;
  } catch (error) {
    console.error('Error opening external link:', error);
    return false;
  }
});

// Сохранение настроек установки
ipcMain.handle('save-install-config', (event, config) => {
  store.set('install-config', config);
  store.set('installed', true);
  store.set('settings.language', config.language);
  return true;
});

// Выбор директории установки
ipcMain.handle('select-install-directory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Выберите папку для установки JSR',
    properties: ['openDirectory', 'createDirectory']
  });
  
  if (canceled || filePaths.length === 0) {
    return null;
  }
  
  return filePaths[0];
});