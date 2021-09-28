import { Map } from 'immutable'
import { IStoredDevice } from '../App.interfaces'
export enum MAP_ACTIONS {
  ADD,
  REMOVE,
  UPDATE_ALL,
  RESET,
}

export type actionType =
  | MAP_ACTIONS.ADD
  | MAP_ACTIONS.REMOVE
  | MAP_ACTIONS.UPDATE_ALL
  | MAP_ACTIONS.RESET

export interface IActions {
  type: actionType
  key?: any
  value?: any
  update?: (elem: any) => void
}

export function mapReducer (state: Map<number, IStoredDevice>, action: IActions): Map<number, IStoredDevice> {
  function compare (a: IStoredDevice, b: IStoredDevice): number {
    if (a.rssi < b.rssi) {
      return 1
    }
    if (a.rssi > b.rssi) {
      return -1
    } else {
      return 0
    }
  }

  switch (action.type) {
    case MAP_ACTIONS.ADD:
      state = state.set(action.key, action.value)
      state = state.sort(compare)
      break
    case MAP_ACTIONS.REMOVE:
      state = state.delete(action.key)
      break
    case MAP_ACTIONS.UPDATE_ALL:
      state = state.map((elem: any) => {
        return (action.update != null) ? action.update(elem) : elem
      })
      state = state.sort(compare)
      break
    case MAP_ACTIONS.RESET:
      state = state.clear()
      break
  }
  return state
}
