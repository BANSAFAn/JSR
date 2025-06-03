use serde::{Deserialize, Serialize};
use sysinfo::{System, SystemExt, CpuExt, DiskExt, ComponentExt};
use std::collections::HashMap;

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
    
    // Graphics information (simplified)
    let graphics = GraphicsInfo {
        devices: vec!["Graphics information not available".to_string()],
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
