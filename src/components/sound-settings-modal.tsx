import * as React from 'react'
import { ActionIcon, Card, Group, Modal, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { TbPlayerPlay, TbVolume } from 'react-icons/tb'
import { SoundOption, soundOptions } from '../assets/audio/index.ts'
import { useSoundSettings } from '../utils/use-sound-settings.ts'

type SoundSettingsModalProps = {
  opened: boolean
  onClose: () => void
}

type SoundGridProps = {
  label: string
  selectedId: string
  onSelect: (soundId: string) => void
}

const playSound = (sound: SoundOption) => {
  const audio = new Audio(sound.src)
  audio.play().then(() => {
    // sound is playing
  })
}

const SoundGrid: React.FC<SoundGridProps> = ({ label, selectedId, onSelect }) => {
  return (
    <Stack gap="xs">
      <Title order={5}>{label}</Title>
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
        {soundOptions.map((sound) => {
          const isSelected = sound.id === selectedId
          return (
            <Card
              key={sound.id}
              withBorder
              padding="xs"
              bg={isSelected ? 'dark.4' : 'dark.6'}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelect(sound.id)}
            >
              <Group justify="space-between" gap="xs" align="center">
                <Text size="sm" fw={isSelected ? 700 : 500}>
                  {sound.label}
                </Text>
                <Group gap={6}>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={(event) => {
                      event.stopPropagation()
                      playSound(sound)
                    }}
                    title={`Play ${sound.label}`}
                  >
                    <TbPlayerPlay size={16} />
                  </ActionIcon>
                  {isSelected && <TbVolume size={14} />}
                </Group>
              </Group>
            </Card>
          )
        })}
      </SimpleGrid>
    </Stack>
  )
}

export const SoundSettingsModal: React.FC<SoundSettingsModalProps> = ({ opened, onClose }) => {
  const { settings, setSettings } = useSoundSettings()

  return (
    <Modal opened={opened} onClose={onClose} title="Alert sounds" centered size="lg">
      <Stack gap="md">
        <SoundGrid
          label="Ore depleted"
          selectedId={settings.oreDepletedSoundId}
          onSelect={(soundId) => setSettings({ ...settings, oreDepletedSoundId: soundId })}
        />
        <SoundGrid
          label="Cargo full"
          selectedId={settings.cargoFullSoundId}
          onSelect={(soundId) => setSettings({ ...settings, cargoFullSoundId: soundId })}
        />
      </Stack>
    </Modal>
  )
}
