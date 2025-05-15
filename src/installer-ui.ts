import { ipcRenderer } from 'electron';
import * as path from 'path';

// Интерфейс для настроек установки
interface InstallConfig {
  installDir: string;
  language: string;
  createDesktopShortcut: boolean;
  createStartMenuShortcut: boolean;
  autoStart: boolean;
}

// Элементы DOM для установщика
let installDialog: HTMLElement | null;
let installDirInput: HTMLInputElement | null;
let languageSelect: HTMLSelectElement | null;
let desktopShortcutCheckbox: HTMLInputElement | null;
let startMenuShortcutCheckbox: HTMLInputElement | null;
let autoStartCheckbox: HTMLInputElement | null;
let installButton: HTMLButtonElement | null;
let cancelButton: HTMLButtonElement | null;
let browseButton: HTMLButtonElement | null;

// Инициализация UI установщика
export function initInstallerUI(): void {
  // Проверяем, запущено ли приложение впервые
  ipcRenderer.invoke('is-first-run').then((isFirstRun: boolean) => {
    if (isFirstRun) {
      showInstallDialog();
    }
  });
}

// Показать диалог установки
function showInstallDialog(): void {
  // Создаем элемент диалога, если он не существует
  if (!document.getElementById('install-dialog')) {
    createInstallDialog();
  }
  
  // Получаем текущие настройки установки
  ipcRenderer.invoke('get-install-config').then((config: InstallConfig) => {
    if (installDirInput) installDirInput.value = config.installDir;
    if (languageSelect) languageSelect.value = config.language;
    if (desktopShortcutCheckbox) desktopShortcutCheckbox.checked = config.createDesktopShortcut;
    if (startMenuShortcutCheckbox) startMenuShortcutCheckbox.checked = config.createStartMenuShortcut;
    if (autoStartCheckbox) autoStartCheckbox.checked = config.autoStart;
  });
  
  // Показываем диалог
  if (installDialog) {
    installDialog.style.display = 'flex';
  }
}

// Создать элементы диалога установки
function createInstallDialog(): void {
  // Создаем контейнер диалога
  installDialog = document.createElement('div');
  installDialog.id = 'install-dialog';
  installDialog.className = 'install-dialog';
  
  // Создаем содержимое диалога
  const dialogContent = document.createElement('div');
  dialogContent.className = 'install-dialog-content';
  
  // Заголовок
  const title = document.createElement('h2');
  title.textContent = 'Установка JSR';
  title.className = 'install-title';
  
  // Описание
  const description = document.createElement('p');
  description.textContent = 'Добро пожаловать в мастер установки JSR. Пожалуйста, выберите параметры установки.';
  description.className = 'install-description';
  
  // Форма установки
  const form = document.createElement('div');
  form.className = 'install-form';
  
  // Директория установки
  const dirGroup = document.createElement('div');
  dirGroup.className = 'form-group';
  
  const dirLabel = document.createElement('label');
  dirLabel.textContent = 'Директория установки:';
  dirLabel.htmlFor = 'install-dir';
  
  const dirInputGroup = document.createElement('div');
  dirInputGroup.className = 'input-group';
  
  installDirInput = document.createElement('input');
  installDirInput.type = 'text';
  installDirInput.id = 'install-dir';
  installDirInput.className = 'install-input';
  installDirInput.readOnly = true;
  
  browseButton = document.createElement('button');
  browseButton.textContent = 'Обзор...';
  browseButton.className = 'browse-button';
  browseButton.addEventListener('click', () => {
    ipcRenderer.invoke('select-install-directory').then((dir: string | null) => {
      if (dir && installDirInput) {
        installDirInput.value = dir;
      }
    });
  });
  
  dirInputGroup.appendChild(installDirInput);
  dirInputGroup.appendChild(browseButton);
  
  dirGroup.appendChild(dirLabel);
  dirGroup.appendChild(dirInputGroup);
  
  // Выбор языка
  const langGroup = document.createElement('div');
  langGroup.className = 'form-group';
  
  const langLabel = document.createElement('label');
  langLabel.textContent = 'Язык:';
  langLabel.htmlFor = 'language-select';
  
  languageSelect = document.createElement('select');
  languageSelect.id = 'language-select';
  languageSelect.className = 'install-select';
  
  const languages = [
    { value: 'ru', text: 'Русский' },
    { value: 'en', text: 'English' },
    { value: 'uk', text: 'Українська' },
    { value: 'de', text: 'Deutsch' }
  ];
  
  languages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.value;
    option.textContent = lang.text;
    languageSelect?.appendChild(option);
  });
  
  langGroup.appendChild(langLabel);
  langGroup.appendChild(languageSelect);
  
  // Опции установки
  const optionsGroup = document.createElement('div');
  optionsGroup.className = 'form-group';
  
  const optionsLabel = document.createElement('label');
  optionsLabel.textContent = 'Опции установки:';
  
  // Ярлык на рабочем столе
  const desktopOption = document.createElement('div');
  desktopOption.className = 'option-item';
  
  desktopShortcutCheckbox = document.createElement('input');
  desktopShortcutCheckbox.type = 'checkbox';
  desktopShortcutCheckbox.id = 'desktop-shortcut';
  desktopShortcutCheckbox.checked = true;
  
  const desktopLabel = document.createElement('label');
  desktopLabel.htmlFor = 'desktop-shortcut';
  desktopLabel.textContent = 'Создать ярлык на рабочем столе';
  
  desktopOption.appendChild(desktopShortcutCheckbox);
  desktopOption.appendChild(desktopLabel);
  
  // Ярлык в меню Пуск
  const startMenuOption = document.createElement('div');
  startMenuOption.className = 'option-item';
  
  startMenuShortcutCheckbox = document.createElement('input');
  startMenuShortcutCheckbox.type = 'checkbox';
  startMenuShortcutCheckbox.id = 'start-menu-shortcut';
  startMenuShortcutCheckbox.checked = true;
  
  const startMenuLabel = document.createElement('label');
  startMenuLabel.htmlFor = 'start-menu-shortcut';
  startMenuLabel.textContent = 'Создать ярлык в меню Пуск';
  
  startMenuOption.appendChild(startMenuShortcutCheckbox);
  startMenuOption.appendChild(startMenuLabel);
  
  // Автозапуск
  const autoStartOption = document.createElement('div');
  autoStartOption.className = 'option-item';
  
  autoStartCheckbox = document.createElement('input');
  autoStartCheckbox.type = 'checkbox';
  autoStartCheckbox.id = 'auto-start';
  autoStartCheckbox.checked = false;
  
  const autoStartLabel = document.createElement('label');
  autoStartLabel.htmlFor = 'auto-start';
  autoStartLabel.textContent = 'Запускать при старте системы';
  
  autoStartOption.appendChild(autoStartCheckbox);
  autoStartOption.appendChild(autoStartLabel);
  
  optionsGroup.appendChild(optionsLabel);
  optionsGroup.appendChild(desktopOption);
  optionsGroup.appendChild(startMenuOption);
  optionsGroup.appendChild(autoStartOption);
  
  // Кнопки
  const buttonsGroup = document.createElement('div');
  buttonsGroup.className = 'buttons-group';
  
  installButton = document.createElement('button');
  installButton.textContent = 'Установить';
  installButton.className = 'install-button';
  installButton.addEventListener('click', () => {
    if (installDirInput && languageSelect && desktopShortcutCheckbox && 
        startMenuShortcutCheckbox && autoStartCheckbox) {
      const config: InstallConfig = {
        installDir: installDirInput.value,
        language: languageSelect?.value,
        createDesktopShortcut: desktopShortcutCheckbox.checked,
        createStartMenuShortcut: startMenuShortcutCheckbox.checked,
        autoStart: autoStartCheckbox.checked
      };
      
      ipcRenderer.invoke('save-install-config', config).then(() => {
        if (installDialog) {
          installDialog.style.display = 'none';
        }
      });
    }
  });
  
  cancelButton = document.createElement('button');
  cancelButton.textContent = 'Отмена';
  cancelButton.className = 'cancel-button';
  cancelButton.addEventListener('click', () => {
    if (installDialog) {
      installDialog.style.display = 'none';
    }
  });
  
  buttonsGroup.appendChild(installButton);
  buttonsGroup.appendChild(cancelButton);
  
  // Собираем форму
  form.appendChild(dirGroup);
  form.appendChild(langGroup);
  form.appendChild(optionsGroup);
  form.appendChild(buttonsGroup);
  
  // Собираем диалог
  dialogContent.appendChild(title);
  dialogContent.appendChild(description);
  dialogContent.appendChild(form);
  
  installDialog.appendChild(dialogContent);
  
  // Добавляем диалог в документ
  document.body.appendChild(installDialog);
  
  // Добавляем стили для диалога
  addInstallerStyles();
}

// Добавить стили для установщика
function addInstallerStyles(): void {
  const style = document.createElement('style');
  style.textContent = `
    .install-dialog {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .install-dialog-content {
      background-color: var(--card-background);
      border-radius: 8px;
      box-shadow: 0 4px 20px var(--shadow-color);
      padding: 30px;
      width: 600px;
      max-width: 90%;
    }
    
    .install-title {
      color: var(--primary-color);
      margin-bottom: 15px;
      font-size: 24px;
    }
    
    .install-description {
      margin-bottom: 25px;
      color: var(--text-color);
    }
    
    .install-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .input-group {
      display: flex;
      gap: 10px;
    }
    
    .install-input {
      flex: 1;
      padding: 10px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background-color: var(--card-background);
      color: var(--text-color);
    }
    
    .install-select {
      padding: 10px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background-color: var(--card-background);
      color: var(--text-color);
    }
    
    .browse-button {
      padding: 10px 15px;
      background-color: var(--secondary-color);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .option-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 5px;
    }
    
    .buttons-group {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      margin-top: 10px;
    }
    
    .install-button {
      padding: 10px 20px;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .cancel-button {
      padding: 10px 20px;
      background-color: var(--danger-color);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `;
  
  document.head.appendChild(style);
}