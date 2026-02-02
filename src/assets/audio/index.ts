import sound1 from './sound-1.mp3'
import sound2 from './sound-2.mp3'
import sound3 from './sound-3.mp3'
import sound4 from './sound-4.mp3'
import sound5 from './sound-5.mp3'
import sound6 from './sound-6.mp3'
import sound7 from './sound-7.mp3'
import sound8 from './sound-8.m4a'

export type SoundOption = {
  id: string
  label: string
  src: string
}

export const soundOptions: SoundOption[] = [
  { id: 'sound-1', label: 'Sound 1', src: sound1 },
  { id: 'sound-2', label: 'Sound 2', src: sound2 },
  { id: 'sound-3', label: 'Sound 3', src: sound3 },
  { id: 'sound-4', label: 'Sound 4', src: sound4 },
  { id: 'sound-5', label: 'Sound 5', src: sound5 },
  { id: 'sound-6', label: 'Sound 6', src: sound6 },
  { id: 'sound-7', label: 'Sound 7', src: sound7 },
  { id: 'sound-8', label: 'Sound 8', src: sound8 },
]

export const defaultSoundIds = {
  oreDepleted: 'sound-1',
  cargoFull: 'sound-2',
}

export const soundOptionById = soundOptions.reduce<Record<string, SoundOption>>((acc, option) => {
  acc[option.id] = option
  return acc
}, {})
