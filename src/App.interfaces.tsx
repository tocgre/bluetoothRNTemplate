import { IDevice } from './BleManagerPlx.interfaces'
import AdveezConfigController from './controllers/AdveezConfig'

export type NullableTimeout = null | ReturnType<typeof setInterval>

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
}

export interface IInfos {
  name: string
  version: string
}

export interface IDeviceInformations {
  lastSeenDate: Date
  lastSeen: number
}

export interface IStoredDevice {
  device: IDevice
  informations: IDeviceInformations
  rssi: number | undefined
}

export interface IDeviceInformation {
  name: string
  adveezConfigController: null | AdveezConfigController
}

export interface IBleConnectedProps {
  onExitGsePress: () => void
}

export enum DATA_TYPES {
  STRING,
  UINT8,
  UINT16BE,
  HEXASTRING
}

export type DataType =
| DATA_TYPES.STRING
| DATA_TYPES.UINT8
| DATA_TYPES.UINT16BE
| DATA_TYPES.HEXASTRING
