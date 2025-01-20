import { ActivityIndicator } from 'react-native'
import { ScrollView, Text, View, XStack, Button, Input } from 'tamagui'
import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack } from 'expo-router'
import { useMutation } from '@tanstack/react-query'
import { updateCredentials } from 'src/lib/api'
import { router } from 'expo-router'
import { useQuerySelfProfile } from 'src/state/AuthProvider'

export default function Page() {
  const { user } = useQuerySelfProfile()
  const [website, setWebsite] = useState(user?.website?.replace('https://', ''))
  const [isSubmitting, setSubmitting] = useState(false)

  const mutation = useMutation({
    mutationFn: async (data: { website: string }) => {
      setSubmitting(true)
      return await updateCredentials(data)
    },
    onSuccess: () => {
      router.replace('/profile')
    },
  })

  const onSubmit = () => {
    if (typeof website === 'undefined') {
      return
    }
    mutation.mutate({ website: website })
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Website',
          headerBackTitle: 'Back',
          headerRight: () =>
            isSubmitting ? (
              <ActivityIndicator />
            ) : (
              <Button
                fontSize="$7"
                p="0"
                fontWeight={'600'}
                color="$blue9"
                chromeless
                onPress={() => onSubmit()}
              >
                Save
              </Button>
            ),
        }}
      />
      <ScrollView flexGrow={1}>
        <XStack pt="$3" px="$4" justifyContent="space-between">
          <Text color="$gray8">Website</Text>

          <View alignItems="flex-end" justifyContent="flex-end">
            <Text color="$gray9">{website?.length || 0}/120</Text>
          </View>
        </XStack>
        <Input
          value={website}
          borderLeftWidth={0}
          borderRightWidth={0}
          borderTopWidth={0}
          bg="white"
          maxLength={120}
          placeholder="example.com"
          p="0"
          m="0"
          size="$6"
          onChangeText={setWebsite}
        />

        <Text pl="$3" pr="$10" py="$4" color="$gray9">
          Add an optional website to your profile that is publicly visible
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
