import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import Store from 'electron-store';
import * as si from 'systeminformation';
import * as fs from 'fs';
import { SplashScreen } from './splash-screen';

// Initialize settings storage
const store = new Store();

// Проверка первого запуска
const isFirstRun = !store.has('installed') || !store.get('installed');

// Очистка старых данных при необходимости
if (store.has('appName') && store.get('appName') === 'Minecraft Java Finder 2023') {
  store.clear();
  store.set('appName', 'JSR');
}

// Отключение аппаратного ускорения для предотвращения ошибок GPU
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-sandbox');

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
  
  // Обработчики для кнопок управления окном уже зарегистрированы ниже

  // Load index.html
  // Определяем правильный путь к файлам в зависимости от режима разработки или продакшн
  const indexPath = app.isPackaged
    ? path.join(__dirname, '../index.html') // Путь в продакшн сборке
    : path.join(__dirname, '../../index.html'); // Путь в режиме разработки (из dist обратно в корень)
    
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
  // Показываем загрузочный экран
  const splashScreen = new SplashScreen(() => {
    createWindow();
  });
  splashScreen.create();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  
  // Обработчики событий для управления окном
  ipcMain.on('minimize-window', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.minimize();
  });
  
  ipcMain.on('maximize-window', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });
  
  ipcMain.on('close-window', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.close();
  });
  
  // Проверка первого запуска
  ipcMain.handle('is-first-run', () => {
    const store = new Store();
    const isFirstRun = !store.has('firstRun');
    if (isFirstRun) {
      store.set('firstRun', false);
    }
    return isFirstRun;
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Get system information
ipcMain.handle('get-system-info', async () => {
  try {
    // Получаем более подробную информацию о системе
    const [cpu, mem, os, graphics, diskLayout, battery, baseboard, bios] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.graphics(),
      si.diskLayout(),
      si.battery(),
      si.baseboard(),
      si.bios()
    ]);
    
    // Форматируем информацию для отображения
    const formattedCpu = {
      manufacturer: cpu.manufacturer,
      brand: cpu.brand,
      cores: cpu.cores,
      physicalCores: cpu.physicalCores,
      speed: cpu.speed,
      speedMax: cpu.speedMax
    };
    
    const formattedMem = {
      total: mem.total,
      free: mem.free,
      used: mem.used,
      totalFormatted: `${Math.round(mem.total / (1024 * 1024 * 1024))} GB`,
      freeFormatted: `${Math.round(mem.free / (1024 * 1024 * 1024))} GB`,
      usedFormatted: `${Math.round(mem.used / (1024 * 1024 * 1024))} GB`
    };
    
    const formattedOs = {
      platform: os.platform,
      distro: os.distro,
      release: os.release,
      arch: os.arch,
      hostname: os.hostname
    };
    
    return { 
      cpu: formattedCpu, 
      mem: formattedMem, 
      os: formattedOs, 
      graphics, 
      diskLayout,
      battery,
      baseboard,
      bios
    };
  } catch (error) {
    console.error('Error getting system information:', error);
    return { 
      cpu: { manufacturer: 'Unknown', brand: 'Unknown', cores: 0 },
      mem: { total: 0 },
      os: { platform: process.platform, release: 'Unknown', arch: process.arch },
      graphics: { controllers: [{ model: 'Unknown' }] }
    };
  }
});

// Получение информации о Java на компьютере
ipcMain.handle('get-java-info', async () => {
  try {
    // Получаем список установленных программ
    // @ts-ignore - Используем метод programs, который может отсутствовать в типах
    const apps = await si.programs();
    
    // Фильтруем только Java
    const javaInstallations = apps.filter((app: any) => 
      app.name.toLowerCase().includes('java') || 
      app.name.toLowerCase().includes('jdk') || 
      app.name.toLowerCase().includes('jre')
    );
    
    // Если Java не найдена через системную информацию, пробуем через команды
    if (javaInstallations.length === 0) {
      // Здесь можно добавить дополнительную логику поиска Java через команды
      // Например, выполнить команду 'java -version' и разобрать вывод
    }
    
    return javaInstallations;
  } catch (error) {
    console.error('Error getting Java info:', error);
    return { error: 'Failed to get Java information' };
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

// Дублирующаяся регистрация удалена - используется регистрация в createWindow()

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
ipcMain.handle('get-java-installations', async () => {
  try {
    console.log('Attempting to get Java installations...');
    
    // Получаем информацию о Java через системную информацию
    const javaVersions = await si.versions();
    console.log('Java versions retrieved:', javaVersions);
    
    // Проверяем наличие информации о Java
    if (!javaVersions || !javaVersions.java) {
      console.log('No Java information found in system info');
      return [];
    }
    
    // Определяем тип данных Java
    const javaInfo = javaVersions.java as any;
    
    // Формируем базовую информацию о Java
    const javaInstallation = {
      version: typeof javaInfo === 'string' ? javaInfo : (javaInfo.version || 'Unknown'),
      vendor: typeof javaInfo === 'string' ? 'Unknown' : (javaInfo.vendor || 'Unknown'),
      path: typeof javaInfo === 'string' ? 'Unknown' : (javaInfo.path || 'Unknown'),
      architecture: process.arch,
      isDefault: true
    };
    
    console.log('Returning Java installation:', javaInstallation);
    return [javaInstallation];
  } catch (error) {
    console.error('Error getting Java installations:', error);
    return [];
  }
});

// Дублирующаяся регистрация удалена - используется основная регистрация выше

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