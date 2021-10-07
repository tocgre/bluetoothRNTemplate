declare module 'react-native-gps-state' {

type ListenerFunc = (status: number) => void
interface GPSStateType {
  NOT_DETERMINED: number
  RESTRICTED: number
  DENIED: number
  AUTHORIZED: number
  AUTHORIZED_ALWAYS: number
  AUTHORIZED_WHENINUSE: number
  openAppDetails: () => void
  openLocationSettings: () => void
  isMarshmallowOrAbove: () => boolean
  isAuthorized: () => boolean
  isDenied: () => boolean
  isNotDetermined: () => boolean
  addListener: (callback: ListenerFunc) => void
  removeListener: () => void
  getStatus: () => Promise<number>
  requestAuthorization: (authType: number) => void
}

const GPSState: GPSStateType
export = GPSState
}
