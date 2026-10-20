import { useLocalStorage } from './use-local-storage.ts'
import { defaultSoundIds, soundOptionById } from '../assets/audio'

export type SoundSettings = {
  oreDepletedSoundId: string
  cargoFullSoundId: string
}

const SOUND_SETTINGS_KEY = 'sound-settings'

const sanitizeSoundId = (soundId: string, fallbackId: string) => {
  return soundOptionById[soundId] ? soundId : fallbackId
}

const getDefaultSettings = (): SoundSettings => ({
  oreDepletedSoundId: defaultSoundIds.oreDepleted,
  cargoFullSoundId: defaultSoundIds.cargoFull,
})

const defaultSettings = getDefaultSettings()

const sanitizeSettings = (settings: Partial<SoundSettings> | null | undefined): SoundSettings => {
  const defaults = getDefaultSettings()
  return {
    oreDepletedSoundId: sanitizeSoundId(
      settings?.oreDepletedSoundId ?? defaults.oreDepletedSoundId,
      defaults.oreDepletedSoundId,
    ),
    cargoFullSoundId: sanitizeSoundId(
      settings?.cargoFullSoundId ?? defaults.cargoFullSoundId,
      defaults.cargoFullSoundId,
    ),
  }
}

export const useSoundSettings = () => {
  const [settings, setSettings] = useLocalStorage<SoundSettings>(SOUND_SETTINGS_KEY, defaultSettings)

  return {
    settings: sanitizeSettings(settings),
    setSettings,
  }
}

export const getStoredSoundSettings = (): SoundSettings => {
  if (typeof window === 'undefined') {
    return getDefaultSettings()
  }
  try {
    const raw = window.localStorage.getItem(SOUND_SETTINGS_KEY)
    if (!raw) {
      return getDefaultSettings()
    }
    const parsed = JSON.parse(raw) as Partial<SoundSettings>
    return sanitizeSettings(parsed)
  } catch {
    return getDefaultSettings()
  }
}

export const resolveSoundSrc = (soundId: string): string | null => {
  return soundOptionById[soundId]?.src ?? null
}
