; Скрипт NSIS для оптимизации установщика JSR

!include "MUI2.nsh"
!include "FileFunc.nsh"

; Дополнительные настройки для максимального сжатия
SetCompressor /SOLID lzma
SetCompressorDictSize 64
SetDatablockOptimize ON

; Оптимизация размера установщика
!define COMPRESS_SCRIPTS
!define COMPRESS_WHOLE

; Функция для оптимизации установки
Function optimizeInstaller
  ; Дополнительные настройки для уменьшения размера установщика
  SetOutPath "$INSTDIR"
  
  ; Удаление временных файлов после установки
  Delete "$TEMP\*.tmp"
  
  ; Оптимизация реестра
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "UninstallString" "$INSTDIR\uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayIcon" "$INSTDIR\resources\app\assets\images\AppIcon.ico"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "Publisher" "BANSAFAn"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "NoRepair" 1
FunctionEnd

; Вызов функции оптимизации после установки
Section -Post
  Call optimizeInstaller
SectionEnd