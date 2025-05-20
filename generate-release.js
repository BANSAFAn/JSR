const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Функция для генерации случайного тега
function generateRandomTag() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000);
  
  return `v${year}.${month}.${day}-${random}`;
}

// Функция для генерации описания релиза на английском языке
function generateReleaseNotes() {
  const improvements = [
    'Improved performance',
    'Enhanced user interface',
    'Fixed memory leaks',
    'Optimized startup time',
    'Reduced CPU usage',
    'Improved compatibility with different Java versions',
    'Enhanced error handling',
    'Updated translations',
    'Improved system detection',
    'Better support for legacy Minecraft versions'
  ];

  const bugfixes = [
    'Fixed crash when analyzing certain Minecraft versions',
    'Fixed incorrect Java recommendations for snapshot versions',
    'Fixed UI glitches on high DPI displays',
    'Fixed memory leak when switching between tabs',
    'Fixed incorrect system information display',
    'Fixed compatibility issues with older operating systems',
    'Fixed incorrect path detection for Java installations',
    'Fixed issues with localization',
    'Fixed startup errors on some configurations',
    'Fixed incorrect version detection'
  ];

  const features = [
    'Added support for latest Minecraft versions',
    'Added detailed Java installation information',
    'Added new download options',
    'Added automatic update checking',
    'Added more detailed system information',
    'Added support for additional languages',
    'Added dark mode support',
    'Added installation guide for recommended Java versions',
    'Added compatibility checker for installed Java versions',
    'Added detailed error reporting'
  ];

  // Randomly select items from each category
  const numImprovements = Math.floor(Math.random() * 3) + 1;
  const numBugfixes = Math.floor(Math.random() * 3) + 1;
  const numFeatures = Math.floor(Math.random() * 2);

  const selectedImprovements = [];
  const selectedBugfixes = [];
  const selectedFeatures = [];

  for (let i = 0; i < numImprovements; i++) {
    const index = Math.floor(Math.random() * improvements.length);
    selectedImprovements.push(improvements[index]);
    improvements.splice(index, 1);
  }

  for (let i = 0; i < numBugfixes; i++) {
    const index = Math.floor(Math.random() * bugfixes.length);
    selectedBugfixes.push(bugfixes[index]);
    bugfixes.splice(index, 1);
  }

  for (let i = 0; i < numFeatures; i++) {
    const index = Math.floor(Math.random() * features.length);
    selectedFeatures.push(features[index]);
    features.splice(index, 1);
  }

  // Generate release notes
  let notes = `# JSR Release Notes\n\n`;

  if (selectedFeatures.length > 0) {
    notes += `## New Features\n\n`;
    selectedFeatures.forEach(feature => {
      notes += `- ${feature}\n`;
    });
    notes += '\n';
  }

  if (selectedImprovements.length > 0) {
    notes += `## Improvements\n\n`;
    selectedImprovements.forEach(improvement => {
      notes += `- ${improvement}\n`;
    });
    notes += '\n';
  }

  if (selectedBugfixes.length > 0) {
    notes += `## Bug Fixes\n\n`;
    selectedBugfixes.forEach(bugfix => {
      notes += `- ${bugfix}\n`;
    });
  }

  return notes;
}

// Основная функция для создания релиза
function createRelease() {
  try {
    // Генерируем случайный тег
    const tag = generateRandomTag();
    console.log(`Generated tag: ${tag}`);

    // Генерируем описание релиза
    const releaseNotes = generateReleaseNotes();
    console.log('Generated release notes');

    // Записываем описание релиза во временный файл
    const tempNotesPath = path.join(__dirname, 'temp-release-notes.md');
    fs.writeFileSync(tempNotesPath, releaseNotes);

    // Создаем тег
    execSync(`git tag -a ${tag} -m "Release ${tag}"`);
    console.log(`Created git tag: ${tag}`);

    // Пушим тег в репозиторий
    execSync('git push --tags');
    console.log('Pushed tags to repository');

    // Удаляем временный файл
    fs.unlinkSync(tempNotesPath);
    console.log('Release process completed successfully');

    return { tag, releaseNotes };
  } catch (error) {
    console.error('Error creating release:', error);
    throw error;
  }
}

// Экспортируем функцию для использования в других скриптах
module.exports = { createRelease, generateRandomTag, generateReleaseNotes };

// Если скрипт запущен напрямую, выполняем создание релиза
if (require.main === module) {
  createRelease();
}