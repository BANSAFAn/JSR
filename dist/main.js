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
        icon: path.join(__dirname, '../assets/icons/icon.png')
    });
    // Load index.html
    mainWindow.loadFile(path.join(__dirname, '../index.html'));
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
    }
    catch (error) {
        console.error('Error getting system information:', error);
        return { error: error.message };
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
//# sourceMappingURL=main.js.map