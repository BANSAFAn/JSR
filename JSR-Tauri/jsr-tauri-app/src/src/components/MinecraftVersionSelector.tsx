import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MinecraftVersionSelectorProps {
  onVersionSelect: (version: string, customVersion?: string) => void;
}

const MinecraftVersionSelector: React.FC<MinecraftVersionSelectorProps> = ({ onVersionSelect }) => {
  const { t } = useTranslation();
  const [selectedVersion, setSelectedVersion] = useState('latest');
  const [customVersion, setCustomVersion] = useState('');

  const handleVersionSelect = (version: string) => {
    setSelectedVersion(version);
  };

  const handleAnalyze = () => {
    if (selectedVersion === 'custom' && customVersion) {
      onVersionSelect(selectedVersion, customVersion);
    } else {
      onVersionSelect(selectedVersion);
    }
  };

  return (
    <section className="minecraft-version-section">
      <h2>{t('minecraftVersion')}</h2>
      <div className="version-selector">
        <div 
          className={`version-option ${selectedVersion === 'latest' ? 'selected' : ''}`}
          onClick={() => handleVersionSelect('latest')}
        >
          {t('latestRelease')}
        </div>
        <div 
          className={`version-option ${selectedVersion === 'snapshot' ? 'selected' : ''}`}
          onClick={() => handleVersionSelect('snapshot')}
        >
          {t('latestSnapshot')}
        </div>
        <div 
          className={`version-option ${selectedVersion === 'beta' ? 'selected' : ''}`}
          onClick={() => handleVersionSelect('beta')}
        >
          {t('betaVersions')}
        </div>
        <div 
          className={`version-option ${selectedVersion === 'alpha' ? 'selected' : ''}`}
          onClick={() => handleVersionSelect('alpha')}
        >
          {t('alphaVersions')}
        </div>
        <div 
          className={`version-option ${selectedVersion === 'custom' ? 'selected' : ''}`}
          onClick={() => handleVersionSelect('custom')}
        >
          {t('customVersion')}
        </div>
      </div>
      
      <div className={`custom-version-input ${selectedVersion === 'custom' ? 'active' : ''}`}>
        <input 
          type="text" 
          placeholder={t('enterCustomVersion')}
          value={customVersion}
          onChange={(e) => setCustomVersion(e.target.value)}
        />
      </div>
      
      <button className="analyze-button" onClick={handleAnalyze}>
        {t('analyzeButton')}
      </button>
    </section>
  );
};

export default MinecraftVersionSelector;