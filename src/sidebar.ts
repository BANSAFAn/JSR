// Модуль для работы с боковым баром
import { ipcRenderer } from 'electron';
import i18next from 'i18next';

// Типы для информации о Java
interface JavaInstallation {
  version: string;
  path: string;
  vendor: string;
  architecture: string;
  isDefault: boolean;
}

// Типы для информации о программе
interface AuthorInfo {
  name: string;
  github?: string;
  website?: string;
}

// Класс для управления боковым баром
export class Sidebar {
  private sidebarElement: HTMLElement;
  private tabButtons: NodeListOf<HTMLButtonElement>;
  private tabContents: NodeListOf<HTMLElement>;
  private javaInstallations: JavaInstallation[] = [];
  private searchInput: HTMLInputElement;
  private authorInfo: AuthorInfo = {
    name: 'BANSAFan',
    github: 'https://github.com/BANSAFan',
    website: 'https://baneronetwo/vercel.app'
  };
  
  constructor() {
    this.sidebarElement = document.getElementById('sidebar') as HTMLElement;
    this.tabButtons = document.querySelectorAll('.sidebar-tab-btn') as NodeListOf<HTMLButtonElement>;
    this.tabContents = document.querySelectorAll('.sidebar-tab-content') as NodeListOf<HTMLElement>;
    this.searchInput = document.getElementById('java-search') as HTMLInputElement;
    
    this.init();
  }
  
  private init(): void {
    // Инициализация обработчиков событий для вкладок
    this.tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.openTab(button.dataset.tab as string);
      });
    });
    
    // Инициализация поиска Java
    this.searchInput.addEventListener('input', () => {
      this.filterJavaInstallations();
    });
    
    // Получение информации о Java на компьютере
    this.loadJavaInstallations();
    
    // Обновление информации об авторе
    this.updateAuthorInfo();
    
    // Открытие первой вкладки по умолчанию
    this.openTab('about');
    
    // Анимация открытия бокового бара
    setTimeout(() => {
      this.sidebarElement.classList.add('open');
    }, 300);
    
    // Добавляем обработчик для кнопки закрытия бокового бара
    const closeButton = document.createElement('button');
    closeButton.className = 'sidebar-close-btn';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => this.toggleSidebar());
    this.sidebarElement.querySelector('.sidebar-header')?.appendChild(closeButton);
  }
  
  private openTab(tabName: string): void {
    // Скрытие всех вкладок с анимацией
    this.tabContents.forEach(content => {
      if (content.classList.contains('active')) {
        content.classList.add('fade-out');
        setTimeout(() => {
          content.classList.remove('active', 'fade-out');
        }, 200);
      } else {
        content.classList.remove('active');
      }
    });
    
    // Сброс активного состояния всех кнопок
    this.tabButtons.forEach(button => {
      button.classList.remove('active');
    });
    
    // Активация выбранной вкладки с задержкой для анимации
    setTimeout(() => {
      const selectedTab = document.getElementById(`${tabName}-tab`) as HTMLElement;
      const selectedButton = document.querySelector(`[data-tab="${tabName}"]`) as HTMLButtonElement;
      
      if (selectedTab && selectedButton) {
        selectedTab.classList.add('active', 'fade-in');
        selectedButton.classList.add('active');
        
        // Удаляем класс анимации после завершения
        setTimeout(() => {
          selectedTab.classList.remove('fade-in');
        }, 300);
      }
    }, 250);
  }
  
  private async loadJavaInstallations(): Promise<void> {
    try {
      // Запрос к основному процессу для получения информации о Java
      this.javaInstallations = await ipcRenderer.invoke('get-java-installations');
      this.renderJavaInstallations();
    } catch (error) {
      console.error('Ошибка при получении информации о Java:', error);
      this.renderJavaError();
    }
  }
  
  private renderJavaInstallations(): void {
    const javaListElement = document.getElementById('java-list') as HTMLElement;
    
    // Добавляем анимацию загрузки
    javaListElement.innerHTML = `<div class="loading-java fade-in"><div class="spinner small"></div><p>${i18next.t('loadingJava')}</p></div>`;
    
    setTimeout(() => {
      if (this.javaInstallations.length === 0) {
        javaListElement.innerHTML = `<div class="no-java-message fade-in">${i18next.t('noJavaFound')}</div>`;
        return;
      }
      
      javaListElement.innerHTML = '';
      
      // Создаем и добавляем элементы с анимацией
      this.javaInstallations.forEach((java, index) => {
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
    }, 500);
  }
  
  private renderJavaError(): void {
    const javaListElement = document.getElementById('java-list') as HTMLElement;
    javaListElement.innerHTML = `<div class="error-message">${i18next.t('javaLoadError')}</div>`;
  }
  
  private filterJavaInstallations(): void {
    const searchTerm = this.searchInput.value.toLowerCase();
    const javaItems = document.querySelectorAll('.java-item') as NodeListOf<HTMLElement>;
    
    javaItems.forEach(item => {
      const version = item.dataset.version?.toLowerCase() || '';
      const vendor = item.dataset.vendor?.toLowerCase() || '';
      
      if (version.includes(searchTerm) || vendor.includes(searchTerm)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }
  
  // Обновление информации об авторе
  private updateAuthorInfo(): void {
    const aboutTab = document.getElementById('about-tab');
    if (!aboutTab) return;
    
    const authorInfoElement = aboutTab.querySelector('.author-info');
    if (authorInfoElement) {
      const authorLinks = document.createElement('div');
      authorLinks.className = 'author-links';
      
      if (this.authorInfo.github) {
        const githubLink = document.createElement('a');
        githubLink.href = this.authorInfo.github;
        githubLink.target = '_blank';
        githubLink.className = 'author-link github';
        githubLink.innerHTML = '<span class="icon">GitHub</span>';
        githubLink.title = 'GitHub';
        authorLinks.appendChild(githubLink);
      }
      
      if (this.authorInfo.website) {
        const websiteLink = document.createElement('a');
        websiteLink.href = this.authorInfo.website;
        websiteLink.target = '_blank';
        websiteLink.className = 'author-link website';
        websiteLink.innerHTML = '<span class="icon">Website</span>';
        websiteLink.title = i18next.t('website');
        authorLinks.appendChild(websiteLink);
      }
      
      authorInfoElement.appendChild(authorLinks);
    }
  }
  
  // Переключение видимости бокового бара
  private toggleSidebar(): void {
    if (this.sidebarElement.classList.contains('open')) {
      this.sidebarElement.classList.remove('open');
      this.sidebarElement.classList.add('closed');
    } else {
      this.sidebarElement.classList.remove('closed');
      this.sidebarElement.classList.add('open');
    }
  }
}

// Инициализация бокового бара при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  new Sidebar();
});