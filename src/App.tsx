/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react'
import type { ReactNode } from 'react'
import {
  DefaultTheme,
  Provider as PaperProvider
} from 'react-native-paper'

import { NativeRouter } from 'react-router-native'
import AppController from './AppController'

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0078b5',
    background: '#f6f6f6'
  },
  dark: false
}

const App: () => ReactNode = () => {
  return (
    <PaperProvider theme={theme}>
      <NativeRouter>
        <AppController />
      </NativeRouter>
    </PaperProvider>
  )
}

export default App
