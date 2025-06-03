import React from 'react';
import { useTranslation } from 'react-i18next';

interface SystemInfoProps {
  systemInfo: {
    cpu: {
      brand: string;
      cores: number;
      frequency: number;
    };
    mem: {
      total: number;
      free: number;
      used: number;
    };
    os: {
      name: string;
      version: string;
      arch: string;
    };
    graphics: {
      devices: string[];
    };
  } | null;
  isLoading: boolean;
}

const SystemInfo: React.FC<SystemInfoProps> = ({ systemInfo, isLoading }) => {
  const { t } = useTranslation();

  // Format memory size in GB
  const formatMemory = (bytes: number) => {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  return (
    <section className="system-info-section">
      <h2>{t('systemInfo')}</h2>
      <div className="system-info-container">
        <div className="info-card">
          <h3>{t('cpu')}</h3>
          <p id="cpu-info">
            {isLoading ? '-' : systemInfo ? (
              <>
                {systemInfo.cpu.brand} ({systemInfo.cpu.cores} {t('cores')})
              </>
            ) : 'Error loading CPU info'}
          </p>
        </div>
        <div className="info-card">
          <h3>{t('memory')}</h3>
          <p id="memory-info">
            {isLoading ? '-' : systemInfo ? (
              <>
                {formatMemory(systemInfo.mem.total)} total, {formatMemory(systemInfo.mem.used)} used
              </>
            ) : 'Error loading memory info'}
          </p>
        </div>
        <div className="info-card">
          <h3>{t('os')}</h3>
          <p id="os-info">
            {isLoading ? '-' : systemInfo ? (
              <>
                {systemInfo.os.name} {systemInfo.os.version} ({systemInfo.os.arch})
              </>
            ) : 'Error loading OS info'}
          </p>
        </div>
        <div className="info-card">
          <h3>{t('gpu')}</h3>
          <p id="gpu-info">
            {isLoading ? '-' : systemInfo ? (
              <>
                {systemInfo.graphics.devices.join(', ') || 'Not available'}
              </>
            ) : 'Error loading GPU info'}
          </p>
        </div>
      </div>
    </section>
  );
};

export default SystemInfo;