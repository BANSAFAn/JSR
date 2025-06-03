import React from 'react';
import { useTranslation } from 'react-i18next';

interface JavaRecommendationProps {
  selectedVersion: string;
  customVersion?: string;
  isVisible: boolean;
}

interface JavaVersionInfo {
  version: string;
  minVersion: string;
  maxVersion?: string;
}

interface JavaVersionMap {
  [key: string]: {
    [key: string]: JavaVersionInfo;
  };
}

const JavaRecommendation: React.FC<JavaRecommendationProps> = ({ 
  selectedVersion, 
  customVersion, 
  isVisible 
}) => {
  const { t } = useTranslation();

  // Java version mapping data
  const javaVersionMap: JavaVersionMap = {
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
  const javaDownloadSources = [
    {
      name: 'Oracle',
      url: 'https://www.oracle.com/java/technologies/downloads/',
      guide: [
        t('visitDownloadPage'),
        t('selectOperatingSystem'),
        t('downloadJDK'),
        t('runInstaller')
      ]
    },
    {
      name: 'Eclipse Adoptium',
      url: 'https://adoptium.net/',
      guide: [
        t('visitDownloadPage'),
        t('selectJavaVersion'),
        t('selectOperatingSystem'),
        t('downloadAndRun')
      ]
    },
    {
      name: 'Amazon Corretto',
      url: 'https://aws.amazon.com/corretto/',
      guide: [
        t('visitDownloadPage'),
        t('selectJavaVersion'),
        t('downloadPackage'),
        t('followInstructions')
      ]
    }
  ];

  // Determine recommended Java version based on selected Minecraft version
  const getRecommendedJava = () => {
    if (selectedVersion === 'latest') {
      return {
        version: 'Java 17',
        reason: t('javaReasonLatestRelease')
      };
    } else if (selectedVersion === 'snapshot') {
      return {
        version: 'Java 17',
        reason: t('javaReasonLatestSnapshot')
      };
    } else if (selectedVersion === 'beta') {
      return {
        version: 'Java 6-7',
        reason: t('javaReasonBeta')
      };
    } else if (selectedVersion === 'alpha') {
      return {
        version: 'Java 5-6',
        reason: t('javaReasonAlpha')
      };
    } else if (selectedVersion === 'custom' && customVersion) {
      // Parse custom version to determine Java version
      if (customVersion.startsWith('1.17') || parseInt(customVersion.split('.')[0]) > 1) {
        return {
          version: 'Java 17',
          reason: t('javaReasonModern')
        };
      } else if (customVersion.startsWith('1.13') || customVersion.startsWith('1.14') || 
                 customVersion.startsWith('1.15') || customVersion.startsWith('1.16')) {
        return {
          version: 'Java 8-11',
          reason: t('javaReasonMiddle')
        };
      } else if (customVersion.startsWith('1.7.10') || customVersion.startsWith('1.8') || 
                 customVersion.startsWith('1.9') || customVersion.startsWith('1.10') || 
                 customVersion.startsWith('1.11') || customVersion.startsWith('1.12')) {
        return {
          version: 'Java 8',
          reason: t('javaReasonLegacy')
        };
      } else if (customVersion.startsWith('1.0') || customVersion.startsWith('1.1') || 
                 customVersion.startsWith('1.2') || customVersion.startsWith('1.3') || 
                 customVersion.startsWith('1.4') || customVersion.startsWith('1.5') || 
                 customVersion.startsWith('1.6')) {
        return {
          version: 'Java 6-7',
          reason: t('javaReasonVeryOld')
        };
      }
    }
    
    // Default fallback
    return {
      version: 'Java 17',
      reason: t('javaReasonDefault')
    };
  };

  const recommendedJava = getRecommendedJava();

  if (!isVisible) {
    return null;
  }

  return (
    <section className="results-section active">
      <h2>{t('recommendedJava')}</h2>
      <div className="result-card">
        <div className="java-version-result">{recommendedJava.version}</div>
        <div className="java-reason">{recommendedJava.reason}</div>
        
        <div className="download-options">
          <h3>{t('downloadOptions')}</h3>
          
          {javaDownloadSources.map((source, index) => (
            <div key={index} className="download-option">
              <h4>{source.name}</h4>
              <a href={source.url} className="download-link" target="_blank">
                {t('visitDownloadPage')}
              </a>
              
              <div className="installation-guide">
                <h5>{t('installationGuide')}</h5>
                <ol className="installation-steps">
                  {source.guide.map((step, stepIndex) => (
                    <li key={stepIndex}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JavaRecommendation;