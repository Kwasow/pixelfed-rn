import type { PropsWithChildren } from 'hoist-non-react-statics/node_modules/@types/react'
import React, { useState, useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import type {
  NativeSyntheticEvent,
  TextLayoutEventData,
  LayoutChangeEvent,
} from 'react-native'
import type { ReadMoreProps } from './ReadMore'

const ReadMoreAndroid = ({
  numberOfLines,
  textStyle,
  children,
  renderTruncatedFooter,
  renderRevealedFooter,
}: PropsWithChildren<ReadMoreProps>) => {
  const [textHeight, setTextHeight] = useState(0)
  const [measuredHeight, setMeasuredHeight] = useState(0)
  const [showAllText, setShowAllText] = useState(false)

  const onTextLayout = useCallback(
    (e: NativeSyntheticEvent<TextLayoutEventData>) => {
      if (textHeight !== 0) return

      setTextHeight(
        e.nativeEvent.lines.length > numberOfLines
          ? e.nativeEvent.lines
              .slice(0, numberOfLines)
              .reduce((acc, line) => acc + line.height, 0)
          : 0
      )
    },
    [textHeight, numberOfLines]
  )

  const onMeasuredTextLayout = useCallback((e: LayoutChangeEvent) => {
    setMeasuredHeight(e.nativeEvent.layout.height)
  }, [])

  const toggleShowAllText = () => {
    setShowAllText(!showAllText)
  }

  const shouldShowReadMore = measuredHeight > textHeight && textHeight > 0

  const maybeRenderReadMore = () => {
    if (!shouldShowReadMore) return null

    if (!showAllText) {
      if (renderTruncatedFooter) {
        return renderTruncatedFooter(toggleShowAllText)
      }
      return (
        <Text style={styles.button} onPress={toggleShowAllText}>
          Read more
        </Text>
      )
    }

    if (renderRevealedFooter) {
      return renderRevealedFooter(toggleShowAllText)
    }
    return (
      <Text style={styles.button} onPress={toggleShowAllText}>
        Hide
      </Text>
    )
  }

  return (
    <View>
      <>
        <Text
          numberOfLines={showAllText ? undefined : numberOfLines}
          style={textStyle}
          onTextLayout={onTextLayout}
          onLayout={onMeasuredTextLayout}
        >
          {children}
        </Text>
        {maybeRenderReadMore()}
      </>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    color: '#888',
    marginVertical: 5,
  },
})

export default ReadMoreAndroid
