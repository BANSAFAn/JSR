import React from 'react';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  javaInstallations: any[];
  isLoadingJava: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  onSectionChange,
  javaInstallations,
  isLoadingJava
}) => {
  const { t } = useTranslation();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">JSR</h2>
      </div>
      <div className="sidebar-content">
        <div className="sidebar-buttons">
          <button 
            className={`sidebar-main-btn ${activeSection === 'info' ? 'active' : ''}`}
            onClick={() => onSectionChange('info')}
          >
            <span className="btn-icon">ℹ️</span>
            <span className="btn-text">{t('aboutTab')}</span>
          </button>
          <button 
            className={`sidebar-main-btn ${activeSection === 'search-java' ? 'active' : ''}`}
            onClick={() => onSectionChange('search-java')}
          >
            <span className="btn-icon">🔍</span>
            <span className="btn-text">{t('javaTab')}</span>
          </button>
        </div>
        
        {/* Info Section */}
        <div id="info-content" className={`sidebar-section ${activeSection === 'info' ? 'active' : ''}`}>
          <div className="about-info">
            <h3>{t('aboutProgram')}</h3>
            <p>{t('programDescription')}</p>
            <div className="author-info">
              <h4>{t('author')}</h4>
              <p>BANSAFAn</p>
              <div className="author-links">
                <a href="https://github.com/BANSAFAn" className="author-link" target="_blank">
                  <span className="btn-icon">🌐</span> GitHub
                </a>
                <a href="https://www.youtube.com/channel/BANSAFAn" className="author-link" target="_blank">
                  <span className="btn-icon">📺</span> YouTube
                </a>
              </div>
            </div>
            <div className="version-info">
              <h4>{t('version')}</h4>
              <p>1.0.0</p>
            </div>
          </div>
        </div>
        
        {/* Java Search Section */}
        <div id="search-java-content" className={`sidebar-section ${activeSection === 'search-java' ? 'active' : ''}`}>
          <div className="java-search-container">
            <input type="text" id="java-search" placeholder={t('searchJava')} />
          </div>
          <div id="java-list" className="java-list">
            {isLoadingJava ? (
              <div className="loading-java">
                <div className="spinner small"></div>
                <p>{t('loadingJava')}</p>
              </div>
            ) : javaInstallations.length > 0 ? (
              javaInstallations.map((java, index) => (
                <div key={index} className="java-item">
                  <h4>
                    Java {java.version}
                    {java.isDefault && <span className="default-badge">{t('default')}</span>}
                  </h4>
                  <dl className="java-details">
                    <dt>{t('vendor')}:</dt>
                    <dd>{java.vendor}</dd>
                    <dt>{t('architecture')}:</dt>
                    <dd>{java.arch}</dd>
                    <dt>{t('path')}:</dt>
                    <dd>{java.path}</dd>
                  </dl>
                </div>
              ))
            ) : (
              <p>{t('noJavaFound')}</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;