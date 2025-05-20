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
  
  // Инициализация electron IPC
  const { ipcRenderer } = require('electron');
  
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
    // Добавляем задержку для стабильного получения данных
    setTimeout(async () => {
      try {
        console.log('Запрос системной информации...');
        const { ipcRenderer } = require('electron');
        systemInfo = await ipcRenderer.invoke('get-system-info');
        console.log('Получена системная информация:', systemInfo);
        displaySystemInfo(systemInfo);
      } catch (innerError) {
        console.error('Внутренняя ошибка при получении системной информации:', innerError);
        displaySystemInfoError();
      } finally {
        showLoading(false);
      }
    }, 1000);
  } catch (error) {
    console.error('Ошибка при получении системной информации:', error);
    displaySystemInfoError();
    showLoading(false);
  }
}

// Отображение системной информации
function displaySystemInfo(info) {
  try {
    console.log('Displaying system info:', info);
    
    // Проверяем наличие элементов и данных
    const cpuInfoElement = document.getElementById('cpu-info');
    const memoryInfoElement = document.getElementById('memory-info');
    const osInfoElement = document.getElementById('os-info');
    const gpuInfoElement = document.getElementById('gpu-info');
    
    if (!info) {
      console.error('System info is undefined or null');
      displaySystemInfoError();
      return;
    }
    
    // CPU информация
    if (cpuInfoElement && info.cpu) {
      const cpuManufacturer = info.cpu.manufacturer || 'Unknown';
      const cpuBrand = info.cpu.brand || 'Unknown';
      const cpuCores = info.cpu.cores || 0;
      cpuInfoElement.textContent = `${cpuManufacturer} ${cpuBrand} (${cpuCores} ${i18next.t('cores') || 'cores'})`;
    } else if (cpuInfoElement) {
      cpuInfoElement.textContent = 'Не удалось получить информацию о CPU';
    }
    
    // Память
    if (memoryInfoElement && info.mem && info.mem.total) {
      const totalMemGB = Math.round(info.mem.total / (1024 * 1024 * 1024));
      memoryInfoElement.textContent = `${totalMemGB} GB`;
    } else if (memoryInfoElement) {
      memoryInfoElement.textContent = 'Не удалось получить информацию о памяти';
    }
    
    // Операционная система
    if (osInfoElement && info.os) {
      const osPlatform = info.os.platform || 'Unknown';
      const osRelease = info.os.release || 'Unknown';
      const osArch = info.os.arch || 'Unknown';
      osInfoElement.textContent = `${osPlatform} ${osRelease} (${osArch})`;
    } else if (osInfoElement) {
      osInfoElement.textContent = 'Не удалось получить информацию об ОС';
    }
    
    // Графика
    if (gpuInfoElement && info.graphics && info.graphics.controllers && info.graphics.controllers.length > 0) {
      const gpuModels = info.graphics.controllers.map(gpu => gpu.model || 'Unknown').join(', ');
      gpuInfoElement.textContent = gpuModels;
    } else if (gpuInfoElement) {
      gpuInfoElement.textContent = 'Не удалось получить информацию о графике';
    }
    
    console.log('System info displayed successfully');
  } catch (error) {
    console.error('Error displaying system information:', error);
    displaySystemInfoError();
  }
}

// Отображение ошибки системной информации
function displaySystemInfoError() {
  const elements = ['cpu-info', 'memory-info', 'os-info', 'gpu-info'];
  elements.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.textContent = 'Ошибка при отображении информации';
  });
}

// Настройка обработчиков событий
function setupEventListeners() {
  try {
    console.log('Setting up event listeners');
    
    // Переключение темы
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        console.log('Theme button clicked:', theme);
        applyTheme(theme);
        saveSettings({ theme });
      });
    });
    
    // Обработчики для кнопок управления окном
    const minimizeBtn = document.getElementById('minimize-btn');
    const maximizeBtn = document.getElementById('maximize-btn');
    const closeBtn = document.getElementById('close-btn');
    
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => {
        ipcRenderer.send('minimize-window');
      });
    }
    
    if (maximizeBtn) {
      maximizeBtn.addEventListener('click', () => {
        ipcRenderer.send('maximize-window');
      });
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        ipcRenderer.send('close-window');
      });
    }
    
    // Изменение языка
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => {
        const language = e.target.value;
        console.log('Language changed to:', language);
        changeLanguage(language);
        saveSettings({ language });
      });
    }
    
    // Боковая панель и вкладки
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const mainButtons = document.querySelectorAll('.sidebar-main-btn');
    
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        console.log('Sidebar toggle clicked');
        sidebar.classList.toggle('collapsed');
      });
    }
    
    if (mainButtons.length > 0) {
      mainButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.getAttribute('data-action');
          console.log('Sidebar button clicked:', action);
          activateTab(action);
        });
      });
    }
    
    // Добавляем обработчики для меню
    setupMenuHandlers();
    
    // Загружаем информацию о версиях Minecraft и Java
    loadMinecraftAndJavaVersions();
    
    // Загрузка информации о Java при переключении на соответствующую вкладку
    const searchJavaBtn = document.getElementById('search-java-btn');
    if (searchJavaBtn) {
      searchJavaBtn.addEventListener('click', async () => {
        console.log('Loading Java installations...');
        try {
          const javaInstallations = await ipcRenderer.invoke('get-java-installations');
          console.log('Java installations loaded:', javaInstallations);
          renderJavaInstallations(javaInstallations);
        } catch (error) {
          console.error('Error loading Java installations:', error);
          renderJavaError();
        }
      });
    }
    
    // Обработчик для кнопки анализа
    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => {
        console.log('Analyze button clicked');
        analyzeJavaRequirements();
      });
    }
    
    console.log('Event listeners set up successfully');
  } catch (error) {
    console.error('Error setting up event listeners:', error);
  }
}

// Активация вкладки
function activateTab(action) {
  try {
    console.log('Activating tab:', action);
    
    // Получаем все кнопки и контенты
    const buttons = document.querySelectorAll('.sidebar-main-btn');
    const contents = document.querySelectorAll('.sidebar-section');
    
    // Деактивируем все
    buttons.forEach(btn => btn.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    // Активируем нужную вкладку
    if (action === 'info') {
      document.getElementById('info-btn').classList.add('active');
      document.getElementById('info-content').classList.add('active');
    } else if (action === 'search-java') {
      document.getElementById('search-java-btn').classList.add('active');
      document.getElementById('search-java-content').classList.add('active');
    }
    
    console.log('Tab activated successfully:', action);
  } catch (error) {
    console.error('Error activating tab:', error);
  }
}

// Отображение информации о Java
function renderJavaInstallations(installations) {
  try {
    console.log('Rendering Java installations:', installations);
    const javaListElement = document.getElementById('java-list');
    
    if (!javaListElement) {
      console.error('Java list element not found');
      return;
    }
    
    // Показываем индикатор загрузки
    javaListElement.innerHTML = `<div class="loading-java fade-in"><div class="spinner small"></div><p>${i18next.t('loadingJava')}</p></div>`;
    
    // Если нет установленных Java
    if (!installations || installations.length === 0) {
      javaListElement.innerHTML = `<div class="no-java-message fade-in">${i18next.t('noJavaFound')}</div>`;
      return;
    }
    
    // Очищаем список
    javaListElement.innerHTML = '';
    
    // Добавляем каждую установку Java
    installations.forEach((java, index) => {
      const javaItem = document.createElement('div');
      javaItem.className = 'java-item fade-in';
      javaItem.dataset.version = java.version;
      javaItem.dataset.vendor = java.vendor;
      javaItem.style.animationDelay = `${index * 0.1}s`;
      
      javaItem.innerHTML = `
        <div class="java-item-header">
          <span class="java-version">${java.version}</span>
          ${java.isDefault ? `<span class="java-default-badge">${i18next.t('default')}</span>` : ''}
        </div>
        <div class="java-item-details">
          <div class="java-detail">
            <span class="detail-label">${i18next.t('vendor')}:</span>
            <span class="detail-value">${java.vendor}</span>
          </div>
          <div class="java-detail">
            <span class="detail-label">${i18next.t('architecture')}:</span>
            <span class="detail-value">${java.architecture}</span>
          </div>
          <div class="java-detail">
            <span class="detail-label">${i18next.t('path')}:</span>
            <span class="detail-value java-path">${java.path}</span>
          </div>
        </div>
      `;
      
      javaListElement.appendChild(javaItem);
    });
    
    console.log('Java installations rendered successfully');
  } catch (error) {
    console.error('Error rendering Java installations:', error);
    renderJavaError();
  }
}

// Отображение ошибки при загрузке Java
function renderJavaError() {
  try {
    const javaListElement = document.getElementById('java-list');
    if (javaListElement) {
      javaListElement.innerHTML = `<div class="error-message">${i18next.t('javaLoadError')}</div>`;
    }
  } catch (error) {
    console.error('Error rendering Java error message:', error);
  }
}

// Выбор версии Minecraft
document.getElementById('minecraft-version').addEventListener('change', (e) => {
  selectedMinecraftVersion = e.target.value;
  const customVersionContainer = document.getElementById('custom-version-container');
  
  if (selectedMinecraftVersion === 'custom') {
    customVersionContainer.classList.remove('hidden');
  } else {
    customVersionContainer.classList.add('hidden');
  }
  
  console.log('Minecraft version changed to:', selectedMinecraftVersion);
});

// Ввод пользовательской версии
document.getElementById('custom-version-input').addEventListener('input', (e) => {
  customVersion = e.target.value.trim();
});

// Кнопка анализа - обработчик перенесен в setupEventListeners

// Эта функция перенесена в setupEventListeners

// Функция настройки обработчиков меню
function setupMenuHandlers() {
  try {
    console.log('Setting up menu handlers');
    
    // Обработчик для меню
    const menuItems = document.querySelectorAll('.menu-item');
    if (menuItems && menuItems.length > 0) {
      menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
          const action = item.getAttribute('data-action');
          console.log('Menu item clicked:', action);
          
          if (action === 'settings') {
            showSettings();
          } else if (action === 'about') {
            showAbout();
          } else if (action === 'exit') {
            window.close();
          }
          
          e.stopPropagation();
        });
      });
    } else {
      console.log('No menu items found');
    }
    
    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
      const menu = document.querySelector('.menu');
      if (menu && !menu.contains(e.target)) {
        menu.classList.remove('active');
      }
    });
    
    console.log('Menu handlers set up successfully');
  } catch (error) {
    console.error('Error setting up menu handlers:', error);
  }
}

// Функция загрузки информации о версиях Minecraft и Java
function loadMinecraftAndJavaVersions() {
  try {
    console.log('Loading Minecraft and Java versions');
    
    // Получаем информацию о Java
    setTimeout(async () => {
      try {
        const javaInstallations = await ipcRenderer.invoke('get-java-installations');
        console.log('Java installations loaded:', javaInstallations);
        
        // Отображаем информацию о Java в системной информации
        const javaInfoElement = document.createElement('div');
        javaInfoElement.className = 'info-card';
        javaInfoElement.innerHTML = `
          <h3 data-i18n="java">Java</h3>
          <p id="java-info">${javaInstallations && javaInstallations.length > 0 ? 
            javaInstallations[0].version : 'Не установлено'}</p>
        `;
        
        const systemInfoContainer = document.querySelector('.system-info-container');
        if (systemInfoContainer) {
          systemInfoContainer.appendChild(javaInfoElement);
        }
        
        // Получаем информацию о Minecraft
        // Здесь можно добавить код для получения установленных версий Minecraft
        // Например, через проверку папок .minecraft
        
        const minecraftInfoElement = document.createElement('div');
        minecraftInfoElement.className = 'info-card';
        minecraftInfoElement.innerHTML = `
          <h3 data-i18n="minecraft">Minecraft</h3>
          <p id="minecraft-info">Нажмите кнопку анализа для проверки</p>
        `;
        
        if (systemInfoContainer) {
          systemInfoContainer.appendChild(minecraftInfoElement);
        }
        
        // Обновляем переводы для новых элементов
        if (i18next && i18next.isInitialized) {
          document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) element.textContent = i18next.t(key);
          });
        }
        
        console.log('Minecraft and Java versions loaded successfully');
      } catch (error) {
        console.error('Error loading Minecraft and Java versions:', error);
      }
    }, 1500);
  } catch (error) {
    console.error('Error in loadMinecraftAndJavaVersions:', error);
  }
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
  try {
    console.log('Applying theme:', theme);
    const themeLink = document.getElementById('theme-css');
    if (!themeLink) {
      console.error('Theme CSS link element not found');
      return;
    }
    
    // Добавляем анимацию перехода
    document.body.classList.add('theme-transition');
    
    // Устанавливаем новую тему
    const themePath = `./styles/themes/${theme}.css`;
    console.log('Setting theme path:', themePath);
    themeLink.setAttribute('href', themePath);
    
    // Обновляем класс body
    const oldThemeClass = document.body.className;
    document.body.className = `theme-${theme} theme-transition`;
    console.log('Updated body class from', oldThemeClass, 'to', document.body.className);
    
    // Удаляем класс анимации после завершения перехода
    setTimeout(() => {
      document.body.classList.remove('theme-transition');
      console.log('Removed transition class, current body class:', document.body.className);
    }, 500);
    
    // Активация кнопки темы
    document.querySelectorAll('.theme-btn').forEach(btn => {
      const btnTheme = btn.getAttribute('data-theme');
      if (btnTheme === theme) {
        btn.classList.add('active');
        console.log(`Activated ${btnTheme} theme button`);
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Сохраняем тему в локальное хранилище для дополнительной надежности
    localStorage.setItem('theme', theme);
    
    console.log('Theme applied successfully:', theme);
  } catch (error) {
    console.error('Error applying theme:', error);
  }
}

// Изменение языка
function changeLanguage(language) {
  i18next.changeLanguage(language, (err, t) => {
    if (err) return console.error('Ошибка при изменении языка:', err);
    
    // Обновляем все элементы с атрибутом data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        // Проверяем, есть ли параметры для перевода
        const paramsAttr = element.getAttribute('data-i18n-params');
        let params = {};
        
        if (paramsAttr) {
          try {
            params = JSON.parse(paramsAttr);
          } catch (e) {
            console.error('Ошибка при парсинге параметров перевода:', e);
          }
        }
        
        element.textContent = t(key, params);
      }
    });
    
    // Обновляем плейсхолдеры
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      if (key) {
        element.placeholder = t(key);
      }
    });
    
    // Обновляем заголовок приложения
    document.title = t('appTitle');
    
    // Если есть результаты анализа, обновляем их
    if (!document.getElementById('results-section').classList.contains('hidden')) {
      analyzeJavaRequirements();
    }
  });
}

// Сохранение настроек
function saveSettings(newSettings) {
  window.electronAPI.getSettings().then(currentSettings => {
    const updatedSettings = { ...currentSettings, ...newSettings };
    window.electronAPI.saveSettings(updatedSettings);
  }).catch(error => {
    console.error('Ошибка при сохранении настроек:', error);
    showErrorMessage('Не удалось сохранить настройки. Пожалуйста, попробуйте еще раз.');
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