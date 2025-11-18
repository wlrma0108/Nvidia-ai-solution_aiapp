@echo off
echo Setting up React Native Vector Icons...

if not exist "android" if not exist "ios" (
  echo Warning: android/ios folders not found!
  echo Please run one of the following first:
  echo    1. npx react-native init YourAppName (React Native CLI^)
  echo    2. npx expo prebuild (Expo^)
  echo.
  echo Then copy the android/ios folders to this directory.
  exit /b 0
)

echo Installing react-native-asset...
call npm install -g react-native-asset 2>nul || call npm install react-native-asset

echo Linking icon fonts...
call npx react-native-asset

if %errorlevel% equ 0 (
  echo Icon fonts linked successfully!
  echo.
  echo Next steps:
  echo    1. For Android: npm run android
  echo    2. For iOS: cd ios ^&^& pod install ^&^& cd .. ^&^& npm run ios
) else (
  echo Failed to link icon fonts
  echo Please manually run: npx react-native-asset
  exit /b 1
)
