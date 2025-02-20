import { Feather } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import PushNotificationSettings from 'src/components/notifications/PushNotificationSettings'
import { pushNotificationSupported } from 'src/lib/api'
import { useUserCache } from 'src/state/AuthProvider'
import { openBrowserAsync } from 'src/utils'
import { Button, Text, View, YStack } from 'tamagui'

export default function Page() {
  const userCache = useUserCache()

  const {
    data: checkData,
    status,
    error,
  } = useQuery({
    queryKey: ['pushNotificationCheck'],
    queryFn: pushNotificationSupported,
  })
  if (status === 'pending') {
    return (
      <View>
        <ActivityIndicator />
      </View>
    )
  }

  if (status === 'error') {
    return (
      <View>
        <Text>{error}</Text>
      </View>
    )
  }

  const showMoreInfo = () => {
    openBrowserAsync('https://docs.pixelfed.org/running-pixelfed/push-notifications.html')
  }

  const RenderUnsupportedPanel = () => (
    <View flexGrow={1} justifyContent="center" alignItems="center">
      <View p="$7" flexShrink={1}>
        <YStack gap="$3" justifyContent="center" alignItems="center" flexGrow={1}>
          <Feather name="alert-triangle" size={90} />
          <Text fontSize="$8" fontWeight="bold">
            Feature Unavailable
          </Text>
          <Text fontSize="$5">Please contact your instance admin for assistance.</Text>
        </YStack>
      </View>
      {userCache && userCache.is_admin ? (
        <View w={'100%'} p="$5" mb="$5" flexGrow={1}>
          <Button bg="$blue9" size="$5" color="white" onPress={() => showMoreInfo()}>
            How to enable Push Notifications
          </Button>
        </View>
      ) : null}
    </View>
  )

  const RenderSettings = () => {
    if (!checkData || !checkData['active']) {
      return <RenderUnsupportedPanel />
    }
    return <PushNotificationSettings />
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Push Notifications',
          headerBackTitle: 'Back',
        }}
      />
      <RenderSettings />
    </SafeAreaView>
  )
}
