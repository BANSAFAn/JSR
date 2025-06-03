// System information types
export interface SystemInfo {
  cpu: CpuInfo;
  mem: MemInfo;
  os: OsInfo;
  graphics: GraphicsInfo;
}

export interface CpuInfo {
  brand: string;
  cores: number;
  frequency: number;
}

export interface MemInfo {
  total: number;
  free: number;
  used: number;
}

export interface OsInfo {
  name: string;
  version: string;
  arch: string;
}

export interface GraphicsInfo {
  devices: string[];
}

// Settings types
export interface Settings {
  theme: string;
  language: string;
}

// Java installation types
export interface JavaInstallation {
  version: string;
  vendor: string;
  path: string;
  arch: string;
  isDefault: boolean;
}

// Java recommendation types
export interface JavaRecommendation {
  version: string;
  reason: string;
}

export interface JavaVersionInfo {
  version: string;
  minVersion: string;
  maxVersion?: string;
}