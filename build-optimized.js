const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Начинаем сборку оптимизированного установщика JSR...');

// Функция для создания необходимых изображений для установщика
function createInstallerImages() {
  const imagesDir = path.join(__dirname, 'assets', 'images');
  
  // Проверяем, существуют ли уже изображения для установщика
  if (!fs.existsSync(path.join(imagesDir, 'installer-sidebar.png'))) {
    console.log('Создание изображений для установщика NSIS...');
    
    // Копируем логотип для использования в установщике
    fs.copyFileSync(
      path.join(imagesDir, 'Logo.png'),
      path.join(imagesDir, 'installer-banner.png')
    );
    
    // Создаем боковую панель для установщика (164x314 пикселей)
    fs.copyFileSync(
      path.join(imagesDir, 'Logo.png'),
      path.join(imagesDir, 'installer-sidebar.png')
    );
    
    // Создаем простые изображения для иконок установщика
    const iconPaths = [
      'warning.png',
      'info.png',
      'new.png',
      'up.png',
      'installer-bg.png'
    ];
    
    // Используем существующий логотип для всех иконок
    iconPaths.forEach(iconPath => {
      fs.copyFileSync(
        path.join(imagesDir, 'Logo.png'),
        path.join(imagesDir, iconPath)
      );
    });
    
    console.log('Изображения для установщика NSIS созданы успешно!');
  }
}

// Функция для проверки и создания LICENSE файла, если он отсутствует
function createLicenseFile() {
  const licensePath = path.join(__dirname, 'LICENSE');
  
  if (!fs.existsSync(licensePath)) {
    console.log('Создание LICENSE файла для установщика...');
    
    const licenseContent = `MIT License

Copyright (c) ${new Date().getFullYear()} Baner

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;
    
    fs.writeFileSync(licensePath, licenseContent, 'utf8');
    console.log('LICENSE файл создан успешно!');
  }
}

// Функция для создания ICO файла из PNG, если он отсутствует
function createIcoFile() {
  const imagesDir = path.join(__dirname, 'assets', 'images');
  const logoPath = path.join(imagesDir, 'Logo.png');
  const icoPath = path.join(imagesDir, 'Logo.ico');
  const appIconPath = path.join(imagesDir, 'AppIcon.ico');
  
  if (!fs.existsSync(icoPath) || !fs.existsSync(appIconPath)) {
    console.log('Создание ICO файлов для установщика...');
    
    // Создаем простой ICO файл (это временное решение)
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
    
    // Создаем ICO файлы
    fs.writeFileSync(icoPath, Buffer.concat([icoHeader, dibHeader, pixelData]));
    fs.writeFileSync(appIconPath, Buffer.concat([icoHeader, dibHeader, pixelData]));
    
    console.log(`ICO файлы созданы: ${icoPath} и ${appIconPath}`);
  }
}

// Убедимся, что директория build существует
if (!fs.existsSync(path.join(__dirname, 'build'))) {
  fs.mkdirSync(path.join(__dirname, 'build'));
  console.log('Создана директория build');
}

try {
  // Создаем необходимые файлы для установщика
  createInstallerImages();
  createLicenseFile();
  createIcoFile();
  
  // Компиляция TypeScript
  console.log('Компиляция TypeScript...');
  execSync('npx tsc', { stdio: 'inherit' });
  
  // Копируем необходимые файлы в dist
  console.log('Копирование файлов для сборки...');
  
  // Создаем директории и копируем файлы вручную
  if (!fs.existsSync(path.join(__dirname, 'dist'))) {
    fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
  }
  
  // Копируем стили
  if (fs.existsSync(path.join(__dirname, 'styles'))) {
    const distStylesDir = path.join(__dirname, 'dist', 'styles');
    if (!fs.existsSync(distStylesDir)) {
      fs.mkdirSync(distStylesDir, { recursive: true });
    }
    
    // Копируем файлы стилей
    const styleFiles = fs.readdirSync(path.join(__dirname, 'styles'));
    styleFiles.forEach(file => {
      const sourcePath = path.join(__dirname, 'styles', file);
      const destPath = path.join(distStylesDir, file);
      if (fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, destPath);
      } else if (fs.statSync(sourcePath).isDirectory()) {
        // Если это директория (например themes), создаем ее и копируем содержимое
        const subDir = path.join(distStylesDir, file);
        if (!fs.existsSync(subDir)) {
          fs.mkdirSync(subDir, { recursive: true });
        }
        const subFiles = fs.readdirSync(sourcePath);
        subFiles.forEach(subFile => {
          fs.copyFileSync(path.join(sourcePath, subFile), path.join(subDir, subFile));
        });
      }
    });
  }
  
  // Копируем локализации
  if (fs.existsSync(path.join(__dirname, 'locales'))) {
    const distLocalesDir = path.join(__dirname, 'dist', 'locales');
    if (!fs.existsSync(distLocalesDir)) {
      fs.mkdirSync(distLocalesDir, { recursive: true });
    }
    
    // Копируем файлы локализаций
    const localeFiles = fs.readdirSync(path.join(__dirname, 'locales'));
    localeFiles.forEach(file => {
      fs.copyFileSync(
        path.join(__dirname, 'locales', file),
        path.join(distLocalesDir, file)
      );
    });
  }
  
  // Копируем index.html
  if (fs.existsSync(path.join(__dirname, 'index.html'))) {
    fs.copyFileSync(
      path.join(__dirname, 'index.html'),
      path.join(__dirname, 'dist', 'index.html')
    );
  }
  
  // Сборка с максимальной компрессией и оптимизацией для NSIS
  console.log('Сборка установщика с максимальной компрессией...');
  // Используем существующий файл конфигурации electron-builder.yml
  execSync('npx electron-builder --win --x64 --config electron-builder.yml', { stdio: 'inherit' });

  
  console.log('Сборка успешно завершена!');
  console.log('Установщик EXE создан в директории dist/');
} catch (error) {
  console.error('Ошибка при сборке:', error);
  process.exit(1);
}