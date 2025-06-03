import React from 'react';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onThemeToggle: () => void;
  theme: string;
}

const Header: React.FC<HeaderProps> = ({ onThemeToggle, theme }) => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="title-bar">
      <div className="app-title">{t('appTitle')} by BANSAFAn</div>
      
      <div className="theme-toggle">
        <button onClick={onThemeToggle}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
      
      <div className="language-selector">
        <select onChange={changeLanguage} value={i18n.language}>
          <option value="en">English</option>
          <option value="ru">Русский</option>
        </select>
      </div>
    </header>
  );
};

export default Header;