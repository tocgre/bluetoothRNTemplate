export type NullableTimeout = null | ReturnType<typeof setInterval>

export interface IInfos {
  name: string
  version: string
}

export interface IAppState {
  selectedDevice: null | IStoredDevice
  deviceInformation: IDeviceInformation
  isScanning: boolean
  isConnected: boolean
  pedalModalVisible: boolean
  pedalRemainingTime: number | null
  isBleEnabled: boolean
  isGpsEnabled: boolean
  showActivityIndicator: boolean
  bondingModalVisible: boolean
  isConnecting: boolean
  isScanningStarted: boolean
  isDisconnecting: boolean
  isHardwareBackPressed: boolean
}

export interface IDevice {
  id: string
  rssi: number
  lastSeenDate: Date
  lastSeen: number
}

export interface IStoredDevice {
  deviceName: string
  id: string
  rssi: number
  lastSeenDate: Date
  lastSeen: number
  uidFama: number
  tagType: number
  tagId: string
}

export interface IDeviceInformation {
  deviceName: string
  id: string
  famaState: number
  relayHoldingTime: number
}

export interface IStoredLoginInfo {
  login: string
  firstName: string
  lastName: string
  driverId: number
  password: string
  role: string
  language: string
  timeOfDisconnection: Date
  rememberLogin: boolean
}

export interface IBleConnectedProps {
  onExitGsePress: () => void
  bleDisconnect: () => void
  pedalModalVisible: boolean
  pedalRemainingtime: number | null
}

export interface IDiscoveredPeripheral {
  id: string
  name: string
  rssi: number
  advertising: IAdvertising
}

export interface IAdvertising {
  isConnectable: boolean
  serviceUUIDs: [string]
  manufacturerData: IManufacturerData
  serviceData: JSON
  txPowerLevel: number
}

export interface IManufacturerData {
  bytes: string
  data: string
}

export interface IUpdateValueForCharacteristic {
  value: [number]
  peripheral: string
  characteristic: string
  service: string
}

export interface IDisconnectPeripheral {
  peripheral: string
  status: number
}
