import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';

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
      icon: path.join(app.getAppPath(), 'assets/images/Logo.png')
    });

    // Загружаем HTML для загрузочного экрана
    this.window.loadFile(path.join(app.getAppPath(), 'splash.html'));

    // Скрываем окно при закрытии вместо уничтожения
    this.window.on('close', (event) => {
      event.preventDefault();
      if (this.window) {
        this.window.hide();
      }
    });

    // Запускаем основное окно после загрузки
    setTimeout(() => {
      console.log('SplashScreen closing...');
    this.close();
    console.log('Calling mainWindowCallback...');
    this.mainWindowCallback();
  }, 2000);
  }

  public close(): void {
    if (this.window) {
      this.window.destroy();
      this.window = null;
    }
  }
}