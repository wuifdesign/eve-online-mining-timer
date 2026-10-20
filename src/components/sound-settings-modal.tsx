import type { FunctionComponent } from 'preact'
import { useEffect } from 'preact/hooks'
import { SoundOption, soundOptions } from '../assets/audio/index.ts'
import { useSoundSettings } from '../utils/use-sound-settings.ts'
import { IconButton } from './ui/button.tsx'
import { Modal } from './ui/modal.tsx'
import { cx } from './ui/cx.ts'
import { Icon } from './ui/icon.tsx'
import { captionHeadingClasses } from './ui/typography.ts'

type SoundSettingsModalProps = {
  opened: boolean
  onClose: () => void
}

type SoundGridProps = {
  label: string
  selectedId: string
  onSelect: (soundId: string) => void
}

// one preview at a time across both grids: starting a sound cuts off the one still playing
let preview: HTMLAudioElement | null = null

const stopPreview = () => {
  preview?.pause()
  preview = null
}

const playSound = (sound: SoundOption) => {
  stopPreview()
  const audio = new Audio(sound.src)
  preview = audio
  audio.play().catch(() => {
    // playback blocked or file failed to load, nothing to preview
  })
}

const SoundGrid: FunctionComponent<SoundGridProps> = ({ label, selectedId, onSelect }) => {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className={cx('mb-2.5', captionHeadingClasses)}>{label}</legend>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {soundOptions.map((sound) => {
          const isSelected = sound.id === selectedId
          return (
            <div
              key={sound.id}
              className={cx(
                'flex items-center justify-between gap-2.5 rounded-lg border py-1.5 pr-1.5 pl-3 transition-colors duration-150 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent',
                isSelected ? 'border-accent bg-accent/10' : 'border-line bg-canvas hover:border-line-strong',
              )}
            >
              <label className="flex grow cursor-pointer items-center text-sm">
                <input
                  type="radio"
                  name={label}
                  value={sound.id}
                  checked={isSelected}
                  onChange={() => onSelect(sound.id)}
                  className="sr-only"
                />
                <span className={isSelected ? 'font-semibold text-fg' : 'text-muted'}>{sound.label}</span>
              </label>
              <div className="flex items-center gap-1.5">
                <IconButton onClick={() => playSound(sound)} title={`Play ${sound.label}`}>
                  <Icon name="player-play" size={16} />
                </IconButton>
                {isSelected && <Icon name="volume" size={14} className="text-accent" />}
              </div>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}

export const SoundSettingsModal: FunctionComponent<SoundSettingsModalProps> = ({ opened, onClose }) => {
  const { settings, setSettings } = useSoundSettings()

  // closing the dialog also silences a preview that is still playing
  useEffect(() => {
    if (!opened) {
      stopPreview()
    }
  }, [opened])

  return (
    <Modal opened={opened} onClose={onClose} title="Alert sounds">
      <div className="flex flex-col gap-6">
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
      </div>
    </Modal>
  )
}
