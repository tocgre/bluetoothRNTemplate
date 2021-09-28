import React from 'react'
import { Appbar } from 'react-native-paper'
import { useHistory } from 'react-router-native'

export interface IHeaderProps {
  title: string
  returnArrow: boolean
  repair: boolean
  onBackPress: () => void
  bleDisconnect: () => void
}

export default function Header (props: IHeaderProps): JSX.Element {
  const { title, returnArrow, repair, onBackPress } = props
  const history = useHistory()

  async function handleLogoutPress (): Promise<void> {
    history.push('/')
  }

  return (
    <Appbar.Header statusBarHeight={0}>
      {returnArrow ? <Appbar.BackAction onPress={onBackPress} /> : null}
      <Appbar.Content title={title} />
      {repair ? <Appbar.Action icon='wrench' onPress={() => history.push('/RepairRequest')} /> : null}
      <Appbar.Action icon='logout' onPress={handleLogoutPress} />
    </Appbar.Header>
  )
}
