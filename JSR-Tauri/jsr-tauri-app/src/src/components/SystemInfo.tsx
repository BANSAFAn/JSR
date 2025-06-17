import React, { memo, useMemo } from 'react';
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

const SystemInfo: React.FC<SystemInfoProps> = memo(({ systemInfo, isLoading }) => {
  const { t } = useTranslation();

  // Format memory size in GB - memoized to prevent recalculation on each render
  const formatMemory = useMemo(() => {
    return (bytes: number) => {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    };
  }, []);

  // Memoize the CPU info to prevent unnecessary re-renders
  const cpuInfo = useMemo(() => {
    if (isLoading) return '-';
    if (!systemInfo) return 'Error loading CPU info';
    return `${systemInfo.cpu.brand} (${systemInfo.cpu.cores} ${t('cores')})`;
  }, [isLoading, systemInfo, t]);

  // Memoize the memory info
  const memoryInfo = useMemo(() => {
    if (isLoading) return '-';
    if (!systemInfo) return 'Error loading memory info';
    return `${formatMemory(systemInfo.mem.total)} total, ${formatMemory(systemInfo.mem.used)} used`;
  }, [isLoading, systemInfo, formatMemory]);

  // Memoize the OS info
  const osInfo = useMemo(() => {
    if (isLoading) return '-';
    if (!systemInfo) return 'Error loading OS info';
    return `${systemInfo.os.name} ${systemInfo.os.version} (${systemInfo.os.arch})`;
  }, [isLoading, systemInfo]);

  // Memoize the GPU info
  const gpuInfo = useMemo(() => {
    if (isLoading) return '-';
    if (!systemInfo) return 'Error loading GPU info';
    return systemInfo.graphics.devices.join(', ') || 'Not available';
  }, [isLoading, systemInfo]);

  return (
    <section className="system-info-section">
      <h2>{t('systemInfo')}</h2>
      <div className="system-info-container">
        <div className="info-card">
          <h3>{t('cpu')}</h3>
          <p id="cpu-info">{cpuInfo}</p>
        </div>
        <div className="info-card">
          <h3>{t('memory')}</h3>
          <p id="memory-info">{memoryInfo}</p>
        </div>
        <div className="info-card">
          <h3>{t('os')}</h3>
          <p id="os-info">{osInfo}</p>
        </div>
        <div className="info-card">
          <h3>{t('gpu')}</h3>
          <p id="gpu-info">{gpuInfo}</p>
        </div>
      </div>
    </section>
  );
});

export default SystemInfo;