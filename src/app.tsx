import type { FunctionComponent } from 'preact'
import { useEffect } from 'preact/hooks'
import { Header } from './components/header.tsx'
import { useShipStore } from './utils/use-ship-store.ts'
import { CargoInfo } from './components/cargo-info.tsx'
import { HowTo } from './components/how-to.tsx'
import { Footer } from './components/footer.tsx'
import { OreRow } from './components/ore-row.tsx'
import { OreRowInfo } from './components/ore-row-info.tsx'
import { ScannerResultPasteInput } from './components/scanner-result-paste-input.tsx'
import { startTimerInterval, stopTimerInterval, useOreRows } from './utils/use-global-store.ts'
import { ShipConfig } from './components/ship-config.tsx'
import { Button } from './components/ui/button.tsx'
import { Icon } from './components/ui/icon.tsx'
import { UndoToast } from './components/undo-toast.tsx'

export const App: FunctionComponent = () => {
  const { ship } = useShipStore()
  const { oreRows, addOreRows, deleteEmptyOreRows, deleteAllOreRows } = useOreRows()

  useEffect(() => {
    startTimerInterval(ship)
    return () => {
      stopTimerInterval()
    }
  }, [ship])

  const hasRows = oreRows.length > 0
  const hasDepletedRows = oreRows.some((row) => row.oreAmount <= 0)

  const pasteInput = (
    <ScannerResultPasteInput
      prominent={!hasRows}
      onPaste={(data) => {
        addOreRows(
          data.map((item) => ({
            ...item,
            turrets: ship.splitTurrets ? 1 : ship.numberOfTurrets,
            running: false,
          })),
        )
      }}
    />
  )

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      {/* narrow windows: timers, then ship setup (rarely touched mid-session), then help; wide screens move the ship into a sidebar */}
      <main className="mx-auto grid w-full max-w-[1440px] flex-1 items-start gap-5 px-4 py-5 md:px-6 md:py-6 xl:grid-cols-[320px_minmax(0,1fr)] xl:gap-6">
        <div className="flex min-w-0 flex-col gap-5 xl:col-start-2 xl:row-start-1">
          <CargoInfo ship={ship} />
          <section aria-labelledby="asteroids-heading" className="rounded-xl border border-line bg-panel">
            <div className="flex items-center justify-between gap-4 py-2 pr-2 pl-4">
              <h2 id="asteroids-heading" className="text-sm font-semibold">
                Asteroids
                {hasRows && <span className="ml-2 font-normal text-subtle tabular">{oreRows.length}</span>}
              </h2>
              {hasRows && (
                <div className="flex gap-1">
                  <Button variant="danger" size="sm" disabled={!hasDepletedRows} onClick={() => deleteEmptyOreRows()}>
                    Clear depleted
                  </Button>
                  {/* no confirmation: the undo toast brings every row back */}
                  <Button
                    variant="danger"
                    size="sm"
                    leftSection={<Icon name="trash" />}
                    onClick={() => deleteAllOreRows()}
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>
            {hasRows ? (
              <>
                <div className="border-t border-line">
                  <OreRowInfo />
                  {oreRows.map((item) => (
                    <OreRow key={item.id} ship={ship} data={item} />
                  ))}
                </div>
                <div className="border-t border-line p-3">{pasteInput}</div>
              </>
            ) : (
              <div className="px-3 pb-3">{pasteInput}</div>
            )}
          </section>
        </div>
        <aside className="xl:sticky xl:top-6 xl:col-start-1 xl:row-span-2 xl:row-start-1">
          <ShipConfig />
        </aside>
        <div className="min-w-0 xl:col-start-2 xl:row-start-2">
          <HowTo />
        </div>
      </main>
      <Footer />
      <UndoToast />
    </div>
  )
}
