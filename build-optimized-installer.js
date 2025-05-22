const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

console.log('Начинаем сборку оптимизированного установщика JSR...');

// Функция для проверки и создания необходимых изображений для установщика
async function prepareInstallerImages() {
  const imagesDir = path.join(__dirname, 'assets', 'images');
  
  // Проверяем наличие необходимых изображений
  const requiredImages = [
    'AppIcon.ico',
    'installer-sidebar.png',
    'Logo.png'
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
      if (fs.existsSync(path.join(imagesDir, 'Logo.png'))) {
        console.log('Копирование Logo.png как installer-sidebar.png');
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
          console.log('Не удалось создать ICO файл, копируем PNG');
          fs.copyFileSync(
            path.join(imagesDir, 'Logo.png'),
            path.join(imagesDir, 'AppIcon.ico')
          );
        }
      }
    }
    
    console.log('Изображения для установщика подготовлены!');
  }
}

// Функция для оптимизации размера приложения
async function optimizeAppSize() {
  console.log('Оптимизация размера приложения...');
  
  // Удаляем ненужные файлы из node_modules
  const nodesToRemove = [
    'node_modules/**/*.md',
    'node_modules/**/*.markdown',
    'node_modules/**/*.ts',
    'node_modules/**/test/**',
    'node_modules/**/tests/**',
    'node_modules/**/docs/**',
    'node_modules/**/examples/**',
    'node_modules/**/.github/**',
    'node_modules/**/.vscode/**',
    'node_modules/**/.*'
  ];
  
  try {
    // Используем rimraf для удаления файлов
    for (const pattern of nodesToRemove) {
      console.log(`Удаление: ${pattern}`);
      try {
        execSync(`npx rimraf "${pattern}"`, { stdio: 'inherit' });
      } catch (error) {
        console.log(`Ошибка при удалении ${pattern}: ${error.message}`);
      }
    }
    
    console.log('Оптимизация завершена!');
  } catch (error) {
    console.error('Ошибка при оптимизации размера:', error);
  }
}

// Функция для сборки оптимизированного установщика
async function buildOptimizedInstaller() {
  try {
    console.log('Компиляция TypeScript...');
    execSync('npx tsc', { stdio: 'inherit' });
    
    console.log('Подготовка изображений для установщика...');
    await prepareInstallerImages();
    
    console.log('Оптимизация размера приложения...');
    await optimizeAppSize();
    
    console.log('Сборка установщика...');
    execSync('npx electron-builder --win --x64 --config electron-builder.yml', { stdio: 'inherit' });
    
    console.log('Оптимизированный установщик успешно создан!');
  } catch (error) {
    console.error('Ошибка при сборке установщика:', error);
    process.exit(1);
  }
}

// Запускаем сборку
buildOptimizedInstaller();