import * as React from 'react'
import { Box, Text } from '@mantine/core'

export const Footer: React.FC = () => {
  return (
    <Box mt="xl" mb="md" ta="center">
      <Text>
        Tool created by <b>Marumis Wuif</b>
      </Text>
      <Text c="dimmed" size="sm">
        Feel free to send me questions, suggestions or donations of ISK.
      </Text>
    </Box>
  )
}
