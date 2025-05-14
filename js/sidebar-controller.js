// Контроллер боковой панели
document.addEventListener('DOMContentLoaded', () => {
  // Элементы DOM
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const mainContent = document.querySelector('.main-content');
  const searchJavaBtn = document.getElementById('search-java-btn');
  const searchJavaContent = document.getElementById('search-java-content');
  const infoBtn = document.getElementById('info-btn');
  const infoContent = document.getElementById('info-content');
  const javaList = document.getElementById('java-list');

  // Инициализация боковой панели
  function initSidebar() {
    // Открыть боковую панель при загрузке страницы
    setTimeout(() => {
      sidebar.classList.add('open');
    }, 300);

    // Обработчик для кнопки переключения боковой панели
    sidebarToggle.addEventListener('click', toggleSidebar);

    // Обработчики для кнопок в боковой панели
    infoBtn.addEventListener('click', () => {
      activateTab('info');
    });

    searchJavaBtn.addEventListener('click', () => {
      activateTab('search-java');
    });
  }

  // Переключение боковой панели
  function toggleSidebar() {
    sidebar.classList.toggle('open');
    mainContent.classList.toggle('blur');
  }

  // Активация вкладки
  function activateTab(tabName) {
    // Сброс активного состояния всех кнопок и скрытие всех вкладок
    [infoBtn, searchJavaBtn].forEach(btn => btn.classList.remove('active'));
    [infoContent, searchJavaContent].forEach(content => content.classList.remove('active'));

    // Активация выбранной вкладки
    if (tabName === 'info') {
      infoBtn.classList.add('active');
      infoContent.classList.add('active');
    } else if (tabName === 'search-java') {
      searchJavaBtn.classList.add('active');
      searchJavaContent.classList.add('active');
      
      // Добавляем кнопку анализа, если её ещё нет
      if (!document.getElementById('analyze-java-btn')) {
        const analyzeBtn = document.createElement('button');
        analyzeBtn.id = 'analyze-java-btn';
        analyzeBtn.className = 'primary-btn';
        analyzeBtn.textContent = 'Начать анализ';
        analyzeBtn.addEventListener('click', analyzeJava);
        
        // Добавляем кнопку перед списком Java
        javaList.parentNode.insertBefore(analyzeBtn, javaList);
      }
    }
  }

  // Анализ Java на компьютере
  function analyzeJava() {
    // Показываем индикатор загрузки
    const loadingElement = document.querySelector('.loading-java');
    loadingElement.style.display = 'flex';
    
    // Очищаем предыдущие результаты
    const results = javaList.querySelectorAll(':not(.loading-java)');
    results.forEach(result => result.remove());
    
    // Имитация запроса к системе для поиска Java
    // В реальном приложении здесь будет вызов API для поиска Java
    setTimeout(() => {
      // Скрываем индикатор загрузки
      loadingElement.style.display = 'none';
      
      // Добавляем найденные версии Java (пример)
      const javaVersions = [
        { version: 'Java 17.0.2', vendor: 'Oracle', path: 'C:\\Program Files\\Java\\jdk-17.0.2', isDefault: true },
        { version: 'Java 11.0.12', vendor: 'AdoptOpenJDK', path: 'C:\\Program Files\\AdoptOpenJDK\\jdk-11.0.12.7', isDefault: false },
        { version: 'Java 8.0.302', vendor: 'Eclipse Temurin', path: 'C:\\Program Files\\Eclipse Adoptium\\jdk-8.0.302.8', isDefault: false }
      ];
      
      if (javaVersions.length > 0) {
        javaVersions.forEach(java => {
          const javaItem = document.createElement('div');
          javaItem.className = 'java-item';
          
          const javaHeader = document.createElement('div');
          javaHeader.className = 'java-item-header';
          
          const javaVersion = document.createElement('div');
          javaVersion.className = 'java-version';
          javaVersion.textContent = java.version;
          
          javaHeader.appendChild(javaVersion);
          
          if (java.isDefault) {
            const defaultBadge = document.createElement('div');
            defaultBadge.className = 'java-default-badge';
            defaultBadge.textContent = 'По умолчанию';
            javaHeader.appendChild(defaultBadge);
          }
          
          const javaDetails = document.createElement('div');
          javaDetails.className = 'java-item-details';
          
          const vendorDetail = document.createElement('div');
          vendorDetail.className = 'java-detail';
          vendorDetail.innerHTML = `<span class="detail-label">Производитель:</span> ${java.vendor}`;
          
          const pathDetail = document.createElement('div');
          pathDetail.className = 'java-detail';
          pathDetail.innerHTML = `<span class="detail-label">Путь:</span> <span class="java-path">${java.path}</span>`;
          
          javaDetails.appendChild(vendorDetail);
          javaDetails.appendChild(pathDetail);
          
          javaItem.appendChild(javaHeader);
          javaItem.appendChild(javaDetails);
          
          javaList.appendChild(javaItem);
        });
      } else {
        // Если Java не найдена
        const noJavaMessage = document.createElement('div');
        noJavaMessage.className = 'no-java-message';
        noJavaMessage.textContent = 'Java не найдена на вашем компьютере.';
        javaList.appendChild(noJavaMessage);
      }
    }, 2000); // Имитация задержки запроса
  }

  // Инициализация
  initSidebar();
});