import { DataType, IStoredDevice } from '../App.interfaces'

export interface IRouterProps {
  _appInfos: {
    name: string
    version: string
  }
  scannedDevices: IStoredDevice[]
  selectedDevice: IStoredDevice | null
  isScanning: boolean
  isBleEnabled: boolean
  isGpsEnabled: boolean
  showActivityIndicator: boolean
  checkBleState: () => void
  checkGpsState: () => void
  handleSelectDevicePress: (device: IStoredDevice) => void
  handleBackpress: () => void
  handleExitDevicePress: () => void
  onCancelPress: () => void
  bleDisconnect: () => Promise<void>
}
