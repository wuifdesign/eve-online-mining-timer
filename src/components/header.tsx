import * as React from 'react'
import { Box, Button, Group, Text } from '@mantine/core'
import { FaGithub } from 'react-icons/fa6'
import logo from '../assets/logo.png'

export const Header: React.FC = () => {
  return (
    <Box p="sm" bg="dark.9">
      <header>
        <Group justify="space-between" h="100%">
          <Group>
            <img alt="EVE Online - Mining Timer" src={logo} height={28} />
            <Text fw="bold">EVE Online - Mining Timer</Text>
          </Group>
          <Group visibleFrom="sm">
            <Button
              target="_blank"
              component="a"
              href="https://github.com/wuifdesign/eve-online-mining-timer/issues"
              variant="default"
            >
              Issues
            </Button>
            <Button
              target="_blank"
              component="a"
              href="https://github.com/wuifdesign/eve-online-mining-timer"
              variant="default"
              leftSection={<FaGithub />}
            >
              Github
            </Button>
          </Group>
        </Group>
      </header>
    </Box>
  )
}
