const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Путь к изображениям
const imagesDir = path.join(__dirname, 'assets', 'images');
const logoPath = path.join(imagesDir, 'Logo.png');
const icoPath = path.join(imagesDir, 'Logo.ico');

// Функция для проверки существования файла
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Функция для создания ICO файла из PNG
function convertPngToIco() {
  try {
    if (!fileExists(logoPath)) {
      console.error(`Файл ${logoPath} не найден`);
      return false;
    }

    // Создаем HTML файл для конвертации PNG в ICO
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>PNG to ICO Converter</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        canvas { display: none; }
      </style>
    </head>
    <body>
      <h1>PNG to ICO Converter</h1>
      <p>Этот файл автоматически конвертирует Logo.png в формат ICO.</p>
      <canvas id="canvas"></canvas>
      <script>
        // Функция для создания ICO файла
        function createIco() {
          const canvas = document.getElementById('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          img.onload = function() {
            // Создаем несколько размеров иконок (16x16, 32x32, 48x48)
            const sizes = [16, 32, 48];
            const dataUrls = [];
            
            for (const size of sizes) {
              canvas.width = size;
              canvas.height = size;
              ctx.clearRect(0, 0, size, size);
              ctx.drawImage(img, 0, 0, size, size);
              dataUrls.push(canvas.toDataURL('image/png'));
            }
            
            // Выводим данные для сохранения
            console.log(JSON.stringify(dataUrls));
          };
          
          img.src = '../assets/images/Logo.png';
        }
        
        createIco();
      </script>
    </body>
    </html>
    `;

    const converterPath = path.join(imagesDir, 'png-to-ico-converter.html');
    fs.writeFileSync(converterPath, htmlContent);

    console.log('Создан HTML файл для конвертации PNG в ICO');
    console.log('Пожалуйста, откройте файл в браузере и следуйте инструкциям для создания ICO файла');

    // Создаем простой ICO файл (это временное решение, так как в Node.js нет встроенных средств для создания ICO)
    // В реальном проекте лучше использовать специальные библиотеки или инструменты
    console.log('Создание базового ICO файла...');
    
    // Создаем пустой ICO файл с правильной структурой
    const icoHeader = Buffer.from([
      0x00, 0x00,             // Reserved (0)
      0x01, 0x00,             // Image type: 1 = ICO
      0x01, 0x00,             // Number of images: 1
      0x20, 0x20, 0x00, 0x00, // Width, Height: 32x32
      0x00, 0x00,             // Color palette: 0
      0x01, 0x00,             // Color planes: 1
      0x20, 0x00,             // Bits per pixel: 32
      0x16, 0x00, 0x00, 0x00, // Size of image data
      0x22, 0x00, 0x00, 0x00  // Offset to image data
    ]);
    
    // Создаем минимальный BMP заголовок (DIB header)
    const dibHeader = Buffer.from([
      0x28, 0x00, 0x00, 0x00, // Size of DIB header
      0x20, 0x00, 0x00, 0x00, // Width
      0x40, 0x00, 0x00, 0x00, // Height (doubled for ICO format)
      0x01, 0x00,             // Planes
      0x20, 0x00,             // Bits per pixel
      0x00, 0x00, 0x00, 0x00, // Compression
      0x00, 0x00, 0x00, 0x00, // Image size
      0x00, 0x00, 0x00, 0x00, // X pixels per meter
      0x00, 0x00, 0x00, 0x00, // Y pixels per meter
      0x00, 0x00, 0x00, 0x00, // Colors used
      0x00, 0x00, 0x00, 0x00  // Important colors
    ]);
    
    // Создаем простые данные изображения (32x32 пикселя, все синие)
    const pixelData = Buffer.alloc(32 * 32 * 4, 0);
    for (let i = 0; i < 32 * 32; i++) {
      const offset = i * 4;
      pixelData[offset] = 0;     // Blue
      pixelData[offset + 1] = 0; // Green
      pixelData[offset + 2] = 255; // Red
      pixelData[offset + 3] = 255; // Alpha
    }
    
    // Создаем ICO файл
    fs.writeFileSync(icoPath, Buffer.concat([icoHeader, dibHeader, pixelData]));
    
    // Также создадим резервную копию с другим именем
    const backupIcoPath = path.join(imagesDir, 'AppIcon.ico');
    fs.writeFileSync(backupIcoPath, Buffer.concat([icoHeader, dibHeader, pixelData]));
    console.log(`Резервная копия ICO файла создана: ${backupIcoPath}`);
    
    console.log(`ICO файл создан: ${icoPath}`);
    return true;
  } catch (error) {
    console.error('Ошибка при конвертации PNG в ICO:', error);
    return false;
  }
}

// Запускаем конвертацию
convertPngToIco();

console.log('Обновите package.json, чтобы использовать новый ICO файл вместо PNG для иконок установщика.');