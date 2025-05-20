const { createRelease, generateRandomTag, generateReleaseNotes } = require('./generate-release');
const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

// Функция для создания релиза на GitHub с использованием GitHub API
async function createGitHubRelease() {
  try {
    // Проверяем наличие токена GitHub
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error('GITHUB_TOKEN не найден в переменных окружения');
      console.error('Установите токен GitHub для создания релизов:');
      console.error('export GITHUB_TOKEN=your_github_token');
      process.exit(1);
    }

    // Получаем информацию о репозитории из package.json
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    const repoUrl = packageJson.repository.url;
    const repoMatch = repoUrl.match(/github\.com[\/:]([^\/]+)\/([^\/\.]+)/);
    
    if (!repoMatch) {
      console.error('Не удалось определить владельца и имя репозитория из package.json');
      process.exit(1);
    }
    
    const owner = repoMatch[1];
    const repo = repoMatch[2].replace('.git', '');
    
    console.log(`Репозиторий: ${owner}/${repo}`);

    // Генерируем тег и описание релиза
    const tag = generateRandomTag();
    const releaseNotes = generateReleaseNotes();
    
    console.log(`Сгенерирован тег: ${tag}`);
    console.log('Сгенерировано описание релиза');

    // Инициализируем Octokit
    const octokit = new Octokit({ auth: token });

    // Создаем релиз на GitHub
    const response = await octokit.repos.createRelease({
      owner,
      repo,
      tag_name: tag,
      name: `JSR Release ${tag}`,
      body: releaseNotes,
      draft: false,
      prerelease: false
    });

    console.log(`Релиз успешно создан: ${response.data.html_url}`);
    return { tag, releaseNotes, url: response.data.html_url };
  } catch (error) {
    console.error('Ошибка при создании релиза на GitHub:', error);
    throw error;
  }
}

// Если скрипт запущен напрямую, выполняем создание релиза
if (require.main === module) {
  createGitHubRelease().catch(error => {
    console.error('Ошибка:', error);
    process.exit(1);
  });
}

module.exports = { createGitHubRelease };