/**
 * Enum definition
 */

export enum BLE_ERROR_CODE {
  UnknownError,
  BluetoothManagerDestroyed,
  OperationCancelled,
  OperationTimedOut,
  OperationStartFailed,
  InvalidIdentifiers,
  BluetoothUnsupported,
  BluetoothUnauthorized,
  BluetoothPoweredOff,
  BluetoothInUnknownState,
  BluetoothResetting,
  BluetoothStateChangeFailed,
  DeviceConnectionFailed,
  DeviceDisconnected,
  DeviceRSSIReadFailed,
  DeviceAlreadyConnected,
  DeviceNotFound,
  DeviceNotConnected,
  DeviceMTUChangeFailed,
  ServicesDiscoveryFailed,
  IncludedServicesDiscoveryFailed,
  ServiceNotFound,
  ServicesNotDiscovered,
  CharacteristicsDiscoveryFailed,
  CharacteristicWriteFailed,
  CharacteristicReadFailed,
  CharacteristicNotifyChangeFailed,
  CharacteristicNotFound,
  CharacteristicsNotDiscovered,
  CharacteristicInvalidDataFormat,
  DescriptorsDiscoveryFailed,
  DescriptorWriteFailed,
  DescriptorReadFailed,
  DescriptorNotFound,
  DescriptorsNotDiscovered,
  DescriptorInvalidDataFormat,
  DescriptorWriteNotAllowed,
  ScanStartFailed,
  LocationServicesDisabled,
}

export enum BLE_ATT_ERROR_CODE {
  Success,
  InvalidHandle,
  ReadNotPermitted,
  WriteNotPermitted,
  InvalidPdu,
  InsufficientAuthentication,
  RequestNotSupported,
  InvalidOffset,
  InsufficientAuthorization,
  PrepareQueueFull,
  AttributeNotFound,
  AttributeNotLong,
  InsufficientEncryptionKeySize,
  InvalidAttributeValueLength,
  UnlikelyError,
  InsufficientEncryption,
  UnsupportedGroupType,
  InsufficientResources,
}

export enum BLE_ANDROID_ERROR_CODE {
  NoResources,
  InternalError,
  WrongState,
  DbFull,
  Busy,
  Error,
  CmdStarted,
  IllegalParameter,
  Pending,
  AuthFail,
  More,
  InvalidCfg,
  ServiceStarted,
  EncrypedNoMitm,
  NotEncrypted,
  Congested,
}

export enum BLE_IOS_ERROR_CODE {
  Unknown,
  InvalidParameters,
  InvalidHandle,
  NotConnected,
  OutOfSpace,
  OperationCancelled,
  ConnectionTimeout,
  PeripheralDisconnected,
  UuidNotAllowed,
  AlreadyAdvertising,
  ConnectionFailed,
  ConnectionLimitReached,
  UnknownDevice,
}

export enum LOG_LEVEL {
  None,
  Verbose,
  Debug,
  Info,
  Warning,
  Error,
}

export enum CONNECTION_PRIORITY {
  Balanced = 0,
  High = 1,
  LowPower = 2,
}

export enum STATE {
  Unknown,
  Resetting,
  Unauthorized,
  PoweredOff,
  PoweredOn,
}

export enum SCAN_MODE {
  Opportunistic = -1,
  LowPower = 0,
  Balanced = 1,
  LowLatency = 2,
}

export enum SCAN_CALLBACK_TYPE {
  AllMatches = 1,
  FirstMatch = 2,
  MatchLost = 4,
}

/**
   * Enum Types
   */

export type DeviceId = string
export type Identifier = number
export type UUID = string
export type TransactionId = string
export type Base64 = string
export type ConnectionPriority =
    | CONNECTION_PRIORITY.Balanced
    | CONNECTION_PRIORITY.High
    | CONNECTION_PRIORITY.LowPower
export type State = keyof typeof STATE
export type ScanMode =
    | SCAN_MODE.Opportunistic
    | SCAN_MODE.LowPower
    | SCAN_MODE.Balanced
    | SCAN_MODE.LowLatency
export type ScanCallbackType =
    | SCAN_CALLBACK_TYPE.AllMatches
    | SCAN_CALLBACK_TYPE.FirstMatch
    | SCAN_CALLBACK_TYPE.MatchLost
export type BleError = keyof typeof BLE_ERROR_CODE
export type BleAttError = keyof typeof BLE_ATT_ERROR_CODE
export type BleAndroidError = keyof typeof BLE_ANDROID_ERROR_CODE
export type BleIosError = keyof typeof BLE_IOS_ERROR_CODE
export type LogLevel = keyof typeof LOG_LEVEL

/**
   * Enum Interfaces
   */

export interface ISubscription {
  remove: () => void
}

export interface IBleError {
  errorCode: BleError
  attErrorCode?: BleAttError
  iosErrorCode?: BleIosError
  androidErrorCode?: BleAndroidError
  reason?: string
}

export interface IBleManagerOptions {
  restoreStateIdentifier: string
  restoreStateFunction?: any // TODO later
  errorCodesToMessagesMapping?: any // TODO later
}

export interface IScanOptions {
  allowDuplicates?: boolean
  scanMode?: ScanMode
  callbackType?: ScanCallbackType
}

export interface IConnectionOptions {
  autoConnect: boolean
  requestMTU: number
  refreshGatt?: undefined | 'OnConnected'
  timeout: number
}

export interface IBleManager {
  destroy: () => void
  setLogLevel: (logLevel: LogLevel) => void
  logLevel: () => Promise<LogLevel>
  cancelTransaction: (transactionId?: TransactionId) => void
  enable: (transactionId?: TransactionId) => Promise<IBleManager>
  disable: (transactionId?: TransactionId) => Promise<IBleManager>
  state: () => Promise<State>
  onStateChange: (
    listener: (newState: State) => void,
    emitCurrentState: boolean
  ) => ISubscription
  startDeviceScan: (
    UUIDs?: null | UUID[],
    options?: IScanOptions,
    listener?: (error?: IBleError, scannedDevice?: IDevice) => void
  ) => void
  stopDeviceScan: () => void
  requestConnectionPriorityForDevice: (
    deviceIdentifier: DeviceId,
    connectionPriority: ConnectionPriority,
    transactionId?: TransactionId
  ) => Promise<IDevice>
  readRSSIForDevice: (
    deviceIdentifier: DeviceId,
    transactionId?: TransactionId
  ) => Promise<IDevice>
  requestMTUForDevice: (
    deviceIdentifier: DeviceId,
    mtu: number,
    transactionId?: TransactionId
  ) => Promise<IDevice>
  devices: (deviceIdentifiers: DeviceId[]) => Promise<IDevice[]>
  connectedDevices: (serviceUUIDs: UUID[]) => Promise<IDevice[]>
  connectToDevice: (
    deviceIdentifier: DeviceId,
    options?: IConnectionOptions
  ) => Promise<IDevice>
  cancelDeviceConnection: (deviceIdentifier: DeviceId) => Promise<IDevice>
  onDeviceDisconnected: (
    deviceIdentifier: DeviceId,
    listener: (error: null | IBleError, device: IDevice) => void
  ) => ISubscription
  isDeviceConnected: (deviceIdentifier: DeviceId) => Promise<boolean>
  discoverAllServicesAndCharacteristicsForDevice: (
    deviceIdentifier: DeviceId,
    transactionId?: TransactionId
  ) => Promise<IDevice>
  servicesForDevice: (deviceIdentifier: DeviceId) => Promise<IService[]>
  characteristicsForDevice: (
    deviceIdentifier: DeviceId,
    serviceUUID: UUID
  ) => Promise<ICharacteristic[]>
  descriptorsForDevice: (
    deviceIdentifier: DeviceId,
    serviceUUID: UUID,
    characteristicUUID: UUID
  ) => Promise<IDescriptor[]>
  readCharacteristicForDevice: (
    deviceIdentifier: DeviceId,
    serviceUUID: UUID,
    characteristicUUID: UUID,
    transactionId?: TransactionId
  ) => Promise<ICharacteristic>
  writeCharacteristicWithResponseForDevice: (
    deviceIdentifier: DeviceId,
    serviceUUID: UUID,
    characteristicUUID: UUID,
    base64Value: Base64,
    transactionId?: TransactionId
  ) => Promise<ICharacteristic>
  writeCharacteristicWithoutResponseForDevice: (
    deviceIdentifier: DeviceId,
    serviceUUID: UUID,
    characteristicUUID: UUID,
    base64Value: Base64,
    transactionId?: TransactionId
  ) => Promise<ICharacteristic>
  monitorCharacteristicForDevice: (
    deviceIdentifier: DeviceId,
    serviceUUID: UUID,
    characteristicUUID: UUID,
    listener: (error?: IBleError, characteristic?: ICharacteristic) => void,
    transactionId?: TransactionId
  ) => ISubscription
  readDescriptorForDevice: (
    deviceIdentifier: DeviceId,
    serviceUUID: UUID,
    characteristicUUID: UUID,
    descriptorUUID: UUID,
    transactionId?: TransactionId
  ) => Promise<IDescriptor>
  writeDescriptorForDevice: (
    deviceIdentifier: DeviceId,
    serviceUUID: UUID,
    characteristicUUID: UUID,
    descriptorUUID: UUID,
    valueBase64: Base64,
    transactionId?: TransactionId
  ) => Promise<IDescriptor>
}

export interface IDevice {
  id: DeviceId
  name?: string
  rssi?: number
  mtu: number
  manufacturerData?: Base64
  serviceData?: any // TODO later
  serviceUUIDs?: UUID[]
  localName?: string
  txPowerLevel?: number
  solicitedServiceUUIDs?: UUID[]
  isConnectable?: boolean
  overflowServiceUUIDs?: UUID[]
  requestConnectionPriority: (
    connectionPriority: ConnectionPriority,
    transactionId?: TransactionId
  ) => Promise<IDevice>
  readRSSI: (transactionId?: TransactionId) => Promise<IDevice>
  requestMTU: (mtu: number, transactionId?: TransactionId) => Promise<IDevice>
  connect: (options?: IConnectionOptions) => Promise<IDevice>
  cancelConnection: () => Promise<IDevice>
  isConnected: () => Promise<boolean>
  onDisconnected: (
    listener: (error: null | IBleError, device: IDevice) => any
  ) => ISubscription
  discoverAllServicesAndCharacteristics: (
    transactionId?: TransactionId
  ) => Promise<IDevice>
  services: () => Promise<IService[]>
  characteristicsForService: (
    serviceUUID: UUID
  ) => Promise<ICharacteristic[]>
  descriptorsForService: (
    serviceUUID: UUID,
    characteristicUUID: UUID
  ) => Promise<IDescriptor[]>
  readCharacteristicForService: (
    serviceUUID: UUID,
    characteristicUUID: UUID,
    transactionId?: TransactionId
  ) => Promise<ICharacteristic>
  writeCharacteristicWithResponseForService: (
    serviceUUID: UUID,
    characteristicUUID: UUID,
    valueBase64: Base64,
    transactionId?: TransactionId
  ) => Promise<ICharacteristic>
  writeCharacteristicWithoutResponseForService: (
    serviceUUID: UUID,
    characteristicUUID: UUID,
    valueBase64: Base64,
    transactionId?: TransactionId
  ) => Promise<ICharacteristic>
  monitorCharacteristicForService: (
    serviceUUID: UUID,
    characteristicUUID: UUID,
    listener: (error?: IBleError, characteristic?: ICharacteristic) => void,
    transactionId?: TransactionId
  ) => ISubscription
  readDescriptorForService: (
    serviceUUID: UUID,
    characteristicUUID: UUID,
    descriptorUUID: UUID,
    transactionId?: TransactionId
  ) => Promise<IDescriptor>
  writeDescriptorForService: (
    serviceUUID: UUID,
    characteristicUUID: UUID,
    descriptorUUID: UUID,
    valueBase64: Base64,
    transactionId?: TransactionId
  ) => Promise<IDescriptor>
}

export interface IService {
  id: Identifier
  uuid: UUID
  deviceID: DeviceId
  isPrimary: boolean
  characteristics: () => Promise<ICharacteristic[]>
  descriptorsForCharacteristic: (
    characteristicUUID: UUID
  ) => Promise<IDescriptor[]>
  readCharacteristic: (
    characteristicUUID: UUID,
    transactionId?: TransactionId
  ) => Promise<ICharacteristic>
  writeCharacteristicWithResponse: (
    characteristicUUID: UUID,
    valueBase64: Base64,
    transactionId?: TransactionId
  ) => Promise<ICharacteristic>
  writeCharacteristicWithoutResponse: (
    characteristicUUID: UUID,
    valueBase64: Base64,
    transactionId?: TransactionId
  ) => Promise<ICharacteristic>
  monitorCharacteristic: (
    characteristicUUID: UUID,
    listener: (error?: IBleError, characteristic?: ICharacteristic) => void,
    transactionId?: TransactionId
  ) => ISubscription
  readDescriptorForCharacteristic: (
    characteristicUUID: UUID,
    descriptorUUID: UUID,
    transactionId?: TransactionId
  ) => Promise<IDescriptor>
  writeDescriptorForCharacteristic: (
    characteristicUUID: UUID,
    descriptorUUID: UUID,
    valueBase64: Base64,
    transactionId?: TransactionId
  ) => Promise<IDescriptor>
}

export interface ICharacteristic {
  id: Identifier
  uuid: UUID
  serviceID: Identifier
  serviceUUID: UUID
  deviceID: DeviceId
  isReadable: boolean
  isWritableWithResponse: boolean
  isWritableWithoutResponse: boolean
  isNotifiable: boolean
  isNotifying: boolean
  isIndicatable: boolean
  value: Base64
  descriptors: () => Promise<IDescriptor[]>
  read: (transactionId?: TransactionId) => Promise<ICharacteristic>
  writeWithResponse: (
    valueBase64: Base64,
    transactionId?: TransactionId
  ) => Promise<ICharacteristic>
  writeWithoutResponse: (
    valueBase64: Base64,
    transactionId?: TransactionId
  ) => Promise<ICharacteristic>
  monitor: (
    listener: (error?: IBleError, characteristic?: ICharacteristic) => void,
    transactionId?: TransactionId
  ) => ISubscription
  readDescriptor: (
    descriptorUUID: UUID,
    transactionId?: TransactionId
  ) => Promise<IDescriptor>
  writeDescriptor: (
    descriptorUUID: UUID,
    valueBase64: Base64,
    transactionId?: TransactionId
  ) => Promise<IDescriptor>
}

export interface IDescriptor {
  id: Identifier
  uuid: UUID
  characteristicID: Identifier
  serviceID: Identifier
  serviceUUID: UUID
  deviceID: DeviceId
  value: Base64
  read: (transactionId?: TransactionId) => Promise<IDescriptor>
  write: (
    valueBase64: Base64,
    transactionId?: TransactionId
  ) => Promise<IDescriptor>
}
