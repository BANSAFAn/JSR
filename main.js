const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
const si = require('systeminformation');

// Инициализация хранилища настроек
const store = new Store();

// Сохраняем ссылку на окно, чтобы предотвратить автоматическое закрытие
let mainWindow;

function createWindow() {
  // Создаем окно браузера
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icons/icon.png')
  });

  // Загружаем index.html
  mainWindow.loadFile('index.html');

  // Открываем DevTools в режиме разработки
  // mainWindow.webContents.openDevTools();
}

// Создаем окно, когда Electron будет готов
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // На macOS обычно пересоздают окно в приложении, когда
    // на иконку в доке нажимают и нет других открытых окон
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Выход, когда все окна будут закрыты, кроме macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Получение системной информации
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
    console.error('Ошибка при получении системной информации:', error);
    return { error: error.message };
  }
});

// Сохранение настроек
ipcMain.on('save-settings', (event, settings) => {
  store.set('settings', settings);
});

// Получение настроек
ipcMain.handle('get-settings', () => {
  return store.get('settings', {
    theme: 'light',
    language: 'en'
  });
});