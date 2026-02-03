import * as React from 'react'
import { Box, Text, Tooltip } from '@mantine/core'
import { AiOutlineInfoCircle } from 'react-icons/ai'

export const Footer: React.FC = () => {
  return (
    <Box mt="xl" mb="md" ta="center">
      <Text>
        Tool created by <b>Marumis Wuif</b>
      </Text>
      <Text>
        With the help of{' '}
        <Tooltip label="For the Nov 2025 mining mechanics updates (Catalyst expansion)" withArrow>
          <Text span fw={700} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'help' }}>
            Ryuuki Ran <AiOutlineInfoCircle aria-hidden="true" size={14} />
          </Text>
        </Tooltip>
      </Text>
      <Text c="dimmed" size="sm">
        Feel free to send me questions, suggestions or donations of ISK in game.
      </Text>
    </Box>
  )
}
