const { generateRandomTag, generateReleaseNotes } = require('./generate-release');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Создание релиза на GitHub с использованием GitHub CLI
 * Альтернативный метод, который может решить проблемы с правами доступа
 */
async function createGitHubReleaseWithCLI() {
  try {
    // Генерируем тег и описание релиза
    const tag = generateRandomTag();
    const releaseNotes = generateReleaseNotes();
    
    console.log(`Сгенерирован тег: ${tag}`);
    console.log('Сгенерировано описание релиза');
    
    // Создаем временный файл для описания релиза
    const tempNotesFile = path.join(__dirname, 'temp-release-notes.md');
    fs.writeFileSync(tempNotesFile, releaseNotes, 'utf8');
    
    try {
      // Проверяем, авторизован ли пользователь в GitHub CLI
      console.log('Проверка авторизации GitHub CLI...');
      execSync('gh auth status', { stdio: 'pipe' });
      
      // Используем GitHub CLI для создания релиза
      console.log(`Создание релиза с тегом ${tag}...`);
      const command = `gh release create ${tag} --title "JSR Release ${tag}" --notes-file "${tempNotesFile}"`;      
      const output = execSync(command, { encoding: 'utf8' });
      
      console.log(`Релиз успешно создан: ${output.trim()}`);
      return { tag, releaseNotes, url: output.trim() };
    } catch (cliError) {
      console.error('Ошибка при использовании GitHub CLI:', cliError.message);
      
      if (cliError.message.includes('not logged in')) {
        console.log('\nНеобходимо авторизоваться в GitHub CLI:');
        console.log('1. Выполните команду: gh auth login');
        console.log('2. Следуйте инструкциям для авторизации');
        console.log('3. Затем повторите попытку создания релиза');
      } else if (cliError.message.includes('HTTP 403') || cliError.message.includes('Resource not accessible')) {
        console.log('\nОшибка доступа (HTTP 403). Возможные решения:');
        console.log('1. Убедитесь, что у вас есть права на создание релизов в репозитории');
        console.log('2. Создайте персональный токен доступа (PAT) с правами repo');
        console.log('3. Авторизуйтесь с этим токеном: gh auth login --with-token < token.txt');
      }
      
      throw cliError;
    } finally {
      // Удаляем временный файл
      if (fs.existsSync(tempNotesFile)) {
        fs.unlinkSync(tempNotesFile);
      }
    }
  } catch (error) {
    console.error('Ошибка при создании релиза на GitHub:', error);
    throw error;
  }
}

// Если скрипт запущен напрямую, выполняем создание релиза
if (require.main === module) {
  createGitHubReleaseWithCLI().catch(error => {
    console.error('Ошибка:', error);
    process.exit(1);
  });
}

module.exports = { createGitHubReleaseWithCLI };