use serde::{Deserialize, Serialize};
use sysinfo::{System, SystemExt, CpuExt, DiskExt, ComponentExt};
use std::collections::HashMap;
use std::process::Command;

// Function to get GPU information
fn get_gpu_info() -> Vec<String> {
    #[cfg(target_os = "windows")]
    {
        // Try to get GPU info using WMI on Windows
        let output = Command::new("powershell")
            .args(["-Command", "Get-WmiObject Win32_VideoController | Select-Object -ExpandProperty Name"])
            .output();
        
        if let Ok(output) = output {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                return stdout
                    .lines()
                    .filter(|line| !line.trim().is_empty())
                    .map(|line| line.trim().to_string())
                    .collect();
            }
        }
    }
    
    #[cfg(target_os = "linux")]
    {
        // Try to get GPU info using lspci on Linux
        let output = Command::new("sh")
            .args(["-c", "lspci | grep -i 'vga\|3d\|2d'"])
            .output();
        
        if let Ok(output) = output {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                return stdout
                    .lines()
                    .filter(|line| !line.trim().is_empty())
                    .map(|line| {
                        if let Some(idx) = line.find(':') {
                            line[idx+1..].trim().to_string()
                        } else {
                            line.trim().to_string()
                        }
                    })
                    .collect();
            }
        }
    }
    
    #[cfg(target_os = "macos")]
    {
        // Try to get GPU info using system_profiler on macOS
        let output = Command::new("sh")
            .args(["-c", "system_profiler SPDisplaysDataType | grep 'Chipset Model:' | cut -d ':' -f 2"])
            .output();
        
        if let Ok(output) = output {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                return stdout
                    .lines()
                    .filter(|line| !line.trim().is_empty())
                    .map(|line| line.trim().to_string())
                    .collect();
            }
        }
    }
    
    // Fallback if we couldn't get GPU info
    vec!["Graphics information not available".to_string()]
}

// System information structure
#[derive(Serialize, Deserialize)]
struct SystemInfo {
    cpu: CpuInfo,
    mem: MemInfo,
    os: OsInfo,
    graphics: GraphicsInfo,
}

#[derive(Serialize, Deserialize)]
struct CpuInfo {
    brand: String,
    cores: u32,
    frequency: u64,
}

#[derive(Serialize, Deserialize)]
struct MemInfo {
    total: u64,
    free: u64,
    used: u64,
}

#[derive(Serialize, Deserialize)]
struct OsInfo {
    name: String,
    version: String,
    arch: String,
}

#[derive(Serialize, Deserialize)]
struct GraphicsInfo {
    devices: Vec<String>,
}

// Settings structure
#[derive(Serialize, Deserialize)]
struct Settings {
    theme: String,
    language: String,
}

// Get system information
#[tauri::command]
fn get_system_info() -> SystemInfo {
    let mut sys = System::new_all();
    sys.refresh_all();
    
    // CPU information
    let cpu = if let Some(cpu) = sys.cpus().first() {
        CpuInfo {
            brand: cpu.brand().to_string(),
            cores: sys.cpus().len() as u32,
            frequency: cpu.frequency(),
        }
    } else {
        CpuInfo {
            brand: "Unknown".to_string(),
            cores: 0,
            frequency: 0,
        }
    };
    
    // Memory information
    let mem = MemInfo {
        total: sys.total_memory(),
        free: sys.free_memory(),
        used: sys.used_memory(),
    };
    
    // OS information
    let os = OsInfo {
        name: sys.name().unwrap_or_else(|| "Unknown".to_string()),
        version: sys.os_version().unwrap_or_else(|| "Unknown".to_string()),
        arch: std::env::consts::ARCH.to_string(),
    };
    
    // Graphics information - try to get actual GPU info
    let graphics = GraphicsInfo {
        devices: get_gpu_info(),
    };
    
    SystemInfo {
        cpu,
        mem,
        os,
        graphics,
    }
}

// Get settings
#[tauri::command]
fn get_settings(app_handle: tauri::AppHandle) -> Settings {
    let store = store::StoreBuilder::new(app_handle, "settings.dat").build();
    let theme = store.get("theme").unwrap_or("light".to_string());
    let language = store.get("language").unwrap_or("en".to_string());
    
    Settings {
        theme,
        language,
    }
}

// Save settings
#[tauri::command]
fn save_settings(app_handle: tauri::AppHandle, settings: Settings) -> Result<(), String> {
    let store = store::StoreBuilder::new(app_handle, "settings.dat").build();
    store.insert("theme".to_string(), settings.theme.clone())
        .map_err(|e| e.to_string())?;
    store.insert("language".to_string(), settings.language.clone())
        .map_err(|e| e.to_string())?;
    store.save().map_err(|e| e.to_string())
}

// Original greet function for testing
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_system_info,
            get_settings,
            save_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
