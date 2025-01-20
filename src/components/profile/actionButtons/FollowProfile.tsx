import { Button, XStack } from 'tamagui'

export default function FollowProfile({ onPress }: { onPress: () => void }) {
  return (
    <XStack w="100%" my="$3" gap="$2">
      <Button
        theme="light"
        bg="$blue9"
        size="$4"
        color="white"
        fontWeight="bold"
        fontSize="$6"
        flexGrow={1}
        onPress={() => onPress()}
      >
        Follow
      </Button>
    </XStack>
  )
}
