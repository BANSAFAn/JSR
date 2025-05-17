const fs = require('fs');
const path = require('path');
const { app, BrowserWindow } = require('electron');

// Функция для конвертации SVG в PNG с помощью Electron
async function convertSvgToPng() {
  try {
    console.log('Начинаем конвертацию SVG в PNG...');
    
    // Путь к файлам
    const svgPath = path.join(__dirname, 'assets', 'images', 'installer-sidebar.svg');
    const pngPath = path.join(__dirname, 'assets', 'images', 'installer-sidebar.png');
    
    // Проверяем существование SVG файла
    if (!fs.existsSync(svgPath)) {
      console.error(`Файл ${svgPath} не найден!`);
      return;
    }
    
    console.log(`Чтение SVG файла: ${svgPath}`);
    
    // Создаем временный HTML файл для отображения SVG
    const tempHtmlPath = path.join(__dirname, 'temp-svg.html');
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { margin: 0; padding: 0; }
          svg { width: 164px; height: 314px; }
        </style>
      </head>
      <body>
        ${svgContent}
      </body>
      </html>
    `;
    
    fs.writeFileSync(tempHtmlPath, htmlContent);
    
    // Инициализируем приложение Electron
    app.whenReady().then(async () => {
      // Создаем окно браузера с нужными размерами
      const win = new BrowserWindow({
        width: 164,
        height: 314,
        show: false,
        webPreferences: {
          offscreen: true
        }
      });
      
      // Загружаем HTML с SVG
      await win.loadFile(tempHtmlPath);
      
      // Делаем скриншот окна
      const image = await win.webContents.capturePage();
      const pngBuffer = image.toPNG();
      
      // Сохраняем PNG файл
      fs.writeFileSync(pngPath, pngBuffer);
      
      // Удаляем временный HTML файл
      fs.unlinkSync(tempHtmlPath);
      
      console.log(`PNG файл успешно создан: ${pngPath}`);
      
      // Завершаем приложение
      app.quit();
    });
  } catch (error) {
    console.error('Произошла ошибка при конвертации:', error);
    if (app.isReady()) app.quit();
  }
}

// Если скрипт запущен напрямую (не через require)
if (require.main === module) {
  convertSvgToPng();
} else {
  // Экспортируем функцию для использования в других модулях
  module.exports = { convertSvgToPng };
}