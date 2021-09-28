import React, { useEffect, useReducer } from 'react'
import {
  NativeModules,
  NativeEventEmitter,
  Platform,
  EmitterSubscription,
  BackHandler,
  NativeEventSubscription
} from 'react-native'
import Router from './components/Router'
import { useLocation, useHistory } from 'react-router-native'
import BleManager from 'react-native-ble-manager'
import { Map } from 'immutable'
import { mapReducer, MAP_ACTIONS, IActions } from './helpers/map'
import { NullableTimeout, IStoredDevice, IDeviceInformation, IDiscoveredPeripheral, IUpdateValueForCharacteristic, IDisconnectPeripheral } from './App.interfaces'
import {
  ADVEEZ_COMPANY_ID,
  FAMA_SCREEN_SERVICE,
  AUTHENTICATION_PASSWORD,
  FAMA_SCRREEN_DEVICE_ID
} from './constants'
import GPSState from 'react-native-gps-state'
import bigInt from 'big-integer'
import { appReducer, APP_ACTIONS } from './helpers/reducers'
import appInfos from '../app.json'
import { calculateLastSeen } from './helpers/datetime'
import { Buffer } from 'buffer'

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)

const _appInfos = {
  name: appInfos.displayName,
  version: appInfos.version
}

const defaultDeviceInfomation: IDeviceInformation = {
  deviceName: '',
  id: '',
  famaState: 0x00,
  relayHoldingTime: 0x00
}

const appInitState = {
  selectedDevice: null,
  deviceInformation: defaultDeviceInfomation,
  isScanning: false,
  isConnected: false,
  pedalModalVisible: false,
  pedalRemainingTime: null,
  isBleEnabled: true,
  isGpsEnabled: true,
  showActivityIndicator: false,
  bondingModalVisible: false,
  isConnecting: false,
  isScanningStarted: false,
  isDisconnecting: false,
  isHardwareBackPressed: false
}

type TDispatch = (state: any, action: IActions) => Map<number, IStoredDevice>

export default function AppController (): JSX.Element {
  const [scannedDevices, dispatchDevice] = useReducer<TDispatch, Map<number, IStoredDevice>>(mapReducer, Map(), () => Map())
  const [appState, setAppState] = useReducer(appReducer, appInitState)
  const location = useLocation()
  const history = useHistory()

  useEffect(() => {
    let discoverPeripheralSubscription: EmitterSubscription
    let stopScanSubscription: EmitterSubscription
    let disconnectedPeripheralSubscription: EmitterSubscription
    let updateValueForCharacteristicSubscription: EmitterSubscription
    let updateBleStateSubscription: EmitterSubscription
    let backHandlerSubscription: NativeEventSubscription
    BleManager.start({ showAlert: false }).then(() => {
      discoverPeripheralSubscription = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral)
      stopScanSubscription = bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan)
      disconnectedPeripheralSubscription = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral)
      updateValueForCharacteristicSubscription = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic)
      updateBleStateSubscription = bleManagerEmitter.addListener('BleManagerDidUpdateState', handleUpdateBleState)
      GPSState.addListener(handleUpdateGpsState)
      if (Platform.OS === 'android') {
        backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', handleHardwareBackPress)
      }
    }).catch((e: any) => console.error(e))

    return () => {
      discoverPeripheralSubscription.remove()
      stopScanSubscription.remove()
      disconnectedPeripheralSubscription.remove()
      updateValueForCharacteristicSubscription.remove()
      updateBleStateSubscription.remove()
      GPSState.removeListener()
      if (Platform.OS === 'android') {
        backHandlerSubscription.remove()
      }
    }
  }, [])

  useEffect(() => {
    let intervall: NullableTimeout = null
    if (location.pathname === '/Scanning' && appState.isBleEnabled) {
      startScan().then(() => {
        intervall = setInterval(() => {
          dispatchDevice({
            type: MAP_ACTIONS.UPDATE_ALL,
            update: ({ deviceName, id, rssi, lastSeenDate, uidFama, tagType, tagId }) => {
              return {
                deviceName: deviceName,
                id: id,
                rssi: rssi,
                lastSeenDate: lastSeenDate,
                lastSeen: calculateLastSeen(lastSeenDate),
                uidFama: uidFama,
                tagType: tagType,
                tagId: tagId
              }
            }
          })
        }, 1000)
      }).catch((e) => console.error(e))
    } else {
      if (appState.isScanning) {
        BleManager.stopScan().then().catch((e: any) => console.error(e))
      }
    }
    return () => {
      if (intervall != null) {
        clearInterval(intervall)
      }
    }
  }, [location, appState.isBleEnabled])

  useEffect(() => {
    if (appState.isHardwareBackPressed && Platform.OS === 'android') {
      switch (location.pathname) {
        case '/':
          BackHandler.exitApp()
          break
        case '/Scanning':
          history.goBack()
          break
        default:
          break
      }
      setAppState({ type: APP_ACTIONS.IS_HARDWARE_BACK_PRESSED, value: false })
    }
  }, [appState.isHardwareBackPressed])

  useEffect(() => {
    if (appState.selectedDevice !== null) {
      bleConnect().then().catch((e) => console.error(e))
    }
  }, [appState.selectedDevice])

  const startScan = async (): Promise<void> => {
    if (!appState.isScanning && !appState.isScanningStarted) {
      try {
        setAppState({ type: APP_ACTIONS.IS_SCANNING_STARTED, value: true })
        await BleManager.scan([], 0, true)
        setAppState({ type: APP_ACTIONS.IS_SCANNING_STARTED, value: false })
        console.log('Scanning...')
        setAppState({ type: APP_ACTIONS.IS_SCANNING, value: true })
      } catch (error) {
        setAppState({ type: APP_ACTIONS.IS_SCANNING_STARTED, value: false })
        console.error('Pb Starting scan: ', error)
      }
    }
  }

  const handleDisconnectedPeripheral = (data: IDisconnectPeripheral): void => {
    console.log('Disconnected from ', data.peripheral)
    setAppState({ type: APP_ACTIONS.IS_CONNECTED, value: false })
    setAppState({ type: APP_ACTIONS.IS_DISCONNECTING, value: false })
  }

  const handleUpdateValueForCharacteristic = (data: IUpdateValueForCharacteristic): void => {
    const buffer = Buffer.from(data.value)
    if (data.characteristic === FAMA_SCREEN_SERVICE.CHARACTERISTICS.FAMA_STATE) {
      setAppState({ type: APP_ACTIONS.UPDATE_DEVICE_INFO, value: { famaState: buffer.readUInt16BE() } })
      if ((buffer.readUInt16BE() & 0x0001) === 0x0001) {
        console.log('Pedal pushed')
        setAppState({ type: APP_ACTIONS.IS_PEDAL_MODAL_VISIBLE, value: false })
      } else {
        console.log('Pedal released')
        setAppState({ type: APP_ACTIONS.IS_PEDAL_MODAL_VISIBLE, value: true })
      }
    }
    if (data.characteristic === FAMA_SCREEN_SERVICE.CHARACTERISTICS.RELAY_HOLDING_TIME) {
      setAppState({ type: APP_ACTIONS.UPDATE_DEVICE_INFO, value: { relayHoldingTime: buffer.readUInt16BE() } })
    }
  }

  const handleUpdateBleState = (data: any): void => {
    if (data.state === 'on') {
      setAppState({ type: APP_ACTIONS.IS_BLE_ENABLED, value: true })
    } else {
      setAppState({ type: APP_ACTIONS.IS_BLE_ENABLED, value: false })
    }
  }

  const handleUpdateGpsState = (status: number): void => {
    if (status === GPSState.AUTHORIZED_ALWAYS || status === GPSState.AUTHORIZED_WHENINUSE) {
      setAppState({ type: APP_ACTIONS.IS_GPS_ENABLED, value: true })
    } else {
      setAppState({ type: APP_ACTIONS.IS_GPS_ENABLED, value: false })
    }
  }

  function checkBleState (): void {
    BleManager.checkState()
  }

  const handleStopScan = (): void => {
    console.log('Scan is stopped')
    setAppState({ type: APP_ACTIONS.IS_SCANNING, value: false })
    dispatchDevice({
      type: MAP_ACTIONS.RESET
    })
  }

  const handleDiscoverPeripheral = (peripheral: IDiscoveredPeripheral): void => {
    if (peripheral.name === null) {
      peripheral.name = 'No Name'
    }
    const buffer = Buffer.from(peripheral.advertising.manufacturerData.bytes, 'base64')
    let index = 0
    let size = 0
    let manufacturerDataFound = false
    let manufacturerData = Buffer.alloc(32)
    while (buffer[index] !== 0x00 && !manufacturerDataFound) {
      size = buffer.readUInt8(index)
      if (buffer.readUInt8(index + 1) === 0xFF) {
        manufacturerData = buffer.subarray(index + 2, index + 2 + size - 1)
        manufacturerDataFound = true
      } else {
        index += size + 1
      }
    }
    const companyId = manufacturerData.readUInt16BE(0)
    let deviceId = 0
    if (buffer.includes('ADV')) {
      if (buffer.indexOf('ADV') + 3 <= buffer.length - 1) {
        deviceId = buffer.readUInt8(buffer.indexOf('ADV') + 3)
      }
    }
    if (companyId === ADVEEZ_COMPANY_ID && buffer.includes('ADV') && deviceId === FAMA_SCRREEN_DEVICE_ID) {
      let uidFama = 0
      let tagType = 0
      let tagId = bigInt(0).toString()
      if (manufacturerData.length >= 19) {
        uidFama = manufacturerData.readUInt32BE(6)
        tagType = manufacturerData.readUInt8(10)
        tagId = bigInt(manufacturerData.toString('hex', 11, 19), 16).toString()
      }
      const newDevice: IStoredDevice = {
        deviceName: peripheral.name,
        id: peripheral.id,
        rssi: peripheral.rssi,
        lastSeenDate: new Date(),
        lastSeen: 0,
        uidFama: uidFama,
        tagType: tagType,
        tagId: tagId
      }
      dispatchDevice({
        type: MAP_ACTIONS.ADD,
        key: peripheral.id,
        value: newDevice
      })
    }
  }

  function handleHardwareBackPress (): boolean {
    setAppState({ type: APP_ACTIONS.IS_HARDWARE_BACK_PRESSED, value: true })
    return true
  }

  async function bleConnect (): Promise<boolean | undefined> {
    if (!appState.isConnecting) {
      try {
        setAppState({ type: APP_ACTIONS.IS_CONNECTING, value: true })
        if (appState.isScanning) {
          await BleManager.stopScan()
        }
        if (appState.selectedDevice !== null) {
          await BleManager.connect(appState.selectedDevice.id)
          setAppState({ type: APP_ACTIONS.IS_CONNECTED, value: true })
          setAppState({ type: APP_ACTIONS.UPDATE_DEVICE_INFO, value: { name: appState.selectedDevice.deviceName, id: appState.selectedDevice.id } })
          console.log('Connected to ' + appState.selectedDevice.deviceName + ', ID: ' + appState.selectedDevice.id)
          if (Platform.OS === 'android') {
            try {
              await BleManager.createBond(appState.selectedDevice.id)
              console.log('Device bonded !')
            } catch (error) {
              setAppState({ type: APP_ACTIONS.IS_BONDING_MODAL_VISIBLE, value: true })
              console.error(error)
              setAppState({ type: APP_ACTIONS.IS_SHOW_ACTIVITY_INDICATOR, value: false })
              setAppState({ type: APP_ACTIONS.IS_CONNECTING, value: false })
              if (appState.selectedDevice.id !== null && !appState.isDisconnecting) {
                try {
                  setAppState({ type: APP_ACTIONS.IS_DISCONNECTING, value: true })
                  await BleManager.disconnect(appState.selectedDevice.id)
                } catch (error) {
                  setAppState({ type: APP_ACTIONS.IS_DISCONNECTING, value: false })
                  console.error('Pb disconnecting: ', error)
                }
              }
              history.replace('/Scanning')
              return false
            }
          }
          /* Test read current RSSI value */
          await BleManager.retrieveServices(appState.selectedDevice.id)
          /* Write password */
          const auth = Buffer.from(AUTHENTICATION_PASSWORD)
          const authArray = []
          for (const byte of auth) {
            authArray.push(byte)
          }
          await BleManager.write(appState.selectedDevice.id, FAMA_SCREEN_SERVICE.UUID, FAMA_SCREEN_SERVICE.CHARACTERISTICS.PASSWORD, authArray)
          /* Read FAMA characteristics */
          const value = await BleManager.read(appState.selectedDevice.id, FAMA_SCREEN_SERVICE.UUID, FAMA_SCREEN_SERVICE.CHARACTERISTICS.FAMA_STATE)
          const buffer1 = Buffer.from(value)
          setAppState({ type: APP_ACTIONS.UPDATE_DEVICE_INFO, value: { famaState: buffer1.readUInt16BE() } })
          /* Register to FAMA_STATE notification */
          await BleManager.startNotification(appState.selectedDevice.id, FAMA_SCREEN_SERVICE.UUID, FAMA_SCREEN_SERVICE.CHARACTERISTICS.FAMA_STATE)
          /* Read Relay Holding Time characteristic */
          const value2 = await BleManager.read(appState.selectedDevice.id, FAMA_SCREEN_SERVICE.UUID, FAMA_SCREEN_SERVICE.CHARACTERISTICS.RELAY_HOLDING_TIME)
          const buffer2 = Buffer.from(value2)
          setAppState({ type: APP_ACTIONS.UPDATE_DEVICE_INFO, value: { relayHoldingTime: buffer2.readUInt16BE() } })
          /* Register to RELAY_HOLDING_TIME notification */
          await BleManager.startNotification(appState.selectedDevice.id, FAMA_SCREEN_SERVICE.UUID, FAMA_SCREEN_SERVICE.CHARACTERISTICS.RELAY_HOLDING_TIME)
          setAppState({ type: APP_ACTIONS.IS_SHOW_ACTIVITY_INDICATOR, value: false })
          setAppState({ type: APP_ACTIONS.IS_CONNECTING, value: false })
          history.push('/Checklist')
        }
      } catch (error) {
        console.error(error)
        setAppState({ type: APP_ACTIONS.IS_SHOW_ACTIVITY_INDICATOR, value: false })
        setAppState({ type: APP_ACTIONS.IS_CONNECTING, value: false })
        if (appState.selectedDevice != null && !appState.isDisconnecting) {
          try {
            setAppState({ type: APP_ACTIONS.IS_DISCONNECTING, value: true })
            await BleManager.disconnect(appState.selectedDevice.id)
          } catch (error) {
            setAppState({ type: APP_ACTIONS.IS_DISCONNECTING, value: false })
            console.error('Pb disconnecting: ', error)
          }
        }
        history.replace('/Scanning')
      }
    }
  }

  async function bleDisconnect (): Promise<void> {
    if (appState.isConnected && appState.selectedDevice != null && !appState.isDisconnecting) {
      try {
        setAppState({ type: APP_ACTIONS.IS_DISCONNECTING, value: true })
        await BleManager.disconnect(appState.selectedDevice.id)
      } catch (error) {
        setAppState({ type: APP_ACTIONS.IS_DISCONNECTING, value: false })
        console.error('Pb disconnecting: ', error)
      }
    }
  }

  function checkGpsState (): void {
    GPSState.getStatus().then(handleUpdateGpsState).catch((e) => console.error(e))
  }

  function handleSelectDevicePress (device: IStoredDevice): void {
    setAppState({ type: APP_ACTIONS.IS_SHOW_ACTIVITY_INDICATOR, value: true })
    setAppState({ type: APP_ACTIONS.UPDATE_SELECTED_DEVICE, value: device })
  }

  function handleBackpress (): void {
    history.goBack()
  }

  function onCancelPress (): void {
    if (appState.isScanning) {
      BleManager.stopScan().then().catch((e) => console.error(e))
    } else {
      startScan().then().catch((e) => console.error(e))
    }
  }

  return (
    <Router
      _appInfos={_appInfos}
      scannedDevices={[...scannedDevices.values()]}
      selectedDevice={appState.selectedDevice}
      isScanning={appState.isScanning}
      isBleEnabled={appState.isBleEnabled}
      isGpsEnabled={appState.isGpsEnabled}
      showActivityIndicator={appState.showActivityIndicator}
      bondingModalVisible={appState.bondingModalVisible}
      pedalModalVisible={appState.pedalModalVisible}
      checkBleState={checkBleState}
      checkGpsState={checkGpsState}
      handleSelectDevicePress={handleSelectDevicePress}
      handleBackpress={handleBackpress}
      handleExitGsePress={() => null}
      onCancelPress={onCancelPress}
      bleDisconnect={bleDisconnect}
    />
  )
}
