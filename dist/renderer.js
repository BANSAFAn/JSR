"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18next_1 = __importDefault(require("i18next"));
// Load translations
const translations = {
    en: require('../locales/en.json'),
    ru: require('../locales/ru.json'),
    uk: require('../locales/uk.json'),
    de: require('../locales/de.json')
};
// Initialize i18next
i18next_1.default.init({
    lng: 'en',
    resources: {
        en: { translation: translations.en },
        ru: { translation: translations.ru },
        uk: { translation: translations.uk },
        de: { translation: translations.de }
    }
});
// Импорт модуля бокового бара
const sidebar_1 = require("./sidebar");
// Java version data for Minecraft
const javaVersionMap = {
    // Release versions
    'release': {
        '1.17+': { version: 'Java 17', minVersion: '17.0.0' },
        '1.13-1.16.5': { version: 'Java 8-11', minVersion: '1.8.0', maxVersion: '11.0.2' },
        '1.7.10-1.12.2': { version: 'Java 8', minVersion: '1.8.0', maxVersion: '1.8.9' },
        '1.0-1.6.4': { version: 'Java 6-7', minVersion: '1.6.0', maxVersion: '1.7.0' }
    },
    // Snapshots
    'snapshot': {
        '23w': { version: 'Java 17', minVersion: '17.0.0' },
        '20w-22w': { version: 'Java 16-17', minVersion: '16.0.0' },
        '18w-19w': { version: 'Java 8-11', minVersion: '1.8.0', maxVersion: '11.0.2' }
    },
    // Beta versions
    'beta': { version: 'Java 6-7', minVersion: '1.6.0', maxVersion: '1.7.0' },
    // Alpha versions
    'alpha': { version: 'Java 5-6', minVersion: '1.5.0', maxVersion: '1.6.0' }
};
// Java download sources
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
    },
    'Azul Zulu': {
        url: 'https://www.azul.com/downloads/',
        guide: [
            { en: 'Go to Azul Zulu Downloads page', ru: 'Перейдите на страницу загрузки Azul Zulu', uk: 'Перейдіть на сторінку завантаження Azul Zulu', de: 'Gehen Sie zur Azul Zulu-Download-Seite' },
            { en: 'Select the Java version you need', ru: 'Выберите нужную версию Java', uk: 'Виберіть потрібну версію Java', de: 'Wählen Sie die benötigte Java-Version' },
            { en: 'Choose your operating system and architecture', ru: 'Выберите вашу операционную систему и архитектуру', uk: 'Виберіть вашу операційну систему та архітектуру', de: 'Wählen Sie Ihr Betriebssystem und Ihre Architektur' },
            { en: 'Download and install the package', ru: 'Загрузите и установите пакет', uk: 'Завантажте та встановіть пакет', de: 'Laden Sie das Paket herunter und installieren Sie es' }
        ]
    },
    'BellSoft Liberica': {
        url: 'https://bell-sw.com/pages/downloads/',
        guide: [
            { en: 'Go to BellSoft Liberica Downloads page', ru: 'Перейдите на страницу загрузки BellSoft Liberica', uk: 'Перейдіть на сторінку завантаження BellSoft Liberica', de: 'Gehen Sie zur BellSoft Liberica-Download-Seite' },
            { en: 'Select the Java version you need', ru: 'Выберите нужную версию Java', uk: 'Виберіть потрібну версію Java', de: 'Wählen Sie die benötigte Java-Version' },
            { en: 'Choose your operating system and package type', ru: 'Выберите вашу операционную систему и тип пакета', uk: 'Виберіть вашу операційну систему та тип пакету', de: 'Wählen Sie Ihr Betriebssystem und Pakettyp' },
            { en: 'Download and run the installer', ru: 'Загрузите и запустите установщик', uk: 'Завантажте та запустіть інсталятор', de: 'Laden Sie das Installationsprogramm herunter und führen Sie es aus' }
        ]
    },
    'Microsoft Build of OpenJDK': {
        url: 'https://www.microsoft.com/openjdk',
        guide: [
            { en: 'Go to Microsoft Build of OpenJDK page', ru: 'Перейдите на страницу Microsoft Build of OpenJDK', uk: 'Перейдіть на сторінку Microsoft Build of OpenJDK', de: 'Gehen Sie zur Microsoft Build of OpenJDK-Seite' },
            { en: 'Select the Java version you need', ru: 'Выберите нужную версию Java', uk: 'Виберіть потрібну версію Java', de: 'Wählen Sie die benötigte Java-Version' },
            { en: 'Choose your operating system', ru: 'Выберите вашу операционную систему', uk: 'Виберіть вашу операційну систему', de: 'Wählen Sie Ihr Betriebssystem' },
            { en: 'Download and install the package', ru: 'Загрузите и установите пакет', uk: 'Завантажте та встановіть пакет', de: 'Laden Sie das Paket herunter und installieren Sie es' }
        ]
    }
};
// DOM elements
let systemInfo = {};
let selectedMinecraftVersion = 'latest';
let customVersion = '';
// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    // Load settings
    const settings = await window.electronAPI.getSettings();
    applyTheme(settings.theme);
    changeLanguage(settings.language);
    // Set selected language in selector
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.value = settings.language;
    }
    // Get system information
    await getSystemInfo();
    // Setup event listeners
    setupEventListeners();
    // Initialize sidebar
    const sidebar = new sidebar_1.Sidebar();
    // Добавляем анимацию появления контента
    setTimeout(() => {
        document.body.classList.add('content-loaded');
    }, 300);
});
// Get system information
async function getSystemInfo() {
    showLoading(true);
    try {
        systemInfo = await window.electronAPI.getSystemInfo();
        displaySystemInfo();
        // Также получаем информацию о Java
        await getJavaInfo();
    }
    catch (error) {
        console.error('Error getting system info:', error);
    }
    finally {
        showLoading(false);
    }
}
// Получение информации о Java
async function getJavaInfo() {
    try {
        const javaInfo = await window.electronAPI.getJavaInfo();
        displayJavaInfo(javaInfo);
    }
    catch (error) {
        console.error('Error getting Java info:', error);
    }
}
// Display system information
function displaySystemInfo() {
    if (!systemInfo)
        return;
    const cpuInfoElement = document.getElementById('cpu-info');
    const memoryInfoElement = document.getElementById('memory-info');
    const osInfoElement = document.getElementById('os-info');
    const gpuInfoElement = document.getElementById('gpu-info');
    if (cpuInfoElement && systemInfo.cpu) {
        // Добавляем больше информации о процессоре
        const cpuSpeed = systemInfo.cpu.speed ? `${systemInfo.cpu.speed} GHz` : '';
        const cpuMaxSpeed = systemInfo.cpu.speedMax ? ` (до ${systemInfo.cpu.speedMax} GHz)` : '';
        cpuInfoElement.textContent = `${systemInfo.cpu.manufacturer} ${systemInfo.cpu.brand} (${systemInfo.cpu.cores} ${i18next_1.default.t('cores')}) ${cpuSpeed}${cpuMaxSpeed}`;
    }
    if (memoryInfoElement && systemInfo.mem) {
        // Показываем больше информации о памяти
        memoryInfoElement.textContent = `${systemInfo.mem.totalFormatted} (${i18next_1.default.t('used')}: ${systemInfo.mem.usedFormatted}, ${i18next_1.default.t('free')}: ${systemInfo.mem.freeFormatted})`;
    }
    if (osInfoElement && systemInfo.os) {
        // Добавляем больше информации об ОС
        osInfoElement.textContent = `${systemInfo.os.distro} ${systemInfo.os.release} (${systemInfo.os.platform}, ${systemInfo.os.arch})`;
    }
    if (gpuInfoElement && systemInfo.graphics && systemInfo.graphics.controllers && systemInfo.graphics.controllers.length > 0) {
        // Показываем информацию о всех видеокартах
        const gpuInfo = systemInfo.graphics.controllers.map((controller) => controller.model).join(', ');
        gpuInfoElement.textContent = gpuInfo;
    }
}
// Отображение информации о Java
function displayJavaInfo(javaInfo) {
    const javaListElement = document.getElementById('java-list');
    if (!javaListElement)
        return;
    // Очищаем список
    javaListElement.innerHTML = '';
    if (javaInfo.length === 0 || javaInfo.error) {
        const noJavaElement = document.createElement('div');
        noJavaElement.className = 'no-java-info';
        noJavaElement.textContent = i18next_1.default.t('noJavaFound');
        javaListElement.appendChild(noJavaElement);
        return;
    }
    // Создаем элементы для каждой установки Java
    javaInfo.forEach(java => {
        const javaItem = document.createElement('div');
        javaItem.className = 'java-item';
        const javaName = document.createElement('h4');
        javaName.textContent = java.name;
        javaItem.appendChild(javaName);
        const javaVersion = document.createElement('p');
        javaVersion.className = 'java-version';
        javaVersion.textContent = `${i18next_1.default.t('version')}: ${java.version}`;
        javaItem.appendChild(javaVersion);
        const javaPath = document.createElement('p');
        javaPath.className = 'java-path';
        javaPath.textContent = `${i18next_1.default.t('path')}: ${java.path || java.location || i18next_1.default.t('unknown')}`;
        javaItem.appendChild(javaPath);
        // Определяем, для каких версий Minecraft подходит эта Java
        const mcVersions = getCompatibleMinecraftVersions(java.version);
        if (mcVersions.length > 0) {
            const compatibleVersions = document.createElement('p');
            compatibleVersions.className = 'compatible-versions';
            compatibleVersions.textContent = `${i18next_1.default.t('compatibleWith')}: ${mcVersions.join(', ')}`;
            javaItem.appendChild(compatibleVersions);
        }
        javaListElement.appendChild(javaItem);
    });
}
// Определение совместимых версий Minecraft для Java
function getCompatibleMinecraftVersions(javaVersion) {
    if (!javaVersion)
        return [];
    // Извлекаем основную версию Java
    const versionMatch = javaVersion.match(/\d+/);
    if (!versionMatch)
        return [];
    const majorVersion = parseInt(versionMatch[0], 10);
    const compatibleVersions = [];
    if (majorVersion >= 17) {
        compatibleVersions.push('1.17+');
    }
    if (majorVersion >= 8 && majorVersion <= 16) {
        compatibleVersions.push('1.13-1.16.5');
    }
    if (majorVersion === 8) {
        compatibleVersions.push('1.7.10-1.12.2');
    }
    if (majorVersion === 6 || majorVersion === 7) {
        compatibleVersions.push('1.0-1.6.4');
    }
    return compatibleVersions;
}
// Setup event listeners
function setupEventListeners() {
    // Кнопки управления окном
    const minimizeBtn = document.getElementById('minimize-btn');
    const maximizeBtn = document.getElementById('maximize-btn');
    const closeBtn = document.getElementById('close-btn');
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            window.electronAPI.minimizeWindow();
        });
    }
    if (maximizeBtn) {
        maximizeBtn.addEventListener('click', () => {
            window.electronAPI.maximizeWindow();
        });
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.electronAPI.closeWindow();
        });
    }
    // Version selection
    const versionSelect = document.getElementById('minecraft-version');
    if (versionSelect) {
        versionSelect.addEventListener('change', (e) => {
            const target = e.target;
            selectedMinecraftVersion = target.value;
            toggleCustomVersionInput();
        });
    }
    // Custom version input
    const customVersionInput = document.getElementById('custom-version-input');
    if (customVersionInput) {
        customVersionInput.addEventListener('input', (e) => {
            const target = e.target;
            customVersion = target.value;
        });
    }
    // Analyze button
    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeMinecraftVersion);
    }
    // Language selector
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            const target = e.target;
            changeLanguage(target.value);
            saveSettings();
        });
    }
    // Theme buttons
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            const target = e.currentTarget;
            const theme = target.getAttribute('data-theme');
            if (theme) {
                applyTheme(theme);
                saveSettings();
            }
        });
    });
    // Боковая панель
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    if (sidebarToggle && sidebar && mainContent) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            mainContent.classList.toggle('blur');
        });
    }
    // Кнопки боковой панели
    const sidebarButtons = document.querySelectorAll('.sidebar-main-btn');
    const sidebarSections = document.querySelectorAll('.sidebar-section');
    sidebarButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Удаляем активный класс со всех кнопок и секций
            sidebarButtons.forEach(btn => btn.classList.remove('active'));
            sidebarSections.forEach(section => section.classList.remove('active'));
            // Добавляем активный класс к нажатой кнопке
            button.classList.add('active');
            // Показываем соответствующую секцию
            const action = button.getAttribute('data-action');
            if (action) {
                const section = document.getElementById(`${action}-content`);
                if (section) {
                    section.classList.add('active');
                }
            }
        });
    });
}
// Toggle custom version input visibility
function toggleCustomVersionInput() {
    const customVersionContainer = document.getElementById('custom-version-container');
    if (customVersionContainer) {
        customVersionContainer.style.display = selectedMinecraftVersion === 'custom' ? 'block' : 'none';
    }
}
// Analyze Minecraft version
function analyzeMinecraftVersion() {
    let version = '';
    let versionType = 'release';
    // Determine version and type
    switch (selectedMinecraftVersion) {
        case 'latest':
            version = '1.20.2'; // Example latest version
            versionType = 'release';
            break;
        case 'snapshot':
            version = '23w42a'; // Example snapshot
            versionType = 'snapshot';
            break;
        case 'beta':
            version = 'b1.7.3'; // Example beta
            versionType = 'beta';
            break;
        case 'alpha':
            version = 'a1.2.6'; // Example alpha
            versionType = 'alpha';
            break;
        case 'custom':
            version = customVersion;
            // Determine type from version format
            if (version.startsWith('a')) {
                versionType = 'alpha';
            }
            else if (version.startsWith('b')) {
                versionType = 'beta';
            }
            else if (/^\d+w\d+[a-z]?$/.test(version)) {
                versionType = 'snapshot';
            }
            else {
                versionType = 'release';
            }
            break;
    }
    // Find recommended Java version
    const recommendedJava = findRecommendedJava(version, versionType);
    displayRecommendation(recommendedJava, version, versionType);
    showDownloadOptions(recommendedJava);
}
// Find recommended Java version
function findRecommendedJava(version, versionType) {
    let recommendedJava;
    if (versionType === 'release') {
        // Check release versions
        if (version.startsWith('1.17') || parseFloat(version) >= 1.17) {
            recommendedJava = javaVersionMap.release['1.17+'];
        }
        else if ((version.startsWith('1.13') || parseFloat(version) >= 1.13) &&
            (version.startsWith('1.16') || parseFloat(version) <= 1.16)) {
            recommendedJava = javaVersionMap.release['1.13-1.16.5'];
        }
        else if ((version.startsWith('1.7.10') || parseFloat(version) >= 1.7) &&
            (version.startsWith('1.12') || parseFloat(version) <= 1.12)) {
            recommendedJava = javaVersionMap.release['1.7.10-1.12.2'];
        }
        else {
            recommendedJava = javaVersionMap.release['1.0-1.6.4'];
        }
    }
    else if (versionType === 'snapshot') {
        // Check snapshot versions
        if (version.startsWith('23w')) {
            recommendedJava = javaVersionMap.snapshot['23w'];
        }
        else if (version.startsWith('20w') || version.startsWith('21w') || version.startsWith('22w')) {
            recommendedJava = javaVersionMap.snapshot['20w-22w'];
        }
        else {
            recommendedJava = javaVersionMap.snapshot['18w-19w'];
        }
    }
    else if (versionType === 'beta') {
        recommendedJava = javaVersionMap.beta;
    }
    else {
        // Alpha or unknown
        recommendedJava = javaVersionMap.alpha;
    }
    return recommendedJava;
}
// Display recommendation
function displayRecommendation(javaInfo, version, versionType) {
    const recommendationElement = document.getElementById('java-recommendation');
    const reasonElement = document.getElementById('recommendation-reason');
    if (recommendationElement) {
        recommendationElement.textContent = javaInfo.version;
    }
    if (reasonElement) {
        let reasonKey = '';
        // Determine reason key
        if (versionType === 'release') {
            if (version.startsWith('1.17') || parseFloat(version) >= 1.17) {
                reasonKey = 'javaReasonModern';
            }
            else if ((version.startsWith('1.13') || parseFloat(version) >= 1.13) &&
                (version.startsWith('1.16') || parseFloat(version) <= 1.16)) {
                reasonKey = 'javaReasonMiddle';
            }
            else if ((version.startsWith('1.7.10') || parseFloat(version) >= 1.7) &&
                (version.startsWith('1.12') || parseFloat(version) <= 1.12)) {
                reasonKey = 'javaReasonLegacy';
            }
            else {
                reasonKey = 'javaReasonVeryOld';
            }
        }
        else if (versionType === 'snapshot') {
            reasonKey = 'javaReasonSnapshot';
        }
        else if (versionType === 'beta') {
            reasonKey = 'javaReasonBeta';
        }
        else if (versionType === 'alpha') {
            reasonKey = 'javaReasonAlpha';
        }
        else {
            reasonKey = 'javaReasonDefault';
        }
        reasonElement.textContent = i18next_1.default.t(reasonKey);
    }
}
// Show download options with animation
function showDownloadOptions(javaInfo) {
    const downloadOptionsContainer = document.getElementById('download-options');
    const installationGuideContainer = document.getElementById('installation-guide');
    if (downloadOptionsContainer) {
        // Анимация исчезновения текущих кнопок
        downloadOptionsContainer.classList.add('fade-out');
        setTimeout(() => {
            downloadOptionsContainer.innerHTML = '';
            downloadOptionsContainer.classList.remove('fade-out');
            // Create download buttons for each source
            Object.keys(javaDownloadSources).forEach((source, index) => {
                const button = document.createElement('button');
                button.className = 'download-button';
                button.textContent = source;
                button.style.animationDelay = `${index * 0.1}s`;
                button.classList.add('fade-in');
                button.addEventListener('click', () => {
                    showInstallationGuide(source, javaInfo);
                });
                downloadOptionsContainer.appendChild(button);
            });
        }, 300);
    }
    // Clear installation guide
    if (installationGuideContainer) {
        installationGuideContainer.innerHTML = '';
    }
}
// Show installation guide with animation
function showInstallationGuide(source, javaInfo) {
    const installationGuideContainer = document.getElementById('installation-guide');
    const currentLanguage = i18next_1.default.language;
    if (installationGuideContainer && javaDownloadSources[source]) {
        // Анимация исчезновения текущего руководства
        installationGuideContainer.classList.add('fade-out');
        setTimeout(() => {
            installationGuideContainer.innerHTML = '';
            installationGuideContainer.classList.remove('fade-out');
            installationGuideContainer.classList.add('fade-in');
            // Create guide title
            const title = document.createElement('h3');
            title.textContent = i18next_1.default.t('installationGuide');
            title.classList.add('slide-in');
            installationGuideContainer.appendChild(title);
            // Create guide steps list
            const list = document.createElement('ol');
            list.classList.add('guide-list');
            javaDownloadSources[source].guide.forEach((step, index) => {
                const item = document.createElement('li');
                item.textContent = step[currentLanguage];
                item.style.animationDelay = `${index * 0.1 + 0.2}s`;
                item.classList.add('slide-in');
                list.appendChild(item);
            });
            installationGuideContainer.appendChild(list);
            // Create download link
            const link = document.createElement('a');
            link.href = javaDownloadSources[source].url;
            link.textContent = i18next_1.default.t('visitDownloadPage');
            link.target = '_blank';
            link.className = 'download-link';
            link.classList.add('pulse');
            installationGuideContainer.appendChild(link);
            // Удаляем класс анимации после завершения
            setTimeout(() => {
                installationGuideContainer.classList.remove('fade-in');
            }, 500);
        }, 300);
    }
}
// Apply theme with animation
function applyTheme(theme) {
    // Добавляем класс для анимации перехода
    document.body.classList.add('theme-transition');
    // Устанавливаем новую тему после небольшой задержки
    setTimeout(() => {
        document.body.className = `theme-${theme} theme-transition`;
        // Удаляем класс анимации после завершения перехода
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 500);
    }, 50);
    // Обновляем активную кнопку темы
    const themeButtons = document.querySelectorAll('.theme-button');
    themeButtons.forEach(button => {
        const buttonTheme = button.getAttribute('data-theme');
        if (buttonTheme === theme) {
            button.classList.add('active');
        }
        else {
            button.classList.remove('active');
        }
    });
}
// Change language with animation
function changeLanguage(language) {
    // Добавляем класс для анимации перехода
    document.body.classList.add('language-transition');
    // Меняем язык после небольшой затухания
    setTimeout(() => {
        i18next_1.default.changeLanguage(language, (err) => {
            if (err)
                return console.error('Error changing language:', err);
            updateUITexts();
            // Удаляем класс анимации после обновления текстов
            setTimeout(() => {
                document.body.classList.remove('language-transition');
            }, 300);
        });
    }, 150);
}
// Update UI texts
function updateUITexts() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key) {
            element.textContent = i18next_1.default.t(key);
        }
    });
    // Update page title
    document.title = i18next_1.default.t('appTitle');
    // Re-display system info and recommendation if available
    if (Object.keys(systemInfo).length > 0) {
        displaySystemInfo();
    }
}
// Show/hide loading indicator
function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
}
// Save settings
function saveSettings() {
    const settings = {
        theme: document.body.className.replace('theme-', ''),
        language: i18next_1.default.language
    };
    window.electronAPI.saveSettings(settings);
}
//# sourceMappingURL=renderer.js.map