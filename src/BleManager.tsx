import { BleManager } from 'react-native-ble-plx'
import { Buffer } from 'buffer'
import { EventEmitter } from 'events'
import { AUTHENTICATION_PASSWORD, FAMA_SCREEN_SERVICE, IS_AUTHENTICATION_ACTIVE } from './constants'

import {
  IBleManager,
  IDevice,
  IService,
  UUID,
  State,
  IScanOptions,
  SCAN_MODE,
  ICharacteristic,
  IBleError
} from './BleManagerPlx.interfaces'

const scanOption: IScanOptions = {
  scanMode: SCAN_MODE.Balanced
}

export default class BleMgr {
  private readonly manager!: IBleManager
  private connectedDevice!: null | IDevice
  private isReady!: boolean
  private readonly services!: Map<UUID, BleService>
  private status!: null | State
  private readonly emitter!: EventEmitter
  private shouldIgnoreDisconnection!: boolean

  constructor () {
    try {
      this.manager = new BleManager()
      this.connectedDevice = null
      this.isReady = false
      this.services = new Map()
      this.status = null
      this.emitter = new EventEmitter()
      this.shouldIgnoreDisconnection = false

      const subscription = this.manager.onStateChange(async (state) => {
        this.status = state
        if (state === 'PoweredOn') {
          subscription.remove()
          this.isReady = true
        }
      }, true)
    } catch (error) {
      console.log(error)
    }
  }

  setIgnoreDisconnection (status: boolean) {
    this.shouldIgnoreDisconnection = status
  }

  onConnection (callback: () => void) {
    this.emitter.addListener('connection', callback)
  }

  isConnected () {
    return this.connectedDevice !== null
  }

  getBleStatus () {
    return this.status
  }

  getConnectedDevice () {
    return this.connectedDevice
  }

  getBleAddress () {
    return this.connectedDevice?.id
  }

  getService (uuid: UUID) {
    return this.services.has(uuid) ? this.services.get(uuid) : null
  }

  async requestMtu (mtu: number) {
    if (this.connectedDevice != null) {
      console.log('Negotiate MTU', this.connectedDevice.mtu)
      this.connectedDevice = await this.connectedDevice.requestMTU(mtu)
      console.log('New MTU applied:', this.connectedDevice.mtu)
      return mtu === this.connectedDevice.mtu
    } else {
      return false
    }
  }

  async scanAndConnect (bleAddress: String, onDisconnect: () => void) {
    return await new Promise(async (resolve, reject) => {
      try {
        const acceptDevice = (device: IDevice) => {
          return device?.id === bleAddress
        }
        if (this.isConnected()) {
          await this.disconnect()
        }
        this.startScan(null, acceptDevice, async (device) => {
          await this.stopScan()
          await this.connect(device, onDisconnect)
          resolve(this.isConnected())
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  startScan (
    uuidsFilterArray: null | UUID[],
    acceptDevice: (device: IDevice) => boolean,
    notifyNewDevice: (device: IDevice) => void
  ) {
    console.log('Ble Start Scan')
    if (this.isReady) {
      try {
        this.manager.startDeviceScan(
          uuidsFilterArray,
          scanOption,
          (error, device) => {
            if (error != null) {
              console.log(error)
              return
            }
            if ((device != null) && acceptDevice(device)) {
              notifyNewDevice(device)
            }
          }
        )
      } catch (error) {
        console.log(error)
      }
    }
  }

  stopScan () {
    console.log('Ble Stop Scan')
    try {
      this.manager.stopDeviceScan()
    } catch (error) {
      console.log(error)
    }
  }

  async connect (device: IDevice, onDisconnect: () => void) {
    try {
      console.log('Connection...')
      this.connectedDevice = await device.connect()

      const disconnectSubscription = this.manager.onDeviceDisconnected(
        device.id,
        (error) => {
          disconnectSubscription.remove()
          this.connectedDevice = null
          if (!this.shouldIgnoreDisconnection) {
            onDisconnect()
          }
        }
      )

      console.log('Discovering services and characteristics')
      this.connectedDevice = await this.connectedDevice.discoverAllServicesAndCharacteristics()

      const _services = await this.connectedDevice.services()
      _services.forEach(async (discoveredService) => {
        console.log(discoveredService.uuid)
        this.services.set(
          discoveredService.uuid,
          new BleService(discoveredService)
        )
      })

      if (IS_AUTHENTICATION_ACTIVE) {
        const authenticationService = this.getService(FAMA_SCREEN_SERVICE.UUID)
        if (authenticationService !== null) {
          console.log('Write Authentication')
          authenticationService?.writeCharacteristic(FAMA_SCREEN_SERVICE.CHARACTERISTICS.PASSWORD, Buffer.from(AUTHENTICATION_PASSWORD))
        }
      }

      this.emitter.emit('connection')
    } catch (error) {
      console.log(error)
      this.connectedDevice = null
    }
  }

  async disconnect () {
    try {
      if (this.connectedDevice != null) {
        await this.connectedDevice.cancelConnection()
        this.connectedDevice = null
        console.log('Disconnected')
      }
    } catch (error) {
      console.log(error)
    }
  }
}

export class BleService {
  service: IService

  constructor (service: IService) {
    this.service = service
  }

  async hasCharacteristics (characteristicUuid: UUID) {
    const characteristics = await this.service.characteristics()
    return characteristics.find((characteristic) => {
      return characteristicUuid === characteristic.uuid
    }) !== undefined
  }

  async readCharacteristic (characteristic: UUID) {
    const { value } = await this.service.readCharacteristic(characteristic)
    return Buffer.from(value, 'base64')
  }

  async writeCharacteristic (
    characteristic: UUID,
    buffer: Buffer,
    needResponse: boolean = true
  ) {
    if (needResponse) {
      return await this.service.writeCharacteristicWithResponse(
        characteristic,
        buffer.toString('base64')
      )
    } else {
      return await this.service.writeCharacteristicWithoutResponse(
        characteristic,
        buffer.toString('base64')
      )
    }
  }

  async monitorCharacteristic (
    characteristic: UUID,
    notifyUpdate: (buffer: null | Buffer) => void
  ) {
    return this.service.monitorCharacteristic(
      characteristic,
      (error?: IBleError, characteristic?: ICharacteristic) => {
        if (error != null) {
          console.log(error)
        } else {
          if (characteristic != null) {
            const buffer = Buffer.from(characteristic.value, 'base64')
            notifyUpdate(buffer)
          } else {
            notifyUpdate(null)
          }
        }
      }
    )
  }
}
