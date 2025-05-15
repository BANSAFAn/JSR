const { ipcRenderer } = require('electron');
const i18next = require('i18next');

// Загрузка переводов
const translations = {
  en: require('./locales/en.json'),
  ru: require('./locales/ru.json'),
  uk: require('./locales/uk.json'),
  de: require('./locales/de.json')
};

// Инициализация i18next
i18next.init({
  lng: 'en',
  resources: {
    en: { translation: translations.en },
    ru: { translation: translations.ru },
    uk: { translation: translations.uk },
    de: { translation: translations.de }
  }
});

// Данные о версиях Java для Minecraft
const javaVersionMap = {
  // Релизные версии
  'release': {
    '1.17+': { version: 'Java 17', minVersion: '17.0.0' },
    '1.13-1.16.5': { version: 'Java 8-11', minVersion: '1.8.0', maxVersion: '11.0.2' },
    '1.7.10-1.12.2': { version: 'Java 8', minVersion: '1.8.0', maxVersion: '1.8.9' },
    '1.0-1.6.4': { version: 'Java 6-7', minVersion: '1.6.0', maxVersion: '1.7.0' }
  },
  // Снапшоты
  'snapshot': {
    '23w': { version: 'Java 17', minVersion: '17.0.0' },
    '20w-22w': { version: 'Java 16-17', minVersion: '16.0.0' },
    '18w-19w': { version: 'Java 8-11', minVersion: '1.8.0', maxVersion: '11.0.2' }
  },
  // Бета версии
  'beta': { version: 'Java 6-7', minVersion: '1.6.0', maxVersion: '1.7.0' },
  // Альфа версии
  'alpha': { version: 'Java 5-6', minVersion: '1.5.0', maxVersion: '1.6.0' }
};

// Источники для скачивания Java
const javaDownloadSources = {
  'Oracle': {
    url: 'https://www.oracle.com/java/technologies/downloads/',
    guide: [
      { en: 'Go to Oracle Java Downloads page', ru: 'Перейдите на страницу загрузки Oracle Java', uk: 'Перейдіть на сторінку завантаження Oracle Java', de: 'Gehen Sie zur Oracle Java-Download-Seite' },
      { en: 'Select your operating system', ru: 'Выберите вашу операционную систему', uk: 'Виберіть вашу операційну систему', de: 'Wählen Sie Ihr Betriebssystem' },
      { en: 'Download the appropriate JDK installer', ru: 'Загрузите подходящий установщик JDK', uk: 'Завантажте відповідний інсталятор JDK', de: 'Laden Sie das entsprechende JDK-Installationsprogramm herunter' },
      { en: 'Run the installer and follow the instructions', ru: 'Запустите установщик и следуйте инструкциям', uk: 'Запустіть інсталятор і дотримуйтесь інструкцій', de: 'Führen Sie das Installationsprogramm aus und folgen Sie den Anweisungen' }
    ]
  },
  'AdoptOpenJDK': {
    url: 'https://adoptium.net/',
    guide: [
      { en: 'Go to Eclipse Adoptium page', ru: 'Перейдите на страницу Eclipse Adoptium', uk: 'Перейдіть на сторінку Eclipse Adoptium', de: 'Gehen Sie zur Eclipse Adoptium-Seite' },
      { en: 'Select the Java version you need', ru: 'Выберите нужную версию Java', uk: 'Виберіть потрібну версію Java', de: 'Wählen Sie die benötigte Java-Version' },
      { en: 'Choose your operating system and architecture', ru: 'Выберите вашу операционную систему и архитектуру', uk: 'Виберіть вашу операційну систему та архітектуру', de: 'Wählen Sie Ihr Betriebssystem und Ihre Architektur' },
      { en: 'Download the installer and run it', ru: 'Загрузите установщик и запустите его', uk: 'Завантажте інсталятор і запустіть його', de: 'Laden Sie das Installationsprogramm herunter und führen Sie es aus' }
    ]
  },
  'Amazon Corretto': {
    url: 'https://aws.amazon.com/corretto/',
    guide: [
      { en: 'Go to Amazon Corretto page', ru: 'Перейдите на страницу Amazon Corretto', uk: 'Перейдіть на сторінку Amazon Corretto', de: 'Gehen Sie zur Amazon Corretto-Seite' },
      { en: 'Select the Java version you need', ru: 'Выберите нужную версию Java', uk: 'Виберіть потрібну версію Java', de: 'Wählen Sie die benötigte Java-Version' },
      { en: 'Download the appropriate package for your OS', ru: 'Загрузите подходящий пакет для вашей ОС', uk: 'Завантажте відповідний пакет для вашої ОС', de: 'Laden Sie das entsprechende Paket für Ihr Betriebssystem herunter' },
      { en: 'Follow the installation instructions', ru: 'Следуйте инструкциям по установке', uk: 'Дотримуйтесь інструкцій з встановлення', de: 'Folgen Sie den Installationsanweisungen' }
    ]
  }
};

// DOM элементы
let systemInfo = {};
let selectedMinecraftVersion = 'latest';
let customVersion = '';

// Импорт функций установщика
let installerUI;
try {
  installerUI = require('./dist/installer-ui');
} catch (error) {
  console.log('Модуль установщика недоступен:', error);
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async () => {
  // Загрузка настроек
  const settings = await ipcRenderer.invoke('get-settings');
  applyTheme(settings.theme);
  changeLanguage(settings.language);
  
  // Установка выбранного языка в селекторе
  document.getElementById('language-select').value = settings.language;
  
  // Получение системной информации
  await getSystemInfo();
  
  // Обработчики событий
  setupEventListeners();
  
  // Инициализация установщика при первом запуске
  if (installerUI && typeof installerUI.initInstallerUI === 'function') {
    installerUI.initInstallerUI();
  } else {
    // Проверяем, первый ли это запуск
    const isFirstRun = await ipcRenderer.invoke('is-first-run');
    if (isFirstRun) {
      // Показываем простое сообщение, если модуль установщика недоступен
      showFirstRunMessage();
    }
  }
});

// Показать сообщение при первом запуске
function showFirstRunMessage() {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  container.style.display = 'flex';
  container.style.justifyContent = 'center';
  container.style.alignItems = 'center';
  container.style.zIndex = '1000';
  
  const message = document.createElement('div');
  message.style.backgroundColor = 'var(--card-background)';
  message.style.padding = '30px';
  message.style.borderRadius = '8px';
  message.style.maxWidth = '500px';
  message.style.textAlign = 'center';
  
  const title = document.createElement('h2');
  title.textContent = 'Добро пожаловать в JSR!';
  title.style.color = 'var(--primary-color)';
  title.style.marginBottom = '15px';
  
  const text = document.createElement('p');
  text.textContent = 'Спасибо за установку JSR. Это приложение поможет вам найти подходящую версию Java для Minecraft.';
  text.style.marginBottom = '20px';
  
  const button = document.createElement('button');
  button.textContent = 'Начать работу';
  button.style.padding = '10px 20px';
  button.style.backgroundColor = 'var(--primary-color)';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  
  button.addEventListener('click', () => {
    container.remove();
    ipcRenderer.invoke('save-install-config', {
      installDir: '',
      language: document.getElementById('language-select').value,
      createDesktopShortcut: false,
      createStartMenuShortcut: false,
      autoStart: false
    });
  });
  
  message.appendChild(title);
  message.appendChild(text);
  message.appendChild(button);
  container.appendChild(message);
  
  document.body.appendChild(container);
}

// Получение системной информации
async function getSystemInfo() {
  showLoading(true);
  try {
    systemInfo = await ipcRenderer.invoke('get-system-info');
    displaySystemInfo(systemInfo);
  } catch (error) {
    console.error('Ошибка при получении системной информации:', error);
  } finally {
    showLoading(false);
  }
}

// Отображение системной информации
function displaySystemInfo(info) {
  document.getElementById('cpu-info').textContent = `${info.cpu.manufacturer} ${info.cpu.brand} (${info.cpu.cores} cores)`;
  
  const totalMemGB = Math.round(info.mem.total / (1024 * 1024 * 1024));
  document.getElementById('memory-info').textContent = `${totalMemGB} GB`;
  
  document.getElementById('os-info').textContent = `${info.os.platform} ${info.os.release} (${info.os.arch})`;
  
  const gpuInfo = info.graphics.controllers.map(gpu => gpu.model).join(', ');
  document.getElementById('gpu-info').textContent = gpuInfo || 'Unknown';
}

// Настройка обработчиков событий
function setupEventListeners() {
  // Переключение темы
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme');
      applyTheme(theme);
      saveSettings({ theme });
    });
  });
  
  // Изменение языка
  document.getElementById('language-select').addEventListener('change', (e) => {
    const language = e.target.value;
    changeLanguage(language);
    saveSettings({ language });
  });
  
  // Выбор версии Minecraft
  document.getElementById('minecraft-version').addEventListener('change', (e) => {
    selectedMinecraftVersion = e.target.value;
    const customVersionContainer = document.getElementById('custom-version-container');
    
    if (selectedMinecraftVersion === 'custom') {
      customVersionContainer.classList.remove('hidden');
    } else {
      customVersionContainer.classList.add('hidden');
    }
  });
  
  // Ввод пользовательской версии
  document.getElementById('custom-version-input').addEventListener('input', (e) => {
    customVersion = e.target.value.trim();
  });
  
  // Кнопка анализа
  document.getElementById('analyze-btn').addEventListener('click', () => {
    analyzeJavaRequirements();
  });
  
  // Переключение разделов в боковой панели
  document.querySelectorAll('.sidebar-main-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      
      // Активация кнопки
      document.querySelectorAll('.sidebar-main-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Показ содержимого раздела
      document.querySelectorAll('.sidebar-section').forEach(section => section.classList.remove('active'));
      
      if (action === 'info') {
        document.getElementById('info-content').classList.add('active');
      } else if (action === 'search-java') {
        document.getElementById('search-java-content').classList.add('active');
      }
    });
  });
}

// Анализ требований к Java
function analyzeJavaRequirements() {
  showLoading(true);
  
  setTimeout(() => {
    let recommendedJava;
    let reason;
    
    // Определение версии Minecraft для анализа
    let versionToAnalyze = selectedMinecraftVersion;
    if (versionToAnalyze === 'custom' && customVersion) {
      // Анализ пользовательской версии
      if (customVersion.startsWith('1.17') || customVersion.startsWith('1.18') || customVersion.startsWith('1.19') || customVersion.startsWith('1.20')) {
        recommendedJava = javaVersionMap.release['1.17+'];
        reason = i18next.t('javaReasonModern');
      } else if (customVersion.startsWith('1.13') || customVersion.startsWith('1.14') || customVersion.startsWith('1.15') || customVersion.startsWith('1.16')) {
        recommendedJava = javaVersionMap.release['1.13-1.16.5'];
        reason = i18next.t('javaReasonMiddle');
      } else if (customVersion.startsWith('1.7') || customVersion.startsWith('1.8') || customVersion.startsWith('1.9') || 
                 customVersion.startsWith('1.10') || customVersion.startsWith('1.11') || customVersion.startsWith('1.12')) {
        recommendedJava = javaVersionMap.release['1.7.10-1.12.2'];
        reason = i18next.t('javaReasonLegacy');
      } else if (customVersion.startsWith('1.0') || customVersion.startsWith('1.1') || customVersion.startsWith('1.2') || 
                 customVersion.startsWith('1.3') || customVersion.startsWith('1.4') || customVersion.startsWith('1.5') || 
                 customVersion.startsWith('1.6')) {
        recommendedJava = javaVersionMap.release['1.0-1.6.4'];
        reason = i18next.t('javaReasonVeryOld');
      } else if (customVersion.startsWith('23w')) {
        recommendedJava = javaVersionMap.snapshot['23w'];
        reason = i18next.t('javaReasonSnapshot');
      } else if (customVersion.startsWith('20w') || customVersion.startsWith('21w') || customVersion.startsWith('22w')) {
        recommendedJava = javaVersionMap.snapshot['20w-22w'];
        reason = i18next.t('javaReasonSnapshot');
      } else if (customVersion.startsWith('18w') || customVersion.startsWith('19w')) {
        recommendedJava = javaVersionMap.snapshot['18w-19w'];
        reason = i18next.t('javaReasonSnapshot');
      } else if (customVersion.startsWith('b') || customVersion.includes('Beta')) {
        recommendedJava = javaVersionMap.beta;
        reason = i18next.t('javaReasonBeta');
      } else if (customVersion.startsWith('a') || customVersion.includes('Alpha')) {
        recommendedJava = javaVersionMap.alpha;
        reason = i18next.t('javaReasonAlpha');
      } else {
        // По умолчанию рекомендуем последнюю версию
        recommendedJava = javaVersionMap.release['1.17+'];
        reason = i18next.t('javaReasonDefault');
      }
    } else if (versionToAnalyze === 'latest') {
      recommendedJava = javaVersionMap.release['1.17+'];
      reason = i18next.t('javaReasonLatestRelease');
    } else if (versionToAnalyze === 'snapshot') {
      recommendedJava = javaVersionMap.snapshot['23w'];
      reason = i18next.t('javaReasonLatestSnapshot');
    } else if (versionToAnalyze === 'beta') {
      recommendedJava = javaVersionMap.beta;
      reason = i18next.t('javaReasonBeta');
    } else if (versionToAnalyze === 'alpha') {
      recommendedJava = javaVersionMap.alpha;
      reason = i18next.t('javaReasonAlpha');
    }
    
    // Отображение результатов
    displayResults(recommendedJava, reason);
    showLoading(false);
  }, 1000); // Имитация задержки для анимации загрузки
}

// Отображение результатов анализа
function displayResults(javaInfo, reason) {
  // Показываем секцию результатов
  document.getElementById('results-section').classList.remove('hidden');
  
  // Устанавливаем рекомендуемую версию Java
  document.getElementById('java-version-recommendation').textContent = javaInfo.version;
  document.getElementById('java-recommendation-reason').textContent = reason;
  
  // Очищаем предыдущие ссылки для скачивания
  const downloadLinksContainer = document.getElementById('download-links');
  downloadLinksContainer.innerHTML = '';
  
  // Добавляем ссылки для скачивания
  for (const [source, info] of Object.entries(javaDownloadSources)) {
    const downloadCard = document.createElement('div');
    downloadCard.className = 'download-card';
    
    const sourceTitle = document.createElement('h4');
    sourceTitle.textContent = source;
    
    const downloadLink = document.createElement('a');
    downloadLink.href = '#';
    downloadLink.className = 'download-link';
    downloadLink.textContent = i18next.t('visitDownloadPage');
    downloadLink.onclick = (e) => {
      e.preventDefault();
      // Открываем ссылку в браузере по умолчанию
      require('electron').shell.openExternal(info.url);
    };
    
    downloadCard.appendChild(sourceTitle);
    downloadCard.appendChild(downloadLink);
    downloadLinksContainer.appendChild(downloadCard);
  }
  
  // Очищаем предыдущие шаги установки
  const installationStepsContainer = document.getElementById('installation-steps');
  installationStepsContainer.innerHTML = '';
  
  // Добавляем шаги установки для первого источника (можно добавить переключение между источниками)
  const firstSource = Object.keys(javaDownloadSources)[0];
  const guide = javaDownloadSources[firstSource].guide;
  
  const stepsList = document.createElement('ol');
  guide.forEach(step => {
    const stepItem = document.createElement('li');
    stepItem.textContent = step[i18next.language] || step.en; // Используем текущий язык или английский по умолчанию
    stepsList.appendChild(stepItem);
  });
  
  installationStepsContainer.appendChild(stepsList);
}

// Применение темы
function applyTheme(theme) {
  const themeLink = document.getElementById('theme-css');
  themeLink.href = `styles/themes/${theme}.css`;
  
  // Активация кнопки темы
  document.querySelectorAll('.theme-btn').forEach(btn => {
    if (btn.getAttribute('data-theme') === theme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Изменение языка
function changeLanguage(language) {
  i18next.changeLanguage(language, (err, t) => {
    if (err) return console.error('Ошибка при изменении языка:', err);
    
    // Обновляем все элементы с атрибутом data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = t(key);
    });
    
    // Обновляем плейсхолдеры
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = t(key);
    });
    
    // Если есть результаты анализа, обновляем их
    if (!document.getElementById('results-section').classList.contains('hidden')) {
      analyzeJavaRequirements();
    }
  });
}

// Сохранение настроек
function saveSettings(newSettings) {
  ipcRenderer.invoke('get-settings').then(currentSettings => {
    const updatedSettings = { ...currentSettings, ...newSettings };
    ipcRenderer.send('save-settings', updatedSettings);
  });
}

// Показать/скрыть индикатор загрузки
function showLoading(show) {
  const loadingOverlay = document.getElementById('loading-overlay');
  if (show) {
    loadingOverlay.classList.add('visible');
  } else {
    loadingOverlay.classList.remove('visible');
  }
}