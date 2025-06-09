const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');
const si = require('systeminformation');
const fs = require('fs');
const os = require('os');

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
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/images/Logo.png'),
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    frame: false
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

// Обработчики IPC
ipcMain.handle('get-system-info', async () => {
  try {
    const cpu = await si.cpu();
    const mem = await si.mem();
    const osInfo = await si.osInfo();
    const graphics = await si.graphics();
    
    return {
      cpu: cpu,
      memory: mem,
      os: osInfo,
      gpu: graphics
    };
  } catch (error) {
    console.error('Ошибка при получении системной информации:', error);
    return { error: error.message };
  }
});

ipcMain.handle('save-settings', async (event, settings) => {
  try {
    for (const [key, value] of Object.entries(settings)) {
      store.set(key, value);
    }
    return { success: true };
  } catch (error) {
    console.error('Ошибка при сохранении настроек:', error);
    return { error: error.message };
  }
});

ipcMain.handle('get-settings', async () => {
  try {
    return store.store; // Возвращаем все настройки
  } catch (error) {
    console.error('Ошибка при получении настроек:', error);
    return { error: error.message };
  }
});

// Обработчики для кнопок управления окном
ipcMain.handle('window-minimize', () => {
  mainWindow.minimize();
  return { success: true };
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
    return { maximized: false };
  } else {
    mainWindow.maximize();
    return { maximized: true };
  }
});

ipcMain.handle('window-close', () => {
  mainWindow.close();
  return { success: true };
});

// Функция для поиска Java на компьютере
async function findJavaInstallations() {
  try {
    const javaInstallations = [];
    const platform = process.platform;
    
    if (platform === 'win32') {
      // Поиск в Program Files и Program Files (x86)
      const programDirs = [
        path.join(os.homedir(), '..', 'Program Files', 'Java'),
        path.join(os.homedir(), '..', 'Program Files (x86)', 'Java'),
        // Другие возможные пути для Java
        path.join(os.homedir(), '..', 'Program Files', 'AdoptOpenJDK'),
        path.join(os.homedir(), '..', 'Program Files', 'Eclipse Adoptium')
      ];
      
      for (const dir of programDirs) {
        if (fs.existsSync(dir)) {
          const javaVersions = fs.readdirSync(dir);
          
          for (const version of javaVersions) {
            const javaHome = path.join(dir, version);
            const javaBin = path.join(javaHome, 'bin', 'java.exe');
            
            if (fs.existsSync(javaBin)) {
              // Получаем версию Java
              try {
                const { exec } = require('child_process');
                const javaVersionPromise = new Promise((resolve, reject) => {
                  exec(`"${javaBin}" -version`, { encoding: 'utf8' }, (error, stdout, stderr) => {
                    if (error) {
                      reject(error);
                      return;
                    }
                    // Java выводит версию в stderr
                    const output = stderr || stdout;
                    resolve(output);
                  });
                });
                
                const versionOutput = await javaVersionPromise;
                const versionMatch = versionOutput.match(/version "(.+?)"/); 
                const vendorMatch = versionOutput.match(/(.+?) Runtime Environment/);
                const archMatch = versionOutput.includes('64-Bit') ? '64-bit' : '32-bit';
                
                const versionInfo = {
                  path: javaHome,
                  bin: javaBin,
                  version: versionMatch ? versionMatch[1] : 'Неизвестно',
                  vendor: vendorMatch ? vendorMatch[1] : 'Неизвестно',
                  architecture: archMatch,
                  isDefault: false
                };
                
                javaInstallations.push(versionInfo);
              } catch (error) {
                console.error(`Ошибка при получении версии Java из ${javaBin}:`, error);
              }
            }
          }
        }
      }
      
      // Проверяем JAVA_HOME
      const javaHome = process.env.JAVA_HOME;
      if (javaHome && fs.existsSync(javaHome)) {
        const javaBin = path.join(javaHome, 'bin', 'java.exe');
        if (fs.existsSync(javaBin)) {
          // Помечаем как Java по умолчанию
          const existingIndex = javaInstallations.findIndex(j => j.path === javaHome);
          
          if (existingIndex >= 0) {
            javaInstallations[existingIndex].isDefault = true;
          } else {
            try {
              const { exec } = require('child_process');
              const javaVersionPromise = new Promise((resolve, reject) => {
                exec(`"${javaBin}" -version`, { encoding: 'utf8' }, (error, stdout, stderr) => {
                  if (error) {
                    reject(error);
                    return;
                  }
                  const output = stderr || stdout;
                  resolve(output);
                });
              });
              
              const versionOutput = await javaVersionPromise;
              const versionMatch = versionOutput.match(/version "(.+?)"/); 
              const vendorMatch = versionOutput.match(/(.+?) Runtime Environment/);
              const archMatch = versionOutput.includes('64-Bit') ? '64-bit' : '32-bit';
              
              const versionInfo = {
                path: javaHome,
                bin: javaBin,
                version: versionMatch ? versionMatch[1] : 'Неизвестно',
                vendor: vendorMatch ? vendorMatch[1] : 'Неизвестно',
                architecture: archMatch,
                isDefault: true
              };
              
              javaInstallations.push(versionInfo);
            } catch (error) {
              console.error(`Ошибка при получении версии Java из ${javaBin}:`, error);
            }
          }
        }
      }
    } else if (platform === 'darwin' || platform === 'linux') {
      // Реализация для macOS и Linux
      // ...
    }
    
    return javaInstallations;
  } catch (error) {
    console.error('Ошибка при поиске Java:', error);
    return [];
  }
}

// Обработчик для получения информации о Java
ipcMain.handle('get-java-info', async () => {
  try {
    const javaInstallations = await findJavaInstallations();
    return { installations: javaInstallations };
  } catch (error) {
    console.error('Ошибка при получении информации о Java:', error);
    return { error: error.message };
  }
});

// Обработчик для открытия ссылок в браузере
ipcMain.handle('open-external-link', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('Ошибка при открытии внешней ссылки:', error);
    return { error: error.message };
  }
});