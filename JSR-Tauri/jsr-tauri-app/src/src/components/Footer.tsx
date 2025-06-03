import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      {t('footerText').replace('{{year}}', currentYear.toString())}
    </footer>
  );
};

export default Footer;