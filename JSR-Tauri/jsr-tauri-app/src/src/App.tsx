import { useState, useEffect, useCallback, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import SystemInfo from "./components/SystemInfo";
import MinecraftVersionSelector from "./components/MinecraftVersionSelector";
import JavaRecommendation from "./components/JavaRecommendation";
import Footer from "./components/Footer";
import Loading from "./components/Loading";
import { SystemInfo as SystemInfoType, Settings } from "./types";

function App() {
  const { i18n } = useTranslation();
  const [theme, setTheme] = useState<string>("light");
  const [activeSection, setActiveSection] = useState<string>("info");
  const [systemInfo, setSystemInfo] = useState<SystemInfoType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [javaInstallations, setJavaInstallations] = useState<any[]>([]);
  const [isLoadingJava, setIsLoadingJava] = useState<boolean>(false);
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [customVersion, setCustomVersion] = useState<string>("");
  const [showJavaRecommendation, setShowJavaRecommendation] = useState<boolean>(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await invoke<Settings>("get_settings");
        setTheme(settings.theme);
        i18n.changeLanguage(settings.language);
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, []);

  // Load system info on mount
  useEffect(() => {
    const getSystemInfo = async () => {
      setIsLoading(true);
      try {
        const info = await invoke<SystemInfoType>("get_system_info");
        setSystemInfo(info);
      } catch (error) {
        console.error("Error getting system info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getSystemInfo();
  }, []);

  // Toggle theme - memoized with useCallback to prevent unnecessary re-renders
  const toggleTheme = useCallback(async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.className = `theme-${newTheme}`;
    
    // Save settings
    try {
      await invoke("save_settings", {
        settings: {
          theme: newTheme,
          language: i18n.language
        }
      });
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }, [theme, i18n.language]);

  // Handle section change - memoized with useCallback
  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section);
    
    if (section === "search-java") {
      // Load Java installations when switching to Java tab
      // This would be implemented in a real app
      setIsLoadingJava(true);
      // Simulate loading Java installations
      setTimeout(() => {
        setJavaInstallations([
          {
            version: "17.0.2",
            vendor: "Oracle",
            path: "C:\\Program Files\\Java\\jdk-17.0.2",
            arch: "x64",
            isDefault: true
          },
          {
            version: "1.8.0_301",
            vendor: "AdoptOpenJDK",
            path: "C:\\Program Files\\AdoptOpenJDK\\jdk-8.0.301-hotspot",
            arch: "x64",
            isDefault: false
          }
        ]);
        setIsLoadingJava(false);
      }, 1500);
    }
  }, []);

  // Handle version selection - memoized with useCallback
  const handleVersionSelect = useCallback((version: string, customVer?: string) => {
    setSelectedVersion(version);
    if (customVer) {
      setCustomVersion(customVer);
    }
    setShowJavaRecommendation(true);
  }, []);

  // Apply theme class to body
  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  return (
    <div className="app-container">
      <Header onThemeToggle={toggleTheme} theme={theme} />
      
      <div className="content-area">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange}
          javaInstallations={javaInstallations}
          isLoadingJava={isLoadingJava}
        />
        
        <main className="main-content">
          <Loading isLoading={isLoading} />
          
          <SystemInfo systemInfo={systemInfo} isLoading={isLoading} />
          
          <MinecraftVersionSelector onVersionSelect={handleVersionSelect} />
          
          <JavaRecommendation 
            selectedVersion={selectedVersion}
            customVersion={customVersion}
            isVisible={showJavaRecommendation}
          />
          
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default App;
