import { IAppState } from '../App.interfaces'

export enum APP_ACTIONS {
  UPDATE_SELECTED_DEVICE,
  UPDATE_DEVICE_INFO,
  IS_SCANNING,
  IS_CONNECTED,
  IS_BLE_ENABLED,
  IS_GPS_ENABLED,
  IS_SHOW_ACTIVITY_INDICATOR,
  IS_CONNECTING,
  IS_SCANNING_STARTED,
  IS_DISCONNECTING,
  IS_HARDWARE_BACK_PRESSED
}

export type appActionType =
  | APP_ACTIONS.UPDATE_SELECTED_DEVICE
  | APP_ACTIONS.UPDATE_DEVICE_INFO
  | APP_ACTIONS.IS_SCANNING
  | APP_ACTIONS.IS_CONNECTED
  | APP_ACTIONS.IS_BLE_ENABLED
  | APP_ACTIONS.IS_GPS_ENABLED
  | APP_ACTIONS.IS_SHOW_ACTIVITY_INDICATOR
  | APP_ACTIONS.IS_CONNECTING
  | APP_ACTIONS.IS_SCANNING_STARTED
  | APP_ACTIONS.IS_DISCONNECTING
  | APP_ACTIONS.IS_HARDWARE_BACK_PRESSED

export interface IAppActions {
  type: appActionType
  value?: any
}

export function appReducer (state: IAppState, action: IAppActions): IAppState {
  switch (action.type) {
    case APP_ACTIONS.UPDATE_SELECTED_DEVICE:
      return { ...state, selectedDevice: action.value }
    case APP_ACTIONS.UPDATE_DEVICE_INFO:
      return { ...state, deviceInformation: { ...state.deviceInformation, ...action.value } }
    case APP_ACTIONS.IS_SCANNING:
      return { ...state, isScanning: action.value }
    case APP_ACTIONS.IS_CONNECTED:
      return { ...state, isConnected: action.value }
    case APP_ACTIONS.IS_BLE_ENABLED:
      return { ...state, isBleEnabled: action.value }
    case APP_ACTIONS.IS_GPS_ENABLED:
      return { ...state, isGpsEnabled: action.value }
    case APP_ACTIONS.IS_SHOW_ACTIVITY_INDICATOR:
      return { ...state, showActivityIndicator: action.value }
    case APP_ACTIONS.IS_CONNECTING:
      return { ...state, isConnecting: action.value }
    case APP_ACTIONS.IS_SCANNING_STARTED:
      return { ...state, isScanningStarted: action.value }
    case APP_ACTIONS.IS_DISCONNECTING:
      return { ...state, isDisconnecting: action.value }
    case APP_ACTIONS.IS_HARDWARE_BACK_PRESSED:
      return { ...state, isHardwareBackPressed: action.value }
    default:
      throw new Error()
  }
}
