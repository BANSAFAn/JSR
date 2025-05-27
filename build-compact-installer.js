const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

console.log('Начинаем сборку компактного установщика JSR...');

// Версия скрипта для оптимизированной сборки

// Функция для проверки и создания необходимых изображений для установщика
async function prepareInstallerImages() {
  const imagesDir = path.join(__dirname, 'assets', 'images');
  
  // Проверяем наличие необходимых изображений
  const requiredImages = [
    'AppIcon.ico',
    'installer-sidebar.png'
  ];
  
  let allImagesExist = true;
  for (const image of requiredImages) {
    if (!fs.existsSync(path.join(imagesDir, image))) {
      allImagesExist = false;
      console.log(`Отсутствует изображение: ${image}`);
    }
  }
  
  if (!allImagesExist) {
    console.log('Создание необходимых изображений для установщика...');
    
    // Создаем боковую панель для установщика, если она отсутствует
    if (!fs.existsSync(path.join(imagesDir, 'installer-sidebar.png'))) {
      if (fs.existsSync(path.join(imagesDir, 'installer-sidebar.svg'))) {
        console.log('Конвертация SVG в PNG для боковой панели установщика...');
        try {
          // Используем простой метод конвертации
          execSync(`node convert-svg-simple.js ${path.join(imagesDir, 'installer-sidebar.svg')} ${path.join(imagesDir, 'installer-sidebar.png')}`, { stdio: 'inherit' });
        } catch (error) {
          console.log('Не удалось конвертировать SVG, копируем Logo.png как запасной вариант');
          fs.copyFileSync(
            path.join(imagesDir, 'Logo.png'),
            path.join(imagesDir, 'installer-sidebar.png')
          );
        }
      } else {
        // Используем Logo.png как запасной вариант
        fs.copyFileSync(
          path.join(imagesDir, 'Logo.png'),
          path.join(imagesDir, 'installer-sidebar.png')
        );
      }
    }
    
    // Создаем AppIcon.ico, если он отсутствует
    if (!fs.existsSync(path.join(imagesDir, 'AppIcon.ico'))) {
      if (fs.existsSync(path.join(imagesDir, 'Logo.ico'))) {
        fs.copyFileSync(
          path.join(imagesDir, 'Logo.ico'),
          path.join(imagesDir, 'AppIcon.ico')
        );
      } else if (fs.existsSync(path.join(imagesDir, 'Logo.png'))) {
        console.log('Создание AppIcon.ico из Logo.png...');
        try {
          execSync(`node convert-to-ico.js ${path.join(imagesDir, 'Logo.png')} ${path.join(imagesDir, 'AppIcon.ico')}`, { stdio: 'inherit' });
        } catch (error) {
          console.log('Не удалось создать ICO файл, создаем простой ICO');
          createSimpleIcoFile(path.join(imagesDir, 'AppIcon.ico'));
        }
      } else {
        createSimpleIcoFile(path.join(imagesDir, 'AppIcon.ico'));
      }
    }
    
    console.log('Изображения для установщика подготовлены!');
  }
}

// Функция для создания простого ICO файла
function createSimpleIcoFile(filePath) {
  console.log(`Создание простого ICO файла: ${filePath}`);
  
  // Создаем простой ICO файл
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
  
  // Создаем простые данные изображения (32x32 пикселя, синие)
  const pixelData = Buffer.alloc(32 * 32 * 4, 0);
  for (let i = 0; i < 32 * 32; i++) {
    const offset = i * 4;
    pixelData[offset] = 0;     // Blue
    pixelData[offset + 1] = 0; // Green
    pixelData[offset + 2] = 255; // Red
    pixelData[offset + 3] = 255; // Alpha
  }
  
  // Создаем ICO файл
  fs.writeFileSync(filePath, Buffer.concat([icoHeader, dibHeader, pixelData]));
}

// Функция для проверки и создания LICENSE файла
function createLicenseFile() {
  const licensePath = path.join(__dirname, 'LICENSE');
  
  if (!fs.existsSync(licensePath)) {
    console.log('Создание LICENSE файла для установщика...');
    
    const licenseContent = `MIT License

Copyright (c) ${new Date().getFullYear()} BANSAFAn

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

// Функция для удаления ненужных файлов перед сборкой
async function cleanupFiles() {
  console.log('Удаление ненужных файлов перед сборкой...');
  
  // Список шаблонов файлов, которые можно безопасно удалить
  const patternsToRemove = [
    'node_modules/**/*.md',
    'node_modules/**/*.markdown',
    'node_modules/**/*.ts',
    'node_modules/**/*.map',
    'node_modules/**/test/**',
    'node_modules/**/tests/**',
    'node_modules/**/docs/**',
    'node_modules/**/example/**',
    'node_modules/**/examples/**',
    'node_modules/**/.github/**',
    'node_modules/**/LICENSE*',
    'node_modules/**/CHANGELOG*',
    'node_modules/**/README*',
    'node_modules/**/.npmignore',
    'node_modules/**/.DS_Store',
    'node_modules/**/.vscode/**',
    'node_modules/**/.idea/**'
  ];
  
  // Удаляем файлы по шаблонам
  for (const pattern of patternsToRemove) {
    try {
      const command = process.platform === 'win32' 
        ? `powershell -Command "Get-ChildItem -Path '${pattern}' -Recurse | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue"`
        : `find node_modules -path '${pattern}' -delete`;
      
      await exec(command).catch(() => {}); // Игнорируем ошибки
    } catch (error) {
      // Игнорируем ошибки при удалении файлов
    }
  }
  
  console.log('Ненужные файлы удалены!');
}

// Функция для оптимизации размера сборки
async function optimizeBuild() {
  console.log('Оптимизация размера сборки...');
  
  // Убедимся, что директория dist существует
  if (!fs.existsSync(path.join(__dirname, 'dist'))) {
    fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
  }
  
  // Очистка ненужных файлов
  await cleanupFiles();
  
  // Создаем временный конфигурационный файл с максимальными настройками сжатия
  const tempConfigPath = path.join(__dirname, 'temp-electron-builder.yml');
  const originalConfigPath = path.join(__dirname, 'electron-builder.yml');
  
  // Читаем оригинальный конфиг
  let configContent = fs.readFileSync(originalConfigPath, 'utf8');
  
  // Добавляем или обновляем настройки для максимального сжатия
  if (!configContent.includes('compression: maximum')) {
    configContent = configContent.replace(/compression:\s*\w+/g, 'compression: maximum');
  }
  
  if (!configContent.includes('compressorName: lzma')) {
    configContent = configContent.replace(/compressorName:\s*\w+/g, 'compressorName: lzma');
  }
  
  // Добавляем настройки для solid архива
  if (!configContent.includes('solid: true')) {
    configContent = configContent.replace(/solid:\s*\w+/g, 'solid: true');
  }
  
  // Устанавливаем максимальный уровень сжатия
  if (!configContent.includes('level: 9')) {
    configContent = configContent.replace(/level:\s*\d+/g, 'level: 9');
  }
  
  // Записываем временный конфиг
  fs.writeFileSync(tempConfigPath, configContent, 'utf8');
  
  // Компиляция TypeScript
  console.log('Компиляция TypeScript...');
  execSync('npx tsc', { stdio: 'inherit' });
  
  // Сборка с максимальной компрессией
  console.log('Сборка установщика с максимальной компрессией...');
  execSync(`npx electron-builder --win --x64 --config ${tempConfigPath}`, { stdio: 'inherit' });
  
  // Удаляем временный конфиг
  fs.unlinkSync(tempConfigPath);
  
  // Получаем размер созданного установщика
  const distDir = path.join(__dirname, 'dist');
  const files = fs.readdirSync(distDir);
  const installerFile = files.find(file => file.endsWith('.exe') && file.includes('Setup'));
  
  if (installerFile) {
    const filePath = path.join(distDir, installerFile);
    const stats = fs.statSync(filePath);
    const fileSizeInBytes = stats.size;
    const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
    
    console.log(`Установщик создан: ${installerFile}`);
    console.log(`Размер установщика: ${fileSizeInMegabytes.toFixed(2)} МБ`);
  } else {
    console.log('Установщик не найден в директории dist/');
  }
}

async function main() {
  try {
    // Подготовка необходимых файлов
    await prepareInstallerImages();
    createLicenseFile();
    
    // Оптимизация и сборка
    await optimizeBuild();
    
    console.log('Сборка компактного установщика успешно завершена!');
  } catch (error) {
    console.error('Ошибка при сборке:', error);
    process.exit(1);
  }
}

main();