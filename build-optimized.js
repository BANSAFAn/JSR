const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Начинаем сборку оптимизированного установщика JSR...');

// Убедимся, что директория build существует
if (!fs.existsSync(path.join(__dirname, 'build'))) {
  fs.mkdirSync(path.join(__dirname, 'build'));
  console.log('Создана директория build');
}

try {
  // Компиляция TypeScript
  console.log('Компиляция TypeScript...');
  execSync('tsc', { stdio: 'inherit' });
  
  // Очистка временных файлов
  console.log('Очистка временных файлов...');
  if (fs.existsSync(path.join(__dirname, 'dist'))) {
    // Сохраняем только скомпилированные файлы
    console.log('Сохраняем скомпилированные файлы...');
  }
  
  // Сборка с максимальной компрессией
  console.log('Сборка установщика с максимальной компрессией...');
  execSync('electron-builder --win --x64 --config electron-builder.yml', { stdio: 'inherit' });
  
  console.log('Сборка успешно завершена!');
  console.log('Установщик создан в директории dist/');
} catch (error) {
  console.error('Ошибка при сборке:', error);
  process.exit(1);
}