import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Image, Dimensions, Platform, PermissionsAndroid } from 'react-native'
import { FAB as Fab, Title, Subheading, Caption, useTheme } from 'react-native-paper'
import { useHistory } from 'react-router-native'
import MyModal from './common/Modal'

import { IInfos } from '../App.interfaces'

const { height } = Dimensions.get('window')
const finalHeigth = height - 25

interface WelcomeProps {
  infos: IInfos
}

export default function Welcome (props: WelcomeProps): JSX.Element {
  const { infos } = props
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false)
  const { colors } = useTheme()
  const history = useHistory()

  useEffect(() => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
        if (!result) {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
            if (result !== 'granted') {
              setIsLocationModalVisible(true)
            }
          }).catch((e) => console.error(e))
        }
      }).catch((e) => console.error(e))
    }
  }, [])

  function renderButton (): JSX.Element {
    return (
      <View>
        <Fab
          style={styles.fab}
          label='START SCAN'
          icon='magnify'
          onPress={() => history.push('/Scanning')}
        />
      </View>
    )
  }

  return (
    <View style={[styles.background, { backgroundColor: colors.background }]}>
      <MyModal
        visible={isLocationModalVisible}
        titleText='Location disabled!'
        text={'Please authorize location\n for the app\n and enable Position\n\n Then restart app'}
      />
      <View style={styles.firstRow}>
        <Image
          style={styles.logo}
          source={require('../../assets/images/turtle-app.png')}
        />
        <View style={styles.titleContainer}>
          <Title style={styles.title}>App Name</Title>
        </View>
        <Subheading style={styles.subtitle}>
          Your subtitle here !
        </Subheading>
      </View>
      <View style={styles.secondRow}>
        {renderButton()}
        <View style={styles.footer}>
          <View>
            <Caption>Version: {infos.version}</Caption>
          </View>
          <View style={styles.poweredContainer}>
            <Caption>{'powered by '}</Caption>
            <Image
              style={styles.adveezLogo}
              source={require('../../assets/images/adveez.png')}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    height: finalHeigth
  },
  firstRow: {
    height: finalHeigth / 2,
    alignItems: 'center'
  },
  secondRow: {
    height: finalHeigth / 2,
    justifyContent: 'space-between'
  },
  titleContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  title: {
    marginLeft: 20,
    marginBottom: 10,
    fontSize: 40,
    lineHeight: 40
  },
  subtitle: {
    textAlign: 'center',
    width: '75%'
  },
  fab: {
    marginTop: 30,
    width: 160,
    alignSelf: 'center'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15
  },
  poweredContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  logo: {
    marginTop: 100,
    height: 90,
    width: 107
  },
  adveezLogo: {
    height: 30,
    width: 120
  }
})
