import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text, Caption, useTheme } from 'react-native-paper'

interface ILabelizedProps {
  children: React.ReactNode
  caption: string
  styles?: {
    caption?: object
    container?: object
  }
  style?: object
  errorText?: string
}

export default function Labelized (props: ILabelizedProps): JSX.Element {
  const { caption, styles = {}, errorText, children, style = {} } = props
  const { colors } = useTheme()
  const { caption: captionStyle = {}, container: containerStyle = {} } = styles

  const hasError = errorText !== undefined

  function renderErrorText (): JSX.Element | null {
    if (hasError) {
      return (
        <View>
          <Text
            style={{ fontSize: 12, color: colors.error, textAlign: 'center' }}
          >
            {errorText}
          </Text>
        </View>
      )
    } else {
      return null
    }
  }

  return (
    <View style={style}>
      <View style={{ ...defaultStyles.container, ...containerStyle }}>
        <Caption style={{ ...defaultStyles.caption, ...captionStyle }}>
          {caption}
        </Caption>
        <View style={defaultStyles.childrenContainer}>{children}</View>
      </View>
      {renderErrorText()}
    </View>
  )
}

const defaultStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  caption: {},
  childrenContainer: {
    paddingLeft: 10,
    paddingRight: 10
  }
})
