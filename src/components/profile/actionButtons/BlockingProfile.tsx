import { Button, XStack } from 'tamagui'

export default function BlockingProfile() {
  return (
    <XStack w="100%" my="$3" gap="$2">
      <Button
        theme="light"
        bg="#000"
        size="$4"
        color="white"
        fontWeight="bold"
        fontSize="$6"
        flexGrow={1}
      >
        Blocked
      </Button>
    </XStack>
  )
}
