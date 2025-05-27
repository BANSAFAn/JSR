; Скрипт NSIS для создания минималистичного и современного установщика JSR

!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "LogicLib.nsh"
!include "WinVer.nsh"
!include "nsDialogs.nsh"
!include "UAC.nsh"

; Дополнительные настройки для максимального сжатия
SetCompressor /FINAL /SOLID lzma
SetCompressorDictSize 128
SetDatablockOptimize ON

; Оптимизация размера установщика
!define COMPRESS_SCRIPTS
!define COMPRESS_WHOLE
!define NSIS_COMPRESS_WHOLE
!define NSIS_CONFIG_COMPRESSION_SUPPORT
!define NSIS_LZMA_COMPRESS_WHOLE

; Современный интерфейс
!define MUI_ICON "..\assets\images\AppIcon.ico"
!define MUI_UNICON "..\assets\images\AppIcon.ico"

; Цвета и стили для современного минималистичного интерфейса
!define MUI_BGCOLOR "FFFFFF"
!define MUI_TEXTCOLOR "000000"

; Шрифт - используем системный шрифт Windows 10/11
!define MUI_FONT "Segoe UI"
!define MUI_FONTSIZE "9"

; Настройки для минималистичного интерфейса
!define MUI_COMPONENTSPAGE_SMALLDESC
!define MUI_ABORTWARNING
!define MUI_FINISHPAGE_RUN "$INSTDIR\JSR.exe"
!define MUI_FINISHPAGE_RUN_TEXT "$(LAUNCH_AFTER_INSTALL)"

; Заголовки - используем собственные изображения
!define MUI_WELCOMEFINISHPAGE_BITMAP "..\assets\images\installer-sidebar.png"
!define MUI_UNWELCOMEFINISHPAGE_BITMAP "..\assets\images\installer-sidebar.png"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "..\assets\images\installer-sidebar.png"
!define MUI_HEADERIMAGE_RIGHT

; Настройки для минималистичного интерфейса
!define MUI_COMPONENTSPAGE_NODESC
!define MUI_DIRECTORYPAGE_VERIFYONLEAVE
!define MUI_INSTFILESPAGE_COLORS "FFFFFF 000000"
!define MUI_INSTFILESPAGE_PROGRESSBAR "colored"

; Приветственная страница
!define MUI_WELCOMEPAGE_TITLE "$(INSTALLER_NAME)"
!define MUI_WELCOMEPAGE_TITLE_3LINES
!define MUI_WELCOMEPAGE_TEXT "$(WELCOME_TEXT)"

; Функция для оптимизации установки
Function optimizeInstaller
  ; Дополнительные настройки для уменьшения размера установщика
  SetOutPath "$INSTDIR"
  
  ; Удаление временных файлов после установки
  Delete "$TEMP\*.tmp"
  
  ; Оптимизация файловой системы - удаляем ненужные файлы
  Delete "$INSTDIR\resources\app\node_modules\**\*.md"
  Delete "$INSTDIR\resources\app\node_modules\**\*.markdown"
  Delete "$INSTDIR\resources\app\node_modules\**\*.ts"
  Delete "$INSTDIR\resources\app\node_modules\**\*.map"
  Delete "$INSTDIR\resources\app\node_modules\**\LICENSE*"
  Delete "$INSTDIR\resources\app\node_modules\**\README*"
  Delete "$INSTDIR\resources\app\node_modules\**\CHANGELOG*"
  Delete "$INSTDIR\resources\app\node_modules\**\.npmignore"
  Delete "$INSTDIR\resources\app\node_modules\**\.DS_Store"
  RMDir /r "$INSTDIR\resources\app\node_modules\**\test"
  RMDir /r "$INSTDIR\resources\app\node_modules\**\tests"
  RMDir /r "$INSTDIR\resources\app\node_modules\**\docs"
  RMDir /r "$INSTDIR\resources\app\node_modules\**\example"
  RMDir /r "$INSTDIR\resources\app\node_modules\**\examples"
  RMDir /r "$INSTDIR\resources\app\node_modules\**\.github"
  RMDir /r "$INSTDIR\resources\app\node_modules\**\.vscode"
  RMDir /r "$INSTDIR\resources\app\node_modules\**\.idea"
  
  ; Оптимизация реестра - используем HKCU для пользовательской установки
  ${If} $MultiUser.InstallMode == "CurrentUser"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayName" "${PRODUCT_NAME}"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "UninstallString" "$INSTDIR\uninstall.exe"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayIcon" "$INSTDIR\resources\app\assets\images\AppIcon.ico"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "Publisher" "BANSAFAn"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayVersion" "${PRODUCT_VERSION}"
    WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "NoModify" 1
    WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "NoRepair" 1
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "EstimatedSize" "${ESTIMATED_SIZE}"
  ${Else}
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayName" "${PRODUCT_NAME}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "UninstallString" "$INSTDIR\uninstall.exe"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayIcon" "$INSTDIR\resources\app\assets\images\AppIcon.ico"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "Publisher" "BANSAFAn"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayVersion" "${PRODUCT_VERSION}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "EstimatedSize" "${ESTIMATED_SIZE}"
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "NoModify" 1
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "NoRepair" 1
  ${EndIf}
FunctionEnd

; Функция для отображения загрузочного экрана
; Определение переменных для мультипользовательской установки
Var MultiUser.InstallMode
Var MultiUser.InstallMode.CurrentUser

; Функция инициализации установщика
Function .onInit
  ; Показываем красивый загрузочный экран
  SetOutPath $TEMP
  SetOverwrite on
  File /oname=splash.bmp "..\assets\images\installer-sidebar.png"
  advsplash::show 1000 600 400 -1 $TEMP\splash
  Pop $0
  Delete $TEMP\splash.bmp
  
  ; Проверка прав администратора для выбора типа установки
  ${If} ${AtLeastWin8}
    ; Для Windows 8 и выше предлагаем выбор типа установки
    StrCpy $MultiUser.InstallMode "AllUsers"
    ${IfNot} ${UAC_IsAdmin}
      StrCpy $MultiUser.InstallMode "CurrentUser"
    ${EndIf}
  ${Else}
    ; Для более старых версий Windows всегда устанавливаем для всех пользователей
    StrCpy $MultiUser.InstallMode "AllUsers"
  ${EndIf}
  
  ; Устанавливаем путь установки по умолчанию в зависимости от типа установки
  ${If} $MultiUser.InstallMode == "CurrentUser"
    StrCpy $INSTDIR "$LOCALAPPDATA\Programs\JSR"
  ${Else}
    StrCpy $INSTDIR "$PROGRAMFILES\JSR"
  ${EndIf}
FunctionEnd

; Функция для создания ярлыков
Function CreateShortcuts
  ; Создаем ярлыки в зависимости от типа установки
  ${If} $MultiUser.InstallMode == "CurrentUser"
    ; Для текущего пользователя
    CreateDirectory "$SMPROGRAMS\JSR"
    CreateShortCut "$SMPROGRAMS\JSR\JSR.lnk" "$INSTDIR\JSR.exe" "" "$INSTDIR\resources\app\assets\images\AppIcon.ico" 0
    CreateShortCut "$SMPROGRAMS\JSR\Uninstall.lnk" "$INSTDIR\Uninstall.exe" "" "$INSTDIR\Uninstall.exe" 0
  ${Else}
    ; Для всех пользователей
    CreateDirectory "$SMPROGRAMS\JSR"
    CreateShortCut "$SMPROGRAMS\JSR\JSR.lnk" "$INSTDIR\JSR.exe" "" "$INSTDIR\resources\app\assets\images\AppIcon.ico" 0
    CreateShortCut "$SMPROGRAMS\JSR\Uninstall.lnk" "$INSTDIR\Uninstall.exe" "" "$INSTDIR\Uninstall.exe" 0
  ${EndIf}
  
  ; Создаем ярлык на рабочем столе (опционально)
  CreateShortCut "$DESKTOP\JSR.lnk" "$INSTDIR\JSR.exe" "" "$INSTDIR\resources\app\assets\images\AppIcon.ico" 0
FunctionEnd

; Вызов функции оптимизации после установки
; Расчет примерного размера установки
!define ESTIMATED_SIZE 50000

; Основная секция установки
Section "JSR" SecMain
  SectionIn RO
  SetOutPath "$INSTDIR"
  
  ; Создаем ярлыки
  Call CreateShortcuts
  
  ; Оптимизируем установку
  Call optimizeInstaller
  
  ; Создаем деинсталлятор
  WriteUninstaller "$INSTDIR\uninstall.exe"
SectionEnd

; Секция деинсталляции
Section "Uninstall"
  ; Удаляем ярлыки
  Delete "$DESKTOP\JSR.lnk"
  Delete "$SMPROGRAMS\JSR\JSR.lnk"
  Delete "$SMPROGRAMS\JSR\Uninstall.lnk"
  RMDir "$SMPROGRAMS\JSR"
  
  ; Удаляем файлы и папки программы
  Delete "$INSTDIR\uninstall.exe"
  Delete "$INSTDIR\JSR.exe"
  RMDir /r "$INSTDIR\resources"
  RMDir /r "$INSTDIR\locales"
  
  ; Удаляем записи реестра
  ${If} $MultiUser.InstallMode == "CurrentUser"
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
  ${Else}
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
  ${EndIf}
  
  ; Удаляем директорию установки, если она пуста
  RMDir "$INSTDIR"
SectionEnd

; Функция для выбора типа установки
Function PageInstallModeChange
  ${If} $MultiUser.InstallMode == "CurrentUser"
    StrCpy $MultiUser.InstallMode "AllUsers"
    StrCpy $INSTDIR "$PROGRAMFILES\JSR"
  ${Else}
    StrCpy $MultiUser.InstallMode "CurrentUser"
    StrCpy $INSTDIR "$LOCALAPPDATA\Programs\JSR"
  ${EndIf}
FunctionEnd

; Функция для отображения страницы выбора типа установки
Function PageInstallMode
  !define MUI_PAGE_CUSTOMFUNCTION_PRE "PageInstallModePre"
  !define MUI_PAGE_HEADER_TEXT "$(INSTALL_TYPE_TITLE)"
  !define MUI_PAGE_HEADER_SUBTEXT "$(INSTALL_TYPE_SUBTITLE)"
  !define MUI_DIRECTORYPAGE_TEXT_TOP "Выберите тип установки JSR:$\r$\n$\r$\n${If} $MultiUser.InstallMode == 'CurrentUser'$\r$\n$(INSTALL_TYPE_CURRENTUSER)$\r$\n${Else}$\r$\n$(INSTALL_TYPE_ALLUSERS)$\r$\n${EndIf}$\r$\n$\r$\nНажмите 'Изменить тип установки' для переключения между режимами."
  !define MUI_DIRECTORYPAGE_VARIABLE $INSTDIR
  !define MUI_PAGE_CUSTOMFUNCTION_SHOW "PageInstallModeShow"
  !insertmacro MUI_PAGE_DIRECTORY
FunctionEnd

Function PageInstallModePre
  ${If} ${UAC_IsAdmin}
    StrCpy $MultiUser.InstallMode.CurrentUser "0"
  ${Else}
    StrCpy $MultiUser.InstallMode.CurrentUser "1"
  ${EndIf}
FunctionEnd

Function PageInstallModeShow
  ${If} $MultiUser.InstallMode.CurrentUser == "1"
    GetDlgItem $0 $HWNDPARENT 1
    EnableWindow $0 0
  ${EndIf}
  
  ${If} $MultiUser.InstallMode == "AllUsers"
    GetDlgItem $0 $HWNDPARENT 3
    SendMessage $0 ${WM_SETTEXT} 0 "STR:$(INSTALL_TYPE_CHANGE_TO_CURRENTUSER)"
  ${Else}
    GetDlgItem $0 $HWNDPARENT 3
    SendMessage $0 ${WM_SETTEXT} 0 "STR:$(INSTALL_TYPE_CHANGE_TO_ALLUSERS)"
  ${EndIf}
FunctionEnd

; Страницы установщика
!define MUI_PAGE_CUSTOMFUNCTION_SHOW DisableBackButton
!insertmacro MUI_PAGE_WELCOME

Function DisableBackButton
  GetDlgItem $0 $HWNDPARENT 3
  EnableWindow $0 0
FunctionEnd

!insertmacro MUI_PAGE_LICENSE "LICENSE"
Page custom PageInstallMode PageInstallModeChange
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; Страницы деинсталлятора
!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Языковые файлы
!insertmacro MUI_LANGUAGE "English"
!insertmacro MUI_LANGUAGE "Russian"
!insertmacro MUI_LANGUAGE "Ukrainian"
!insertmacro MUI_LANGUAGE "German"

; Включаем пользовательские переводы
!include "nsis-translations.nsh"