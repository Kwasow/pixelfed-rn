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
  const [name, setName] = useState(user?.display_name)
  const [isSubmitting, setSubmitting] = useState(false)

  const mutation = useMutation({
    mutationFn: async (data: { display_name: string }) => {
      setSubmitting(true)
      return await updateCredentials(data)
    },
    onSuccess: () => {
      router.replace('/settings/profile')
    },
  })

  const onSubmit = () => {
    if (typeof name === 'undefined') {
      return
    }
    mutation.mutate({ display_name: name })
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Name',
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
          <Text color="$gray8">Name</Text>

          <View alignItems="flex-end" justifyContent="flex-end">
            <Text color="$gray9">{name?.length}/30</Text>
          </View>
        </XStack>
        <Input
          value={name}
          borderLeftWidth={0}
          borderRightWidth={0}
          borderTopWidth={0}
          bg="white"
          maxLength={30}
          placeholder="Add your full name, or nickname"
          p="0"
          m="0"
          size="$6"
          onChangeText={setName}
        />

        <Text pl="$3" pr="$10" py="$4" color="$gray9">
          Help people discover your account by using the name you're known by: either your
          full name, nickname or business name.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
