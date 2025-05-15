const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
    // В реальном проекте здесь должно быть создание изображения,
    // но для простоты мы просто копируем логотип
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

// Функция для сборки приложения и создания установщика
async function buildInstaller() {
  try {
    // Создаем изображения для установщика
    createInstallerImages();
    
    // Создаем LICENSE файл, если он отсутствует
    createLicenseFile();
    
    console.log('Сборка приложения...');
    // Компилируем TypeScript
    execSync('npx tsc', { stdio: 'inherit' });
    
    // Копируем необходимые файлы в dist
    console.log('Копирование файлов для сборки...');
    const prebuildCommand = 'node -e "const fs=require(\'fs\'); const path=require(\'path\'); ' +
      'if(!fs.existsSync(\'dist/styles\')) fs.mkdirSync(\'dist/styles\', {recursive:true}); ' +
      'fs.cpSync(\'styles\', \'dist/styles\', {recursive:true}); ' +
      'if(!fs.existsSync(\'dist/locales\')) fs.mkdirSync(\'dist/locales\', {recursive:true}); ' +
      'fs.cpSync(\'locales\', \'dist/locales\', {recursive:true}); ' +
      'fs.copyFileSync(\'index.html\', \'dist/index.html\');"';
    execSync(prebuildCommand, { stdio: 'inherit' });
    
    console.log('Создание NSIS установщика для Windows...');
    // Создаем установщик с помощью electron-builder с оптимизацией
    execSync('npx electron-builder --win --x64 --config.nsis.differentialPackage=false', { stdio: 'inherit' });
    
    console.log('Установщик NSIS успешно создан!');
  } catch (error) {
    console.error('Ошибка при создании установщика:', error);
    process.exit(1);
  }
}

// Запускаем сборку
buildInstaller();