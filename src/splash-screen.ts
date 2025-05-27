import { app, BrowserWindow } from 'electron';
import * as path from 'path';

export class SplashScreen {
  private window: BrowserWindow | null = null;
  private mainWindowCallback: () => void;

  constructor(callback: () => void) {
    this.mainWindowCallback = callback;
  }

  public create(): void {
    // Создаем окно загрузочного экрана
    this.window = new BrowserWindow({
      width: 400,
      height: 300,
      transparent: true,
      frame: false,
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      icon: path.join(__dirname, '../assets/images/Logo.png')
    });

    // Загружаем HTML для загрузочного экрана
    this.window.loadFile(path.join(__dirname, '../splash.html'));

    // Обрабатываем событие закрытия окна
    this.window.on('close', (event) => {
      // Предотвращаем закрытие окна по умолчанию
      event.preventDefault();
      // Скрываем окно вместо закрытия
      if (this.window) {
        this.window.hide();
      }
    });

    // Запускаем основное окно после загрузки
    setTimeout(() => {
      this.close();
      this.mainWindowCallback();
    }, 2000);
  }

  public close(): void {
    if (this.window) {
      // Удаляем обработчик события close перед уничтожением окна
      this.window.removeAllListeners('close');
      this.window.destroy();
      this.window = null;
    }
  }
}