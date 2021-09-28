import React from 'react'
import { StyleSheet } from 'react-native'
import {
  Portal,
  Modal,
  Text,
  useTheme
} from 'react-native-paper'

interface IModalProps {
  visible: boolean
  titleText: string
  text: string
}

export default function MyModal (props: IModalProps): JSX.Element {
  const { visible, titleText, text } = props
  const { colors } = useTheme()

  const blueTextStyle = {
    color: colors.primary
  }

  return (
    <Portal>
      <Modal visible={visible} dismissable={false} contentContainerStyle={styles.pedalModal}>
        <Text style={[styles.modalTitle, blueTextStyle]}>{titleText}</Text>
        <Text style={styles.modalText}>{text}</Text>
      </Modal>
    </Portal>
  )
}

const styles = StyleSheet.create({
  pedalModal: {
    backgroundColor: 'white',
    height: '40%',
    width: '80%',
    alignSelf: 'center',
    borderRadius: 10
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: 'bold',
    fontSize: 25
  },
  modalText: {
    textAlign: 'center',
    fontSize: 17
  }
})
