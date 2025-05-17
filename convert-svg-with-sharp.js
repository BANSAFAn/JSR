const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Пути к файлам
const svgPath = path.join(__dirname, 'assets', 'images', 'installer-sidebar.svg');
const pngPath = path.join(__dirname, 'assets', 'images', 'installer-sidebar.png');

console.log('Начинаем конвертацию SVG в PNG...');
console.log(`Исходный файл: ${svgPath}`);
console.log(`Целевой файл: ${pngPath}`);

// Проверяем существование SVG файла
if (!fs.existsSync(svgPath)) {
  console.error(`Ошибка: Файл ${svgPath} не найден!`);
  console.log('Пожалуйста, убедитесь, что SVG файл существует в указанной директории.');
  process.exit(1);
}

console.log('Для запуска этого скрипта необходимо установить пакет sharp:');
console.log('npm install sharp');
console.log('\nПосле установки запустите скрипт снова.');

console.log('\nАльтернативные способы конвертации:');
console.log('1. Откройте файл assets/images/convert-svg.html в браузере');
console.log('2. Сделайте скриншот SVG изображения');
console.log('3. Сохраните как PNG в папке assets/images с именем installer-sidebar.png');

// Если sharp установлен, этот код выполнит конвертацию
try {
  sharp(svgPath)
    .resize(164, 314)
    .png()
    .toFile(pngPath)
    .then(() => {
      console.log(`\nУспешно! PNG файл создан: ${pngPath}`);
    })
    .catch(err => {
      console.error('Ошибка при конвертации:', err);
    });
} catch (error) {
  // Ошибка будет, если sharp не установлен, но это нормально
  // Пользователь уже получил инструкции выше
}