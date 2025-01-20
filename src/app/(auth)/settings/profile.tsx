import { ActivityIndicator, Alert, type AlertButton, Platform } from 'react-native'
import {
  ScrollView,
  Separator,
  Text,
  View,
  XStack,
  YStack,
  Button,
  Avatar,
} from 'tamagui'
import { useLayoutEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, Link, useNavigation } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { updateAvatar, deleteAvatar } from 'src/lib/api'
import * as ImagePicker from 'expo-image-picker'
import mime from 'mime'
import { useQuerySelfProfile } from 'src/state/AuthProvider'
export default function Page() {
  const navigation = useNavigation()
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Edit Profile', headerBackTitle: 'Back' })
  }, [navigation])

  const queryClient = useQueryClient()
  const { user, isFetching } = useQuerySelfProfile()

  const updateProfilePhoto = () => {
    const isDefault = user?.avatar.includes('default.')
    const buttons: AlertButton[] = isDefault
      ? [
          {
            text: 'Add',
            onPress: () => pickImage(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      : [
          {
            text: 'Change Photo',
            onPress: () => pickImage(),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => _deleteProfilePhoto(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
    Alert.alert(
      isDefault ? 'Add Profile Photo' : 'Change Profile Photo',
      isDefault
        ? 'Select a photo from your camera roll for your profile photo.'
        : 'Upload a new photo or delete your existing photo.\n\nIt may take a few minutes to update.',
      buttons
    )
  }

  const _deleteProfilePhoto = async () => {
    await deleteAvatar().then((res) => {
      queryClient.invalidateQueries({ queryKey: ['profileById'] })
    })
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      exif: false,
      selectionLimit: 1,
      quality: 0.5,
    })

    if (!result.canceled) {
      let image = result.assets[0]
      const name = image.uri.split('/').slice(-1)[0]
      const payload = {
        uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
        type: mime.getType(image.uri),
        name: name,
      }
      await updateAvatar({
        avatar: payload,
      }).then((res) => {
        queryClient.invalidateQueries({ queryKey: ['profileById'] })
      })
    }
  }

  type LinkFieldProps = {
    label: string
    value: string
    path: string
    border: boolean
  }
  const LinkField = ({ label, value, path, border }: LinkFieldProps) => (
    <XStack px="$3" py="$3" alignItems="flex-start" justifyContent="center">
      <Text w="30%" fontSize="$6" color="$gray9">
        {label}
      </Text>
      {path ? (
        <View
          w="70%"
          flexGrow={1}
          overflow="hidden"
          flexWrap="wrap"
          pb="$3"
          borderBottomWidth={border ? 1 : 0}
          borderBottomColor="$gray4"
        >
          <Link href={path} asChild>
            <View
              w="100%"
              alignSelf="stretch"
              pressStyle={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
            >
              <Text fontSize="$6" flexWrap="wrap">
                {value}
              </Text>
            </View>
          </Link>
        </View>
      ) : (
        <View
          w="70%"
          flexGrow={1}
          overflow="hidden"
          flexWrap="wrap"
          pb="$3"
          borderBottomWidth={border ? 1 : 0}
          borderBottomColor="$gray4"
        >
          <Text fontSize="$6" flexWrap="wrap">
            {value}
          </Text>
        </View>
      )}
    </XStack>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerBackTitle: 'Back',
        }}
      />
      {isFetching && <ActivityIndicator color={'#000'} />}
      <ScrollView flexShrink={1}>
        <YStack pt="$3" gap="$2" justifyContent="center" alignItems="center">
          <Avatar circular size="$10" borderWidth={1} borderColor="$gray6">
            <Avatar.Image accessibilityLabel={user?.username} src={user?.avatar} />
            <Avatar.Fallback backgroundColor="$gray6" />
          </Avatar>

          <Button
            p="0"
            chromeless
            color="$blue9"
            fontWeight="bold"
            onPress={() => updateProfilePhoto()}
          >
            {user?.avatar.endsWith('default.jpg')
              ? 'Upload profile photo'
              : 'Update or delete profile photo'}
          </Button>
        </YStack>

        <Separator />

        <YStack gap="$0" pt="$2">
          <LinkField
            label="Name"
            value={user?.display_name}
            path="/settings/updateName"
            border={true}
          />
          <LinkField label="Username" value={user?.username} path="" border={true} />
          {/* <LinkField
            label="Pronouns"
            value={user?.pronouns.join(', ')}
            path=""
            border={true}
          /> */}
          <LinkField
            label="Bio"
            value={user?.note_text ? user?.note_text.slice(0, 30) : null}
            path="settings/bio"
            border={true}
          />

          <LinkField
            label="Website"
            value={user?.website}
            path="settings/updateWebsite"
            border={false}
          />
        </YStack>

        <Separator />
      </ScrollView>
    </SafeAreaView>
  )
}
