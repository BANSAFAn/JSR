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
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const splash_screen_1 = require("./splash-screen");
let mainWindow = null;
function createWindow() {
    console.log('Creating window...');
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    const indexPath = path.join(__dirname, '../index.html');
    console.log('Loading:', indexPath);
    mainWindow.loadFile(indexPath);
}
// Create window when Electron is ready
electron_1.app.whenReady().then(() => {
    // Показываем загрузочный экран
    const splashScreen = new splash_screen_1.SplashScreen(() => {
        createWindow();
    });
    splashScreen.create();
    electron_1.app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
    // Обработчики событий для управления окном
    electron_1.ipcMain.on('minimize-window', () => {
        const win = electron_1.BrowserWindow.getFocusedWindow();
        if (win)
            win.minimize();
    });
    electron_1.ipcMain.on('maximize-window', () => {
        const win = electron_1.BrowserWindow.getFocusedWindow();
        if (win) {
            if (win.isMaximized()) {
                win.unmaximize();
            }
            else {
                win.maximize();
            }
        }
    });
    electron_1.ipcMain.on('close-window', () => {
        const win = electron_1.BrowserWindow.getFocusedWindow();
        if (win)
            win.close();
    });
    // Проверка первого запуска
    electron_1.ipcMain.handle('is-first-run', () => {
        const store = new Store();
        const isFirstRun = !store.has('firstRun');
        if (isFirstRun) {
            store.set('firstRun', false);
        }
        return isFirstRun;
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
    }
    catch (error) {
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
electron_1.ipcMain.handle('get-java-info', async () => {
    try {
        // Получаем список установленных программ
        // @ts-ignore - Используем метод programs, который может отсутствовать в типах
        const apps = await si.programs();
        // Фильтруем только Java
        const javaInstallations = apps.filter((app) => app.name.toLowerCase().includes('java') ||
            app.name.toLowerCase().includes('jdk') ||
            app.name.toLowerCase().includes('jre'));
        // Если Java не найдена через системную информацию, пробуем через команды
        if (javaInstallations.length === 0) {
            // Здесь можно добавить дополнительную логику поиска Java через команды
            // Например, выполнить команду 'java -version' и разобрать вывод
        }
        return javaInstallations;
    }
    catch (error) {
        console.error('Error getting Java info:', error);
        return { error: 'Failed to get Java information' };
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
// Дублирующаяся регистрация удалена - используется регистрация в createWindow()
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
electron_1.ipcMain.handle('get-java-installations', async () => {
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
        const javaInfo = javaVersions.java;
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
    }
    catch (error) {
        console.error('Error getting Java installations:', error);
        return [];
    }
});
// Дублирующаяся регистрация удалена - используется основная регистрация выше
// Открытие внешних ссылок
electron_1.ipcMain.handle('open-external-link', async (event, url) => {
    try {
        await shell.openExternal(url);
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
    const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Выберите папку для установки JSR',
        properties: ['openDirectory', 'createDirectory']
    });
    if (canceled || filePaths.length === 0) {
        return null;
    }
    return filePaths[0];
});
//# sourceMappingURL=main.js.map