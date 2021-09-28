import React from 'react'
import { Route, Switch } from 'react-router-native'
import Welcome from './Welcome'
import Scanning from '../components/Scanning'
import { IRouterProps } from './Router.interface'

export default function Router (props: IRouterProps): JSX.Element {
  return (
    <Switch>
      <Route exact path='/'>
        <Welcome
          infos={props._appInfos}
        />
      </Route>
      <Route path='/Scanning'>
        <Scanning
          scannedDevices={props.scannedDevices}
          onSelectDevice={props.handleSelectDevicePress}
          onCancelPress={props.onCancelPress}
          isScanning={props.isScanning}
          bleDisconnect={props.bleDisconnect}
          checkBleState={props.checkBleState}
          isBleEnabled={props.isBleEnabled}
          checkGpsState={props.checkGpsState}
          isGpsEnabled={props.isGpsEnabled}
          showActivityIndicator={props.showActivityIndicator}
        />
      </Route>
    </Switch>
  )
}
