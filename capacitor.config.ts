import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.focusuniverse.app',
  appName: 'Focus Universe',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#8b5cf6',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f0a1e',
    },
  },
}

export default config
