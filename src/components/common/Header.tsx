import React from 'react'
import { Appbar } from 'react-native-paper'

export interface IHeaderProps {
  title: string
  returnArrow: boolean
  onBackPress: () => void
  bleDisconnect: () => void
}

export default function Header (props: IHeaderProps): JSX.Element {
  const { title, returnArrow, onBackPress } = props

  return (
    <Appbar.Header statusBarHeight={0}>
      {returnArrow ? <Appbar.BackAction onPress={onBackPress} /> : null}
      <Appbar.Content title={title} />
    </Appbar.Header>
  )
}
