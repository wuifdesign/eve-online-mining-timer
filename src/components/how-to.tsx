import * as React from 'react'
import { Box, Text } from '@mantine/core'

export const HowTo: React.FC = () => {
  return (
    <Box my="md" p="md" bg="dark.5">
      <Text c="white" fw="bold">
        How to Use
      </Text>
      <Text size="sm">Utilize the survey scanner results to generate pre-filled rows.</Text>
      <Text size="sm">
        Copy the selected survey scanner result with <b>CTRL + C</b> and paste it into the textarea above with{' '}
        <b>CTRL + V</b>.
      </Text>
    </Box>
  )
}
