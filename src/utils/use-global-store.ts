import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import { getCompressionRatio, getOreUnitSize } from '../config/ores.ts'
import { getMiningStats } from './mining-math.ts'
import { ScannerResultType } from './parse-scanner-result/parse-scanner-result.tsx'
import { getStoredSoundSettings, resolveSoundSrc } from './use-sound-settings.ts'
import { ShipType } from './use-ship-store.ts'

export type GlobalStoreRowType = ScannerResultType & {
  turrets: number
  running: boolean
}

// rows taken out by delete / clear depleted, kept with their position so undo can put them back in place
export type RemovedRows = {
  reason: 'row' | 'depleted' | 'all'
  entries: { row: GlobalStoreRowType; index: number }[]
}

type GlobalStoreType = {
  currentCargo: number
  // volume the current cargo takes once compressed, ice and ore compress differently
  currentCargoCompressed: number
  compressedCargo: number
  // last time (unix seconds) the timer advanced a running row, used to catch up after a reload
  lastTickAt: number | null
  resetCurrentCargo: () => void
  compressCurrentCargo: () => void
  oreRows: GlobalStoreRowType[]
  removed: RemovedRows | null
  setOreRows: (rows: GlobalStoreRowType[]) => void
  addOreRows: (rows: GlobalStoreRowType[]) => void
  updateOreRow: (id: string, row: Partial<GlobalStoreRowType>) => void
  deleteOreRow: (id: string) => void
  deleteEmptyOreRows: () => void
  deleteAllOreRows: () => void
  undoRemove: () => void
  dismissRemoved: () => void
}

type PersistedSession = Pick<
  GlobalStoreType,
  'currentCargo' | 'currentCargoCompressed' | 'compressedCargo' | 'lastTickAt' | 'oreRows'
>

let cargoAlertPlayed = false

const removeRows = (
  rows: GlobalStoreRowType[],
  reason: RemovedRows['reason'],
  shouldRemove: (row: GlobalStoreRowType) => boolean,
) => {
  const entries: RemovedRows['entries'] = []
  const oreRows = rows.filter((row, index) => {
    if (shouldRemove(row)) {
      entries.push({ row, index })
      return false
    }
    return true
  })
  return { oreRows, removed: entries.length > 0 ? { reason, entries } : null }
}

const useGlobalStore = create<GlobalStoreType>()(
  persist(
    (set) => ({
      currentCargo: 0,
      currentCargoCompressed: 0,
      compressedCargo: 0,
      lastTickAt: null,
      resetCurrentCargo: () =>
        set(() => {
          cargoAlertPlayed = false
          return { currentCargo: 0, currentCargoCompressed: 0, compressedCargo: 0 }
        }),
      compressCurrentCargo: () =>
        set((state) => {
          cargoAlertPlayed = false
          return {
            compressedCargo: state.compressedCargo + state.currentCargoCompressed,
            currentCargo: 0,
            currentCargoCompressed: 0,
          }
        }),
      oreRows: [],
      removed: null,
      setOreRows: (oreRows) => set(() => ({ oreRows })),
      addOreRows: (oreRows) => set((state) => ({ oreRows: [...state.oreRows, ...oreRows] })),
      updateOreRow: (id, row) =>
        set((state) => {
          const oreRows = [...state.oreRows]
          const rowIndex = oreRows.findIndex((item) => item.id === id)
          if (rowIndex > -1) {
            oreRows[rowIndex] = {
              ...oreRows[rowIndex],
              ...row,
            }
          }
          return { oreRows }
        }),
      deleteOreRow: (id) => set((state) => removeRows(state.oreRows, 'row', (item) => item.id === id)),
      deleteEmptyOreRows: () => set((state) => removeRows(state.oreRows, 'depleted', (item) => item.oreAmount <= 0)),
      deleteAllOreRows: () => set((state) => removeRows(state.oreRows, 'all', () => true)),
      undoRemove: () =>
        set((state) => {
          if (!state.removed) {
            return {}
          }
          const oreRows = [...state.oreRows]
          // ascending order, so every earlier index is already back in place
          for (const { row, index } of state.removed.entries) {
            // a deleted row comes back paused, its countdown stopped while it was gone
            oreRows.splice(Math.min(index, oreRows.length), 0, { ...row, running: false })
          }
          return { oreRows, removed: null }
        }),
      dismissRemoved: () => set(() => ({ removed: null })),
    }),
    {
      name: 'mining-session',
      version: 2,
      // v1 had no compressed volume for the current cargo, it was always compressed at 1%
      migrate: (persisted, version) => {
        const state = persisted as PersistedSession
        if (version < 2) {
          return { ...state, currentCargoCompressed: state.currentCargo / 100 }
        }
        return state
      },
      // the undo snapshot is short-lived and stays in memory only
      partialize: (state): PersistedSession => ({
        currentCargo: state.currentCargo,
        currentCargoCompressed: state.currentCargoCompressed,
        compressedCargo: state.compressedCargo,
        lastTickAt: state.lastTickAt,
        oreRows: state.oreRows,
      }),
    },
  ),
)

// a row can't use more turrets than the ship currently has; the stored choice is kept so raising the count restores it
export const getRowTurrets = (row: GlobalStoreRowType, ship: ShipType) => {
  return Math.max(1, Math.min(row.turrets, ship.numberOfTurrets))
}

export const useCurrentCargo = () => {
  return useGlobalStore(
    useShallow((state) => ({
      currentCargo: state.currentCargo + state.compressedCargo,
      resetCurrentCargo: state.resetCurrentCargo,
      compressCurrentCargo: state.compressCurrentCargo,
    })),
  )
}

export const useOreRows = () => {
  return useGlobalStore(
    useShallow((state) => ({
      oreRows: state.oreRows,
      addOreRows: state.addOreRows,
      deleteEmptyOreRows: state.deleteEmptyOreRows,
      deleteAllOreRows: state.deleteAllOreRows,
    })),
  )
}

// actions only: a row subscribing to these doesn't re-render when other rows tick
export const useOreRowActions = () => {
  return useGlobalStore(
    useShallow((state) => ({
      updateOreRow: state.updateOreRow,
      deleteOreRow: state.deleteOreRow,
    })),
  )
}

export const useRemovedRows = () => {
  return useGlobalStore(
    useShallow((state) => ({
      removed: state.removed,
      undoRemove: state.undoRemove,
      dismissRemoved: state.dismissRemoved,
    })),
  )
}

const playAlert = (soundId: string) => {
  const soundSrc = resolveSoundSrc(soundId)
  if (soundSrc) {
    new Audio(soundSrc).play().catch(() => {
      // autoplay blocked or file failed to load, the visual state still shows the change
    })
  }
}

const getCurrentSeconds = () => {
  return Math.round(Date.now() / 1000)
}

// a reload within this window catches up the elapsed time, after a longer gap the timers are paused instead
const MAX_CATCH_UP_SECONDS = 15 * 60

let secInterval: ReturnType<typeof setInterval> | undefined
let lastTickSeconds: number
let resumed = false

const resumeSession = (ship: ShipType) => {
  const { lastTickAt, oreRows, currentCargo, compressedCargo } = useGlobalStore.getState()
  // don't replay the cargo alert for a hold that was already full before the reload
  cargoAlertPlayed = currentCargo + compressedCargo > ship.cargoSize * 0.95
  const now = getCurrentSeconds()
  if (lastTickAt === null || !oreRows.some((row) => row.running)) {
    return now
  }
  if (now - lastTickAt <= MAX_CATCH_UP_SECONDS) {
    return lastTickAt
  }
  useGlobalStore.getState().setOreRows(oreRows.map((row) => (row.running ? { ...row, running: false } : row)))
  return now
}

export const startTimerInterval = (ship: ShipType) => {
  if (!resumed) {
    resumed = true
    lastTickSeconds = resumeSession(ship)
  } else {
    lastTickSeconds = getCurrentSeconds()
  }
  secInterval = setInterval(() => {
    const secondsPassed = getCurrentSeconds() - lastTickSeconds
    if (secondsPassed === 0) {
      return
    }
    lastTickSeconds = getCurrentSeconds()
    const { depletionPerSecond, cargoPerSecond } = getMiningStats(ship)
    const rows = useGlobalStore.getState().oreRows
    let currentCargo = useGlobalStore.getState().currentCargo
    let currentCargoCompressed = useGlobalStore.getState().currentCargoCompressed
    const compressedCargo = useGlobalStore.getState().compressedCargo
    let shouldUpdate = false
    const nextRows = rows.map((row) => {
      if (!row.running) {
        return row
      }
      shouldUpdate = true
      const oreUnitSize = getOreUnitSize(row.oreType, row.unitVolume)
      if (!oreUnitSize) {
        return row
      }
      const rowDepletionVolume = depletionPerSecond * secondsPassed * getRowTurrets(row, ship)
      const remainingVolume = row.oreAmount * oreUnitSize
      const actualDepletionVolume = Math.min(rowDepletionVolume, remainingVolume)
      const amount = actualDepletionVolume / oreUnitSize
      const nextOreAmount = row.oreAmount - amount
      let nextRunning: boolean = row.running
      if (nextOreAmount <= 0) {
        nextRunning = false
        playAlert(getStoredSoundSettings().oreDepletedSoundId)
      }
      if (depletionPerSecond > 0) {
        const cargoRatio = cargoPerSecond / depletionPerSecond
        const minedVolume = actualDepletionVolume * cargoRatio
        currentCargo += minedVolume
        currentCargoCompressed += minedVolume / getCompressionRatio(row.oreType)
      }
      return {
        ...row,
        oreAmount: nextOreAmount,
        running: nextRunning,
      }
    })
    if (shouldUpdate) {
      if (!cargoAlertPlayed && currentCargo + compressedCargo > ship.cargoSize * 0.95) {
        cargoAlertPlayed = true
        playAlert(getStoredSoundSettings().cargoFullSoundId)
      }
      useGlobalStore.setState({ currentCargo, currentCargoCompressed, oreRows: nextRows, lastTickAt: lastTickSeconds })
    }
  }, 1000)
}

export const stopTimerInterval = () => {
  clearInterval(secInterval)
}
