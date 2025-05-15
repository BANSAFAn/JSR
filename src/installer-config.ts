import { app, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import Store from 'electron-store';

// Хранилище настроек установки
const installStore = new Store({ name: 'install-config' });

// Интерфейс для настроек установки
interface InstallConfig {
  installDir: string;
  language: string;
  createDesktopShortcut: boolean;
  createStartMenuShortcut: boolean;
  autoStart: boolean;
}

// Значения по умолчанию
const defaultConfig: InstallConfig = {
  installDir: path.join(app.getPath('appData'), 'JSR'),
  language: 'ru',
  createDesktopShortcut: true,
  createStartMenuShortcut: true,
  autoStart: false
};

/**
 * Получение текущих настроек установки
 */
export function getInstallConfig(): InstallConfig {
  return installStore.get('config', defaultConfig) as InstallConfig;
}

/**
 * Сохранение настроек установки
 */
export function saveInstallConfig(config: InstallConfig): void {
  installStore.set('config', config);
}

/**
 * Открытие диалога выбора директории установки
 */
export async function selectInstallDirectory(): Promise<string | null> {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Выберите папку для установки JSR',
    properties: ['openDirectory', 'createDirectory']
  });
  
  if (canceled || filePaths.length === 0) {
    return null;
  }
  
  return filePaths[0];
}

/**
 * Создание ярлыков и настройка автозапуска
 */
export function setupShortcutsAndAutostart(config: InstallConfig): void {
  // Здесь будет код для создания ярлыков и настройки автозапуска
  // В реальном приложении это будет реализовано с использованием
  // специальных библиотек для работы с системой
  console.log('Настройка ярлыков и автозапуска:', config);
}

/**
 * Проверка доступности директории для установки
 */
export function checkInstallDirectoryAccess(dirPath: string): boolean {
  try {
    // Проверяем, существует ли директория
    if (!fs.existsSync(dirPath)) {
      // Пытаемся создать директорию
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Проверяем права на запись
    const testFile = path.join(dirPath, '.write-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    
    return true;
  } catch (error) {
    console.error('Ошибка доступа к директории установки:', error);
    return false;
  }
}