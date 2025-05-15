const { MSICreator } = require('electron-wix-msi');
const path = require('path');

// Пути для установщика
const APP_DIR = path.resolve(__dirname, './dist/win-unpacked');
const OUT_DIR = path.resolve(__dirname, './windows-installer');

// Создание установщика
async function createInstaller() {
  try {
    // Конфигурация установщика
    const msiCreator = new MSICreator({
      appDirectory: APP_DIR,
      outputDirectory: OUT_DIR,
      description: 'Приложение для определения подходящей версии Java для Minecraft',
      exe: 'JSR',
      name: 'JSR',
      manufacturer: 'BANSAFAn',
      version: '1.0.0',
      shortcutName: 'JSR',
      ui: {
        chooseDirectory: true,
        images: {
          background: path.resolve(__dirname, './assets/images/installer-bg.png'),
          banner: path.resolve(__dirname, './assets/images/installer-banner.png'),
          exclamationIcon: path.resolve(__dirname, './assets/images/warning.png'),
          infoIcon: path.resolve(__dirname, './assets/images/info.png'),
          newIcon: path.resolve(__dirname, './assets/images/new.png'),
          upIcon: path.resolve(__dirname, './assets/images/up.png')
        }
      },
      features: {
        autoLaunch: true,
        startMenuShortcut: true,
        desktopShortcut: true
      },
      // Локализация установщика
      localizations: [
        {
          language: 1033, // Английский
          values: {
            'ApplicationName': 'JSR',
            'ManufacturerName': 'BANSAFAn',
            'DescriptionText': 'Application for determining the appropriate Java version for Minecraft',
            'LicenseText': 'MIT License',
            'WelcomeText': 'Welcome to the JSR Setup Wizard',
            'InstallDirText': 'Select the folder where you want to install JSR'
          }
        },
        {
          language: 1049, // Русский
          values: {
            'ApplicationName': 'JSR',
            'ManufacturerName': 'BANSAFAn',
            'DescriptionText': 'Приложение для определения подходящей версии Java для Minecraft',
            'LicenseText': 'Лицензия MIT',
            'WelcomeText': 'Добро пожаловать в мастер установки JSR',
            'InstallDirText': 'Выберите папку, в которую вы хотите установить JSR'
          }
        }
      ]
    });

    // Создание .wxs файла
    await msiCreator.create();
    
    // Компиляция .msi файла
    await msiCreator.compile();
    
    console.log('Установщик Windows успешно создан!');
  } catch (error) {
    console.error('Ошибка при создании установщика:', error);
  }
}

// Запуск создания установщика
createInstaller();