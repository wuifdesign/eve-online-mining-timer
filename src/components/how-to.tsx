import * as React from 'react'
import { Anchor, Box, List, Text } from '@mantine/core'

export const HowTo: React.FC = () => {
  return (
    <Box my="lg" p="lg" bg="dark.5">
      <Text c="white" fw="bold">
        How to Use
      </Text>
      <Text size="sm">Utilize the survey scanner results to generate pre-filled rows.</Text>
      <Text size="sm">
        Copy the selected survey scanner result with <b>CTRL + C</b> and paste it into the textarea above with{' '}
        <b>CTRL + V</b>.
      </Text>
      <Text c="white" fw="bold" mt="md">
        Mining Update Notes
      </Text>
      <List size="sm" spacing={4} withPadding>
        <List.Item>Mining lasers and strip miners now run faster cycles with proportional yield per cycle.</List.Item>
        <List.Item>Critical yields add bonus ore to your cargo without reducing asteroid volume.</List.Item>
        <List.Item>Mining residue and compression changes can affect depletion rate and hauling.</List.Item>
      </List>
      <Text size="sm">
        References:{' '}
        <Anchor
          href="https://www.eveonline.com/news/view/mining-in-focus-new-ore-and-more"
          target="_blank"
          rel="noreferrer"
        >
          CCP update
        </Anchor>
        {' · '}
        <Anchor href="https://wiki.eveuniversity.org/Mining" target="_blank" rel="noreferrer">
          EVE University wiki
        </Anchor>
      </Text>
    </Box>
  )
}
