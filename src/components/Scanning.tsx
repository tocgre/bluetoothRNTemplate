import React, { useEffect } from 'react'
import { View, StyleSheet, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { FAB as Fab, Text, Surface, Caption, useTheme } from 'react-native-paper'
import { IStoredDevice } from '../App.interfaces'
import Header from './common/Header'
import Labelized from './common/Labelized'
import IconBrand from 'react-native-vector-icons/FontAwesome5'
import { LAST_SEEN_DISAPPEAR_THRESHOLD, LAST_SEEN_CLICKABLE_THRESHOLD, WINDOW_OFFSET } from '../constants'

const { height } = Dimensions.get('window')
const finalHeigth = height - WINDOW_OFFSET

type selectDeviceType = (device: IStoredDevice) => void

interface IScanningProps {
  onCancelPress: () => void
  onSelectDevice: selectDeviceType
  onBackPress: () => void
  scannedDevices: IStoredDevice[]
  isScanning: boolean
  bleDisconnect: () => void
  checkBleState: () => void
  isBleEnabled: boolean
  checkGpsState: () => void
  isGpsEnabled: boolean
  showActivityIndicator: boolean
}

interface IDevicesListProps {
  devices: IStoredDevice[]
  onSelectDevice: selectDeviceType
  isScanning: boolean
  isBleEnabled: boolean
  isGpsEnabled: boolean
}

interface IDeviceProps {
  device: IStoredDevice
  onSelectDevice: selectDeviceType
}

export default function Scanning (props: IScanningProps): JSX.Element {
  const {
    onCancelPress,
    onSelectDevice,
    onBackPress,
    scannedDevices,
    isScanning,
    bleDisconnect,
    checkBleState,
    isBleEnabled,
    checkGpsState,
    isGpsEnabled,
    showActivityIndicator
  } = props
  const { colors } = useTheme()

  useEffect(() => {
    checkBleState()
    checkGpsState()
  }, [])

  function onStopPress (): void {
    onCancelPress()
  }
  /* eslint-disable */
  return (
    <View style={[styles.background, { backgroundColor: colors.background }]}>
      <Header
        title={'SCAN'}
        returnArrow={true}
        onBackPress={onBackPress}
        bleDisconnect={bleDisconnect}
      />
      {showActivityIndicator
        ? <ActivityIndicator
            style={styles.activityIndicator}
            color={colors.primary}
            size='large'
        />
        : <ScrollView>
          <View>
            <DevicesList
              devices={scannedDevices}
              onSelectDevice={onSelectDevice}
              isScanning={isScanning}
              isBleEnabled={isBleEnabled}
              isGpsEnabled={isGpsEnabled}
            />
          </View>
        </ScrollView>}
      <View style={styles.fabContainer}>
        <Fab
          disabled={!isBleEnabled || !isGpsEnabled || showActivityIndicator}
          style={styles.fab}
          label={isScanning ? 'STOP' : 'SCAN'}
          icon={isScanning ? 'stop' : 'play'}
          onPress={onStopPress}
        />
      </View>
    </View>
  ) /* eslint-enable */
}

function DevicesList (props: IDevicesListProps): JSX.Element | null {
  const { devices, onSelectDevice, isScanning, isBleEnabled, isGpsEnabled } = props

  if (isBleEnabled && isGpsEnabled) {
    if (devices.length > 0 && (devices.find(element => element.lastSeen < LAST_SEEN_DISAPPEAR_THRESHOLD) !== undefined)) {
      return (
        <View style={styles.tagsContainer}>
          {devices.map((storedDevice, index) => {
            return (
              <Device
                key={index}
                device={storedDevice}
                onSelectDevice={onSelectDevice}
              />
            )
          })}
        </View>
      )
    } else {
      return (
        <View style={styles.viewNoDevices}>
          <IconBrand name='bluetooth-b' size={60} color='#adadad' />
          <Text style={styles.noDevices}>{isScanning ? 'No devices detected ...' : 'Scan stopped'}</Text>
        </View>
      )
    }
  } else {
    if (!isBleEnabled) {
      return (
        <View style={styles.viewNoDevices}>
          <IconBrand name='bluetooth-b' size={60} color='#adadad' />
          <Text style={styles.noDevices}>'Please enable bluetooth'</Text>
        </View>
      )
    } else if (!isGpsEnabled) {
      return (
        <View style={styles.viewNoDevices}>
          <IconBrand name='map-marker-alt' size={60} color='#adadad' />
          <Text style={styles.noDevices}>'Please enable GPS</Text>
        </View>
      )
    } else {
      return null
    }
  }
}

function Device (props: IDeviceProps): JSX.Element | null {
  const { device, onSelectDevice } = props
  const block = (
    <Surface style={(device.lastSeen > LAST_SEEN_CLICKABLE_THRESHOLD) ? styles.notClickableSurface : styles.surface}>
      <View style={styles.row}>
        <Text>{device.deviceName}</Text>
        <Labelized caption='Last seen:'>
          <Text
            style={styles.labelizedText}
          >{`${device.lastSeen} s`}
          </Text>
        </Labelized>
      </View>
      <View style={styles.row}>
        <Caption>{device.id}</Caption>
        <Labelized caption='Rssi:'>
          <Text style={styles.labelizedText}>{`${device.rssi} db`}</Text>
        </Labelized>
      </View>
    </Surface>
  )
  if (device.lastSeen <= LAST_SEEN_CLICKABLE_THRESHOLD) {
    return (
      <TouchableOpacity
        style={styles.surfaceContainer}
        onPress={
          device.lastSeen <= 5 ? () => onSelectDevice(device) : () => { }
        }
      >
        {block}
      </TouchableOpacity>
    )
  } else if (device.lastSeen <= LAST_SEEN_DISAPPEAR_THRESHOLD) {
    return (
      <View style={styles.surfaceContainer}>
        {block}
      </View>
    )
  } else {
    return null
  }
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    height: finalHeigth
  },
  tagsContainer: {
    flex: 1,
    alignItems: 'center'
  },
  surfaceContainer: {
    width: '80%'
  },
  surface: {
    margin: 8,
    padding: 8,
    width: '100%',
    elevation: 4
  },
  notClickableSurface: {
    margin: 8,
    padding: 8,
    width: '100%',
    elevation: 4,
    backgroundColor: '#e6e6e6'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  fabContainer: {
    position: 'absolute',
    right: 0,
    left: 0,
    bottom: 10,
    flex: 1,
    alignItems: 'center'
  },
  fab: {
    width: 160
  },
  labelizedText: {
    marginLeft: 3
  },
  viewNoDevices: {
    marginTop: 40,
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center'
  },
  noDevices: {
    marginTop: 5,
    color: '#adadad'
  },
  activityIndicator: {
    marginTop: 50
  }
})
