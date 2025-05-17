const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Путь к файлам
const svgPath = path.join(__dirname, 'assets', 'images', 'installer-sidebar.svg');
const pngPath = path.join(__dirname, 'assets', 'images', 'installer-sidebar.png');

// Функция для конвертации SVG в PNG с помощью Node Canvas
async function convertSvgToPng() {
  try {
    console.log('Начинаем конвертацию SVG в PNG...');
    
    // Проверяем существование SVG файла
    if (!fs.existsSync(svgPath)) {
      console.error(`Файл ${svgPath} не найден!`);
      return;
    }
    
    // Создаем временный HTML файл для отображения SVG
    const tempHtmlPath = path.join(__dirname, 'temp-svg-convert.html');
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Создаем HTML с встроенным SVG
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SVG to PNG Converter</title>
        <style>
          body { margin: 0; padding: 0; background: transparent; }
          #canvas { display: none; }
        </style>
      </head>
      <body>
        <div id="svg-container">${svgContent}</div>
        <canvas id="canvas" width="164" height="314"></canvas>
        
        <script>
          // Функция для конвертации SVG в PNG
          function convertToPng() {
            const svgElement = document.querySelector('svg');
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            
            // Устанавливаем размеры canvas
            canvas.width = 164;
            canvas.height = 314;
            
            // Создаем изображение из SVG
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const img = new Image();
            img.onload = function() {
              // Рисуем изображение на canvas
              ctx.drawImage(img, 0, 0, 164, 314);
              
              // Получаем данные PNG
              const pngData = canvas.toDataURL('image/png');
              
              // Отправляем данные в консоль для сохранения
              console.log('PNG_DATA_START');
              console.log(pngData);
              console.log('PNG_DATA_END');
            };
            
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
          }
          
          // Запускаем конвертацию после загрузки страницы
          window.onload = convertToPng;
        </script>
      </body>
      </html>
    `;
    
    fs.writeFileSync(tempHtmlPath, htmlContent);
    
    console.log(`Временный HTML файл создан: ${tempHtmlPath}`);
    console.log('Для завершения конвертации:');
    console.log('1. Откройте файл в браузере');
    console.log('2. Скопируйте данные PNG между PNG_DATA_START и PNG_DATA_END из консоли');
    console.log('3. Сохраните данные в файл installer-sidebar.png');
    
    console.log('Альтернативно, вы можете использовать онлайн-конвертер:');
    console.log('https://svgtopng.com/');
    
  } catch (error) {
    console.error('Произошла ошибка при конвертации:', error);
  }
}

// Запускаем функцию конвертации
convertSvgToPng();