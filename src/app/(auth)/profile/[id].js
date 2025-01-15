import {
  FlatList,
  Dimensions,
  ActivityIndicator,
  Alert,
  Share,
  Platform,
} from 'react-native'
import { Button, Image, Separator, Text, View, YStack, ZStack } from 'tamagui'
import ProfileHeader from '@components/profile/ProfileHeader'
import { Feather } from '@expo/vector-icons'
import { Storage } from 'src/state/cache'
import { queryApi } from 'src/requests'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams, Link, router, useNavigation } from 'expo-router'
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import FastImage from 'react-native-fast-image'
import {
  getAccountById,
  getAccountStatusesById,
  getAccountRelationship,
  getAccountByUsername,
  blockProfileById,
  unblockProfileById,
  muteProfileById,
  unmuteProfileById,
  followAccountById,
  unfollowAccountById,
  getMutualFollowing,
} from 'src/lib/api'
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetTextInput,
  BottomSheetScrollView,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet'
import Clipboard from '@react-native-clipboard/clipboard'
import { useToast, useToastController } from '@tamagui/toast'
import { Blurhash } from 'react-native-blurhash'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function ProfileScreen() {
  const navigation = useNavigation()
  const { id, byUsername } = useLocalSearchParams()
  const selfUser = JSON.parse(Storage.getString('user.profile'))
  const queryClient = useQueryClient()
  const bottomSheetModalRef = useRef(null)
  const snapPoints = useMemo(() => ['50%', '55%'], [])
  // const toast = useToastController();
  const toastController = useToastController()

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])
  const handleSheetChanges = useCallback((index) => {}, [])
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
    ),
    []
  )

  const RenderItem = useCallback(({ item }) => {
    if (!item || !item.media_attachments) {
      return <View bg="$gray4"></View>
    }
    const forceSensitive = Storage.getBoolean('ui.forceSensitive') === true
    const med = item.media_attachments[0]
    const murl = med.url
    const isSensitive = item.sensitive
    const hasPreview = med.preview_url && !med.preview_url.endsWith('no-preview.png')

    if (isSensitive && !forceSensitive) {
      const bh =
        item.media_attachments[0]?.blurhash ?? 'U4Rfzst8?bt7ogayj[j[~pfQ9Goe%Mj[WBay'

      if (!bh || bh === 'U4Rfzst8?bt7ogayj[j[~pfQ9Goe%Mj[WBay') {
        return (
          <Link href={`/post/${item.id}`} asChild>
            <View flexShrink={1} style={{ borderWidth: 1, borderColor: 'white' }}>
              <ZStack w={SCREEN_WIDTH / 3 - 2} h={SCREEN_WIDTH / 3 - 2}>
                <View
                  style={{
                    flex: 1,
                    width: SCREEN_WIDTH / 3 - 2,
                    height: SCREEN_WIDTH / 3 - 2,
                    backgroundColor: 'black',
                  }}
                />
                <View p="$2" justifyContent="flex-end" alignItems="flex-end">
                  <Feather name="eye-off" size={20} color="white" />
                </View>
              </ZStack>
            </View>
          </Link>
        )
      }
      return (
        <Link href={`/post/${item.id}`} asChild>
          <View flexShrink={1} style={{ borderWidth: 1, borderColor: 'white' }}>
            <ZStack w={SCREEN_WIDTH / 3 - 2} h={SCREEN_WIDTH / 3 - 2}>
              <Blurhash
                blurhash={bh}
                style={{
                  flex: 1,
                  width: SCREEN_WIDTH / 3 - 2,
                  height: SCREEN_WIDTH / 3 - 2,
                }}
              />
              <View p="$2" justifyContent="flex-end" alignItems="flex-end">
                <Feather name="eye-off" size={20} color="white" />
              </View>
            </ZStack>
          </View>
        </Link>
      )
    }

    if (med?.type === 'video') {
      return (
        <Link href={`/post/${item.id}`} asChild>
          <View flexShrink={1} style={{ borderWidth: 1, borderColor: 'white' }}>
            <ZStack w={SCREEN_WIDTH / 3 - 2} h={SCREEN_WIDTH / 3 - 2}>
              {hasPreview && med.preview_url ? (
                <FastImage
                  style={{
                    width: SCREEN_WIDTH / 3 - 2,
                    height: SCREEN_WIDTH / 3 - 2,
                    backgroundColor: '#ddd',
                  }}
                  source={{
                    uri: med.preview_url,
                    priority: FastImage.priority.normal,
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <Blurhash
                  blurhash={med.blurhash}
                  style={{
                    flex: 1,
                    width: SCREEN_WIDTH / 3 - 2,
                    height: SCREEN_WIDTH / 3 - 2,
                  }}
                />
              )}
              <View p="$2" justifyContent="flex-end" alignItems="flex-end">
                <Feather name="video" size={20} color="white" />
              </View>
            </ZStack>
          </View>
        </Link>
      )
    }
    return item && item.media_attachments && item.media_attachments[0].url ? (
      <Link href={`/post/${item.id}`} asChild>
        <View flexShrink={1} style={{ borderWidth: 1, borderColor: 'white' }}>
          {item.sensitive && !forceSensitive ? (
            <ZStack w={SCREEN_WIDTH / 3 - 2} h={SCREEN_WIDTH / 3 - 2}>
              <Blurhash
                blurhash={item.media_attachments[0]?.blurhash}
                style={{
                  flex: 1,
                  width: SCREEN_WIDTH / 3 - 2,
                  height: SCREEN_WIDTH / 3 - 2,
                }}
              />
              <View p="$2" justifyContent="flex-end" alignItems="flex-end">
                <Feather name="eye-off" size={20} color="white" />
              </View>
            </ZStack>
          ) : (
            <>
              <Blurhash
                blurhash={item.media_attachments[0]?.blurhash}
                style={{
                  flex: 1,
                  position: 'absolute',
                  width: SCREEN_WIDTH / 3 - 2,
                  height: SCREEN_WIDTH / 3 - 2,
                }}
              />
              <FastImage
                style={{
                  width: SCREEN_WIDTH / 3 - 2,
                  height: SCREEN_WIDTH / 3 - 2,
                }}
                source={{
                  uri: item.media_attachments[0].url,
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.cover}
              />
            </>
          )}
          {item.pf_type === 'photo:album' ? (
            <View position="absolute" right={5} top={5}>
              <Feather name="columns" color="white" size={20} />
            </View>
          ) : null}

          {item.pf_type === 'video' ? (
            <View position="absolute" right={5} top={5}>
              <Feather name="video" color="white" size={20} />
            </View>
          ) : null}
        </View>
      </Link>
    ) : null
  }, [])

  const EmptyFeed = () => (
    <View flexGrow={1}>
      {!isFetching && !user?.id ? (
        <YStack flexGrow={1} justifyContent="center" alignItems="center" gap="$5">
          <View p="$6" borderWidth={2} borderColor="$gray5" borderRadius={100}>
            <Feather name="alert-triangle" size={40} color="#aaa" />
          </View>
          <Text fontSize="$8">Account not found</Text>
        </YStack>
      ) : !isFetched || isFetching ? (
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$5">
          <ActivityIndicator />
        </YStack>
      ) : (
        <YStack flexGrow={1} justifyContent="center" alignItems="center" gap="$5">
          {user?.locked && !relationship?.following ? (
            <>
              <View p="$6" borderWidth={2} borderColor="black" borderRadius={100}>
                <Feather name="lock" size={40} />
              </View>
              <Text fontSize="$8">This account is private</Text>
            </>
          ) : (
            <>
              <View p="$6" borderWidth={2} borderColor="black" borderRadius={100}>
                <Feather name="camera" size={40} />
              </View>
              <Text fontSize="$8">No Posts Yet</Text>
            </>
          )}
        </YStack>
      )}
    </View>
  )

  const blockMutation = useMutation({
    mutationFn: () => {
      return blockProfileById(userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAccountRelationship'] })
    },
  })

  const unblockMutation = useMutation({
    mutationFn: () => {
      return unblockProfileById(userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAccountRelationship'] })
    },
  })

  const muteMutation = useMutation({
    mutationFn: () => {
      return muteProfileById(userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAccountRelationship'] })
    },
  })

  const unmuteMutation = useMutation({
    mutationFn: () => {
      return unmuteProfileById(userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAccountRelationship'] })
    },
  })

  const followMutation = useMutation({
    mutationFn: () => {
      return followAccountById(userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAccountRelationship'] })
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['getAccountById'] })
        queryClient.invalidateQueries({ queryKey: ['getAccountByUsername'] })
      }, 1000)
    },
  })

  const unfollowMutation = useMutation({
    mutationFn: () => {
      return unfollowAccountById(userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAccountRelationship'] })
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['getAccountById'] })
        queryClient.invalidateQueries({ queryKey: ['getAccountByUsername'] })
      }, 1000)
    },
  })

  const onOpenMenu = () => {
    if (!user?.id) {
      return
    }
    bottomSheetModalRef.current?.present()
  }

  const menuGotoLink = async (action) => {
    bottomSheetModalRef.current?.close()

    if (action === 'report') {
      router.push('/profile/report/' + id)
    }

    if (action === 'block') {
      Alert.alert(
        'Confirm Block',
        "Are you sure you want to block this account?\n\nThey won't be notified you blocked them. You can unblock them later.",
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Block',
            style: 'destructive',
            onPress: () => _handleBlock(),
          },
        ]
      )
    }

    if (action === 'unblock') {
      Alert.alert('Confirm Unblock', 'Are you sure you want to unblock this account?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unblock',
          style: 'destructive',
          onPress: () => _handleUnblock(),
        },
      ])
    }

    if (action === 'mute') {
      Alert.alert(
        'Confirm Mute',
        "Are you sure you want to mute this account?\n\nThey won't be notified you muted them. You can unmute them later.",
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Mute',
            style: 'destructive',
            onPress: () => _handleMute(),
          },
        ]
      )
    }

    if (action === 'unmute') {
      Alert.alert('Confirm Unmute', 'Are you sure you want to unmute this account?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unmute',
          style: 'destructive',
          onPress: () => _handleUnmute(),
        },
      ])
    }

    if (action === 'copyurl') {
      Clipboard.setString(user.url)
      toastController.show('Profile copied to clipboard', {
        from: 'bottom',
        preset: 'none',
        duration: 2500,
        haptic: 'success',
      })
    }

    if (action === 'share') {
      try {
        const result = await Share.share({
          message: user.url,
        })
      } catch (error) {
        Alert.alert(error.message)
      }
    }

    if (action === 'about') {
      router.push(`/profile/about/${userId}`)
    }
  }

  const _handleBlock = () => {
    blockMutation.mutate()
  }

  const _handleUnblock = () => {
    unblockMutation.mutate()
  }

  const _handleMute = () => {
    muteMutation.mutate()
  }

  const _handleUnmute = () => {
    unmuteMutation.mutate()
  }

  const _handleFollow = () => {
    followMutation.mutate()
  }

  const _handleUnfollow = () => {
    unfollowMutation.mutate()
  }

  const _handleCancelFollowRequest = () => {
    unfollowMutation.mutate()
  }

  const _handleOnShare = async () => {
    try {
      const result = await Share.share({
        message: user.url,
      })
    } catch (error) {
      Alert.alert(error.message)
    }
  }

  const { data: user, error: userError } = useQuery({
    queryKey:
      byUsername !== undefined && id == 0
        ? ['getAccountByUsername', byUsername]
        : ['getAccountById', id],
    queryFn: byUsername !== undefined && id == 0 ? getAccountByUsername : getAccountById,
  })

  useEffect(() => {
    if (user && Platform.OS == 'android') {
      navigation.setOptions({
        headerTitle: user?.username,
        headerRight: () => (
          <Button chromeless p="$0" onPress={() => onOpenMenu()}>
            <Feather name={'more-vertical'} size={26} />
          </Button>
        ),
      })
    }
  }, [navigation, user])

  const userId = user?.id

  const { data: relationship, isError: relationshipError } = useQuery({
    queryKey: ['getAccountRelationship', userId],
    queryFn: getAccountRelationship,
    enabled: !!userId && !userError,
  })

  const { data: mutuals, isError: mutualsError } = useQuery({
    queryKey: ['getMutualFollowing', userId],
    queryFn: getMutualFollowing,
    enabled: !!relationship,
  })

  const RenderHeader = useCallback(
    () => (
      <ProfileHeader
        profile={user}
        selfUser={selfUser}
        relationship={relationship}
        openMenu={onOpenMenu}
        onFollow={() => _handleFollow()}
        onUnfollow={() => _handleUnfollow()}
        onCancelFollowRequest={() => _handleCancelFollowRequest()}
        onShare={() => _handleOnShare()}
        mutuals={mutuals}
      />
    ),
    [mutuals, user, relationship, selfUser]
  )

  const {
    status,
    fetchStatus,
    data: feed,
    fetchNextPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetched,
    isFetching,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['statusesById', user?.id],
    queryFn: async ({ pageParam }) => {
      const data = await getAccountStatusesById(user?.id, pageParam)
      const res = data.filter((p) => {
        return (
          ['photo', 'photo:album', 'video'].includes(p.pf_type) &&
          p.media_attachments.length
        )
      })
      return res
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined
      }
      let lowestId = lastPage.reduce((min, obj) => {
        if (obj.id < min) {
          return obj.id
        }
        return min
      }, lastPage[0].id)
      return lowestId
    },
    enabled: !!userId,
  })

  if (status !== 'success' || (isFetching && !isFetchingNextPage)) {
    return (
      <SafeAreaView edges={['top']} flex={1}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={'#000'} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView flex={1} edges={['top']} style={{ backgroundColor: 'white' }}>
      <Stack.Screen
        options={{
          headerShown: Platform.OS === 'android',
        }}
      />
      <FlatList
        data={feed?.pages.flat()}
        keyExtractor={(item, index) => item?.id.toString()}
        ListHeaderComponent={RenderHeader}
        renderItem={RenderItem}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (!userError && !isFetching && hasNextPage) fetchNextPage()
        }}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={EmptyFeed}
        contentContainerStyle={{ flexGrow: 1 }}
        ListFooterComponent={() =>
          !userError && isFetched && isFetchingNextPage ? (
            <View p="$5">
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        keyboardBehavior={Platform.OS === 'ios' ? 'extend' : 'interactive'}
      >
        <BottomSheetScrollView>
          <Button
            size="$6"
            chromeless
            color="red"
            onPress={() => menuGotoLink(relationship?.muting ? 'unmute' : 'mute')}
          >
            {relationship?.muting ? 'Unmute' : 'Mute'}
          </Button>
          <Separator />
          <Button
            size="$6"
            chromeless
            color="red"
            onPress={() => menuGotoLink(relationship?.blocking ? 'unblock' : 'block')}
          >
            {relationship?.blocking ? 'Unblock' : 'Block'}
          </Button>
          <Separator />
          <Button size="$6" chromeless color="red" onPress={() => menuGotoLink('report')}>
            Report
          </Button>
          <Separator />
          <Button size="$6" chromeless onPress={() => menuGotoLink('about')}>
            About this account
          </Button>
          <Separator />
          <Button size="$6" chromeless onPress={() => menuGotoLink('copyurl')}>
            Copy profile URL
          </Button>
          <Separator />
          <Button size="$6" chromeless onPress={() => menuGotoLink('share')}>
            Share this profile
          </Button>
          <Separator />
          <Button
            size="$6"
            chromeless
            color="$gray8"
            onPress={() => bottomSheetModalRef.current?.close()}
          >
            Cancel
          </Button>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </SafeAreaView>
  )
}
