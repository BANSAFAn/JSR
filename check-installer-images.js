const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Путь к изображениям
const imagesDir = path.join(__dirname, 'assets', 'images');
const sidebarPath = path.join(imagesDir, 'installer-sidebar.png');

// Функция для проверки существования файла
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Функция для проверки размера и формата файла installer-sidebar.png
function checkInstallerSidebar() {
  try {
    if (!fileExists(sidebarPath)) {
      console.error(`Файл ${sidebarPath} не найден`);
      return false;
    }

    console.log(`Проверка файла ${sidebarPath}...`);
    
    // Проверяем, что файл является PNG изображением
    const fileHeader = fs.readFileSync(sidebarPath, { encoding: 'hex', length: 8 });
    if (fileHeader !== '89504e470d0a1a0a') {
      console.error('Файл не является корректным PNG изображением');
      return false;
    }
    
    // Получаем размер файла
    const stats = fs.statSync(sidebarPath);
    console.log(`Размер файла: ${stats.size} байт`);
    
    // Создаем HTML файл для проверки размеров изображения
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Проверка размеров изображения</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
      </style>
    </head>
    <body>
      <h1>Проверка размеров изображения</h1>
      <div>
        <h2>Текущее изображение installer-sidebar.png:</h2>
        <img src="../assets/images/installer-sidebar.png" id="sidebarImage">
        <div id="dimensions"></div>
      </div>
      <script>
        window.onload = function() {
          const img = document.getElementById('sidebarImage');
          const dimensions = document.getElementById('dimensions');
          
          img.onload = function() {
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            dimensions.innerHTML = `Размеры: ${width}x${height} пикселей`;
            
            // Проверяем, соответствуют ли размеры требованиям NSIS (164x314)
            if (width !== 164 || height !== 314) {
              dimensions.innerHTML += '<br><strong style="color: red;">ВНИМАНИЕ: Размеры не соответствуют требованиям NSIS (164x314)</strong>';
            } else {
              dimensions.innerHTML += '<br><strong style="color: green;">Размеры соответствуют требованиям NSIS</strong>';
            }
            
            // Выводим информацию в консоль для Node.js
            console.log(JSON.stringify({ width, height }));
          };
        };
      </script>
    </body>
    </html>
    `;

    const checkerPath = path.join(imagesDir, 'check-sidebar-dimensions.html');
    fs.writeFileSync(checkerPath, htmlContent);

    console.log(`Создан HTML файл для проверки размеров изображения: ${checkerPath}`);
    console.log('Пожалуйста, откройте файл в браузере для проверки размеров изображения');
    console.log('Для NSIS требуется размер 164x314 пикселей для файла installer-sidebar.png');
    
    return true;
  } catch (error) {
    console.error('Ошибка при проверке файла installer-sidebar.png:', error);
    return false;
  }
}

// Запускаем проверку
checkInstallerSidebar();

console.log('\nРекомендации:');
console.log('1. Убедитесь, что файл Logo.ico является корректным ICO файлом');
console.log('2. Убедитесь, что файл installer-sidebar.png имеет размер 164x314 пикселей');
console.log('3. Если проблема не решена, попробуйте создать новый ICO файл с помощью специализированного инструмента');