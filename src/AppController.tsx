/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useReducer, useEffect } from 'react'
import {
} from 'react-native-paper'

import { useLocation, useHistory } from 'react-router-native'

import { NullableTimeout, IStoredDevice, IDeviceInformation } from './App.interfaces'

import appInfos from '../app.json'
import { IDevice } from './BleManagerPlx.interfaces'
import BleManager from './BleManager'
import { calculateLastSeen } from './helpers/datetime'
import { IActions, mapReducer, MAP_ACTIONS } from './helpers/map'
import { Map } from 'immutable'
import { Buffer } from 'buffer'
import AdveezConfigController from './controllers/AdveezConfig'
import { ADVEEZ_COMPANY_ID } from './constants'
import { appReducer, APP_ACTIONS } from './helpers/reducers'
import GPSState from 'react-native-gps-state'
import Router from './components/Router'

const _appInfos = {
  name: appInfos.displayName,
  version: appInfos.version
}

const defaultDeviceInfomations = {
  name: 'Loading...',
  adveezConfigController: null
}

const bleManager = new BleManager()

const appInitState = {
  selectedDevice: null,
  deviceInformation: defaultDeviceInfomations,
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
  isDisconnecting: false
}

const acceptDevice = (device: IDevice): boolean => {
  let accepted = false
  let companyId = 0
  let deviceId = 0
  if (device !== null) {
    if (device.manufacturerData !== null && device.manufacturerData !== undefined) {
      const buffer = Buffer.from(device.manufacturerData, 'base64')
      companyId = buffer.readUInt16BE(0)
      if (buffer.includes('ADV')) {
        if (buffer.indexOf('ADV') + 3 <= buffer.length - 1) {
          deviceId = buffer.readUInt8(buffer.indexOf('ADV') + 3)
        }
      }
      if (companyId === ADVEEZ_COMPANY_ID && buffer.includes('ADV') && deviceId === 0x03) {
        accepted = true
      }
    }
  }

  return accepted
}

type TDispatch = (state: any, action: IActions) => Map<number, IStoredDevice>

export default function AppController (): JSX.Element {
  const [scannedDevices, dispatchDevice] = useReducer<TDispatch, Map<number, IStoredDevice>>(mapReducer, Map(), () => Map())
  const [deviceInformations, setDeviceInformations] = useState<IDeviceInformation>(defaultDeviceInfomations)
  const [appState, setAppState] = useReducer(appReducer, appInitState)
  const location = useLocation()
  const history = useHistory()

  // useEffect(() => {
  //   //GPSState.addListener(handleUpdateGpsState)

  //   return () => {
  //     GPSState.removeListener()
  //   }
  // }, [])

  useEffect(() => {
    let intervall: NullableTimeout = null
    if (location.pathname === '/Scanning') {
      bleManager.startScan(null, acceptDevice, handleNewDevice)
      intervall = setInterval(() => {
        dispatchDevice({
          type: MAP_ACTIONS.UPDATE_ALL,
          update: ({ device, informations }) => {
            return {
              device: device,
              informations: {
                lastSeenDate: informations.lastSeenDate,
                lastSeen: calculateLastSeen(informations.lastSeenDate)
              }
            }
          }
        })
      }, 1000)
    } else {
      bleManager.stopScan()
    }
    return () => {
      if (intervall != null) {
        clearInterval(intervall)
      }
    }
  }, [location])

  useEffect(() => {
    if (appState.selectedDevice !== null) {
      setAppState({ type: APP_ACTIONS.IS_CONNECTING, value: true });
      (async function loadDeviceInformation (): Promise<void> {
        const infos: IDeviceInformation = { ...defaultDeviceInfomations }
        try {
          if (appState.selectedDevice?.device !== undefined) {
            await bleManager.connect(appState.selectedDevice.device, () => history.push('/Scanning'))
          }
          if (bleManager.isConnected()) {
            if (appState.selectedDevice?.device.localName !== null && appState.selectedDevice?.device.localName !== undefined) {
              infos.name = appState.selectedDevice.device.localName
            }
            infos.adveezConfigController = new AdveezConfigController(bleManager)
          }
          setDeviceInformations(infos)
        } catch (error) {
          setAppState({ type: APP_ACTIONS.IS_SHOW_ACTIVITY_INDICATOR, value: false })
          setAppState({ type: APP_ACTIONS.IS_CONNECTING, value: false })
          console.log(error)
        }
      })().then().catch((e) => console.error(e))

      return () => {
        if (bleManager.isConnected()) {
          bleManager.disconnect().then().catch((e) => console.error(e))
        }
      }
    }
  }, [appState.selectedDevice])

  function handleNewDevice (device: IDevice): void {
    const newDevice: IStoredDevice = {
      device: device,
      informations: {
        lastSeenDate: new Date(),
        lastSeen: 0
      },
      rssi: device.rssi
    }

    dispatchDevice({
      type: MAP_ACTIONS.ADD,
      key: device.id,
      value: newDevice
    })
  }

  async function bleDisconnect (): Promise<void> {
    if (appState.isConnected && appState.selectedDevice != null && !appState.isDisconnecting) {
      try {
        setAppState({ type: APP_ACTIONS.IS_DISCONNECTING, value: true })
        await bleManager.disconnect()
      } catch (error) {
        setAppState({ type: APP_ACTIONS.IS_DISCONNECTING, value: false })
        console.error('Pb disconnecting: ', error)
      }
    }
  }

  function handleSelectDevicePress (device: IStoredDevice): void {
    setAppState({ type: APP_ACTIONS.IS_SHOW_ACTIVITY_INDICATOR, value: true })
    setAppState({ type: APP_ACTIONS.UPDATE_SELECTED_DEVICE, value: device })
  }

  const handleUpdateGpsState = (status: number): void => {
    if (status === GPSState.AUTHORIZED_ALWAYS || status === GPSState.AUTHORIZED_WHENINUSE) {
      setAppState({ type: APP_ACTIONS.IS_GPS_ENABLED, value: true })
    } else {
      setAppState({ type: APP_ACTIONS.IS_GPS_ENABLED, value: false })
    }
  }

  function checkGpsState (): void {
    GPSState.getStatus().then(handleUpdateGpsState).catch((e: any) => console.error(e))
  }

  function handleBackpress (): void {
    history.goBack()
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
      checkBleState={() => null}
      checkGpsState={checkGpsState}
      handleSelectDevicePress={handleSelectDevicePress}
      handleBackpress={handleBackpress}
      handleExitDevicePress={() => null}
      onCancelPress={() => null}
      bleDisconnect={bleDisconnect}
    />
  )
}
