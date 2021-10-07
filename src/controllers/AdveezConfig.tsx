import BleManager, { BleService } from '../BleManager'
import { Buffer } from 'buffer'

import { ADVEEZ_CONFIG_SERVICE, POWER_TYPES } from '../constants'
import { ICharacteristic, UUID } from '../BleManagerPlx.interfaces'

enum DATA_TYPES {
  STRING,
  UINT8,
  UINT16BE,
  HEXASTRING,
}

type DataType =
| DATA_TYPES.STRING
| DATA_TYPES.UINT8
| DATA_TYPES.UINT16BE
| DATA_TYPES.HEXASTRING

export default class AdveezConfigController {
  private bleService!: null | undefined | BleService

  constructor (bleManager: BleManager) {
    bleManager.onConnection(() => {
      this.bleService = bleManager.getService(ADVEEZ_CONFIG_SERVICE.UUID)
    })
    this.bleService = bleManager.getService(ADVEEZ_CONFIG_SERVICE.UUID)
  }

  isServiceExists (): boolean {
    return !(this.bleService == null)
  }

  async readPower (): Promise<number | null> {
    const result = await this.read(
      ADVEEZ_CONFIG_SERVICE.CHARACTERISTICS.POWER,
      DATA_TYPES.UINT8
    )
    return typeof result === 'number' && result >= 0 && result <= 8
      ? result
      : null
  }

  async writePower (type: number): Promise<ICharacteristic | undefined> {
    const value = type >= 0 && type <= 8 ? type : 0

    return await this.write(
      ADVEEZ_CONFIG_SERVICE.CHARACTERISTICS.POWER,
      value,
      DATA_TYPES.UINT8
    )
  }

  async readName (): Promise<string | null> {
    const result = await this.read(
      ADVEEZ_CONFIG_SERVICE.CHARACTERISTICS.NAME,
      DATA_TYPES.STRING
    )
    return typeof result === 'string' ? result : null
  }

  async writeName (value: string): Promise<ICharacteristic | undefined> {
    return await this.write(
      ADVEEZ_CONFIG_SERVICE.CHARACTERISTICS.NAME,
      value,
      DATA_TYPES.STRING
    )
  }

  async readRelay1 (): Promise<number | null> {
    const result = await this.read(
      ADVEEZ_CONFIG_SERVICE.CHARACTERISTICS.RELAY1,
      DATA_TYPES.UINT16BE
    )
    return typeof result === 'number' ? result : null
  }

  async writeRelay1 (value: number): Promise<ICharacteristic | undefined> {
    return await this.write(
      ADVEEZ_CONFIG_SERVICE.CHARACTERISTICS.RELAY1,
      value,
      DATA_TYPES.UINT16BE
    )
  }

  async readRelay2 (): Promise<number | null> {
    const result = await this.read(
      ADVEEZ_CONFIG_SERVICE.CHARACTERISTICS.RELAY2,
      DATA_TYPES.UINT16BE
    )
    return typeof result === 'number' ? result : null
  }

  async writeRelay2 (value: number): Promise<ICharacteristic | undefined> {
    return await this.write(
      ADVEEZ_CONFIG_SERVICE.CHARACTERISTICS.RELAY2,
      value,
      DATA_TYPES.UINT16BE
    )
  }

  async readDevEui (): Promise<string | null> {
    const result = await this.read(
      ADVEEZ_CONFIG_SERVICE.CHARACTERISTICS.DEVEUI,
      DATA_TYPES.HEXASTRING
    )
    return typeof result === 'string' ? result : null
  }

  private async read (characteristic: UUID, datatype: DataType): Promise<string | number | null> {
    let value = null
    if (this.bleService != null) {
      const buffer = await this.bleService.readCharacteristic(characteristic)
      switch (datatype) {
        case DATA_TYPES.STRING:
          value = buffer.toString()
          break
        case DATA_TYPES.UINT8:
          value = buffer.readUInt8(0)
          break
        case DATA_TYPES.UINT16BE:
          value = buffer.readUInt16BE(0)
          break
        case DATA_TYPES.HEXASTRING:
          value = buffer.toString('hex')
          break
      }
    } else {
      console.log('ERROR: Service does not exist')
    }
    return value
  }

  private async write (characteristic: UUID, value: any, datatype: DataType): Promise<ICharacteristic | undefined> {
    if (this.bleService != null) {
      let buffer = null
      switch (datatype) {
        case DATA_TYPES.STRING:
          buffer = Buffer.from(value)
          break
        case DATA_TYPES.UINT8:
          buffer = Buffer.alloc(1)
          buffer.writeUInt8(value)
          break
        case DATA_TYPES.UINT16BE:
          buffer = Buffer.alloc(2)
          buffer.writeUInt16BE(value)
          break
      }
      if (buffer != null) {
        return await this.bleService.writeCharacteristic(
          characteristic,
          buffer
        )
      }
    } else {
      console.log('ERROR: Service does not exist')
    }
  }
}
