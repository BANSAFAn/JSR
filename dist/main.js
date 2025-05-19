"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const electron_store_1 = __importDefault(require("electron-store"));
const si = __importStar(require("systeminformation"));
// Initialize settings storage
const store = new electron_store_1.default();
// Проверка первого запуска
const isFirstRun = !store.has('installed') || !store.get('installed');
// Очистка старых данных при необходимости
if (store.has('appName') && store.get('appName') === 'Minecraft Java Finder 2023') {
    store.clear();
    store.set('appName', 'JSR');
}
// Save window reference to prevent automatic closing
let mainWindow;
function createWindow() {
    // Create browser window
    mainWindow = new electron_1.BrowserWindow({
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
    const indexPath = electron_1.app.isPackaged
        ? path.join(__dirname, '../index.html') // Путь в продакшн сборке
        : path.join(__dirname, '../index.html'); // Путь в режиме разработки
    // Установка пути к стилям
    if (electron_1.app.isPackaged && mainWindow) {
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
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
// Quit when all windows are closed, except on macOS
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
// Get system information
electron_1.ipcMain.handle('get-system-info', async () => {
    try {
        // Используем try-catch для каждого вызова, чтобы получить максимум информации
        let cpuInfo = { manufacturer: 'Unknown', brand: 'Unknown', cores: 0 };
        let memInfo = { total: 0 };
        let osInfo = { platform: 'Unknown', release: 'Unknown', arch: 'Unknown' };
        // Используем тип, совместимый с возвращаемым значением si.graphics()
        let graphicsInfo = { controllers: [] };
        try {
            cpuInfo = await si.cpu();
        }
        catch (e) {
            console.error('Error getting CPU info:', e);
        }
        try {
            memInfo = await si.mem();
        }
        catch (e) {
            console.error('Error getting memory info:', e);
        }
        try {
            osInfo = await si.osInfo();
        }
        catch (e) {
            console.error('Error getting OS info:', e);
        }
        try {
            graphicsInfo = await si.graphics();
        }
        catch (e) {
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
    }
    catch (error) {
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
electron_1.ipcMain.on('save-settings', (event, settings) => {
    store.set('settings', settings);
});
// Get settings
electron_1.ipcMain.handle('get-settings', () => {
    return store.get('settings', {
        theme: 'light',
        language: 'en'
    });
});
// Проверка первого запуска
electron_1.ipcMain.handle('is-first-run', () => {
    return isFirstRun;
});
// Получение настроек установки
electron_1.ipcMain.handle('get-install-config', () => {
    return store.get('install-config', {
        installDir: path.join(electron_1.app.getPath('appData'), 'JSR'),
        language: 'ru',
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        autoStart: false
    });
});
// Получение информации о Java
electron_1.ipcMain.handle('get-java-info', async () => {
    try {
        const javaInfo = await si.versions();
        return javaInfo;
    }
    catch (error) {
        console.error('Error getting Java information:', error);
        return { error: error.message };
    }
});
// Открытие внешних ссылок
electron_1.ipcMain.handle('open-external-link', async (event, url) => {
    try {
        await electron_1.shell.openExternal(url);
        return true;
    }
    catch (error) {
        console.error('Error opening external link:', error);
        return false;
    }
});
// Сохранение настроек установки
electron_1.ipcMain.handle('save-install-config', (event, config) => {
    store.set('install-config', config);
    store.set('installed', true);
    store.set('settings.language', config.language);
    return true;
});
// Выбор директории установки
electron_1.ipcMain.handle('select-install-directory', async () => {
    const { canceled, filePaths } = await electron_1.dialog.showOpenDialog({
        title: 'Выберите папку для установки JSR',
        properties: ['openDirectory', 'createDirectory']
    });
    if (canceled || filePaths.length === 0) {
        return null;
    }
    return filePaths[0];
});
//# sourceMappingURL=main.js.map