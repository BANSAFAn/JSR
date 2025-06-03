import React from 'react';
import { useTranslation } from 'react-i18next';

interface LoadingProps {
  isLoading: boolean;
}

const Loading: React.FC<LoadingProps> = ({ isLoading }) => {
  const { t } = useTranslation();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="loading-overlay active">
      <div className="spinner"></div>
      <p>{t('loading')}</p>
    </div>
  );
};

export default Loading;