import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { oreSizes } from '../config/ores.ts'
import sound1 from '../assets/audio/sound-1.mp3'
import sound2 from '../assets/audio/sound-2.mp3'
import { ScannerResultType } from './parse-scanner-result/parse-scanner-result.tsx'
import { ShipType } from './use-ship-store.ts'

export type GlobalStoreRowType = ScannerResultType & {
  turrets: number
  running: boolean
}

type GlobalStoreType = {
  currentCargo: number
  compressedCargo: number
  setCurrentCargo: (cargo: number) => void
  resetCurrentCargo: () => void
  compressCurrentCargo: () => void
  oreRows: GlobalStoreRowType[]
  setOreRows: (rows: GlobalStoreRowType[]) => void
  addOreRows: (rows: GlobalStoreRowType[]) => void
  updateOreRow: (id: string, row: Partial<GlobalStoreRowType>) => void
  deleteOreRow: (id: string) => void
  deleteEmptyOreRows: () => void
}

let cargoAlertPlayed = false

const useGlobalStore = create<GlobalStoreType>((set) => ({
  currentCargo: 0,
  compressedCargo: 0,
  setCurrentCargo: (cargo) => set(() => ({ currentCargo: cargo })),
  resetCurrentCargo: () =>
    set(() => {
      cargoAlertPlayed = false
      return { currentCargo: 0, compressedCargo: 0 }
    }),
  compressCurrentCargo: () =>
    set((state) => {
      cargoAlertPlayed = false
      return { compressedCargo: state.compressedCargo + state.currentCargo / 100, currentCargo: 0 }
    }),
  oreRows: [],
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
  deleteOreRow: (id) =>
    set((state) => ({
      oreRows: state.oreRows.filter((item) => item.id !== id),
    })),
  deleteEmptyOreRows: () =>
    set((state) => ({
      oreRows: state.oreRows.filter((item) => item.oreAmount > 0),
    })),
}))

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
  return useGlobalStore((state) => ({
    oreRows: state.oreRows,
    setOreRows: state.setOreRows,
    addOreRows: state.addOreRows,
    updateOreRow: state.updateOreRow,
    deleteOreRow: state.deleteOreRow,
    deleteEmptyOreRows: state.deleteEmptyOreRows,
  }))
}

const getCurrentSeconds = () => {
  return Math.round(Date.now() / 1000)
}

let secInterval: any
let lastTickSeconds: number
export const startTimerInterval = (ship: ShipType) => {
  lastTickSeconds = getCurrentSeconds()
  secInterval = setInterval(() => {
    const secondsPassed = getCurrentSeconds() - lastTickSeconds
    if (secondsPassed === 0) {
      return
    }
    lastTickSeconds = getCurrentSeconds()
    const yieldPerTurret = ship.yieldPerTurret / ship.turretCircleDuration
    const yieldAllSeconds = yieldPerTurret * secondsPassed
    const rows = useGlobalStore.getState().oreRows
    let currentCargo = useGlobalStore.getState().currentCargo
    const compressedCargo = useGlobalStore.getState().compressedCargo
    let shouldUpdate = false
    for (const row of rows) {
      if (row.running) {
        shouldUpdate = true
        const rowYield = yieldAllSeconds * row.turrets
        const oreSize = oreSizes[row.oreType]
        const amount = Math.min(rowYield / oreSize, row.oreAmount)
        row.oreAmount -= amount
        if (row.oreAmount <= 0) {
          row.running = false
          new Audio(sound1).play().then(() => {
            // sound is playing
          })
        }
        currentCargo += amount * oreSize
      }
    }
    if (shouldUpdate) {
      if (!cargoAlertPlayed && currentCargo + compressedCargo > ship.cargoSize * 0.95) {
        cargoAlertPlayed = true
        new Audio(sound2).play().then(() => {
          // sound is playing
        })
      }
      useGlobalStore.getState().setCurrentCargo(currentCargo)
      useGlobalStore.getState().setOreRows(rows)
    }
  }, 1000)
}

export const stopTimerInterval = () => {
  clearInterval(secInterval)
}
