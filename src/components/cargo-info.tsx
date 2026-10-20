import type { FunctionComponent } from 'preact'
import { useCurrentCargo } from '../utils/use-global-store.ts'
import { ShipType } from '../utils/use-ship-store.ts'
import { Number } from './number.tsx'
import { Button } from './ui/button.tsx'
import { cx } from './ui/cx.ts'
import { Icon } from './ui/icon.tsx'
import { captionHeadingClasses } from './ui/typography.ts'

export type CargoInfoProps = {
  ship: ShipType
}

export const CargoInfo: FunctionComponent<CargoInfoProps> = ({ ship }) => {
  const { currentCargo, resetCurrentCargo, compressCurrentCargo } = useCurrentCargo()

  const ratio = ship.cargoSize > 0 ? currentCargo / ship.cargoSize : 0
  let toneText = 'text-fg'
  let toneFill = 'bg-accent'
  let status = ''
  if (ratio > 0.95) {
    toneText = 'text-danger'
    toneFill = 'bg-danger'
    status = 'Cargo full'
  } else if (ratio > 0.75) {
    toneText = 'text-warn'
    toneFill = 'bg-warn'
    status = 'Almost full'
  }

  return (
    <section aria-labelledby="cargo-heading" className="rounded-xl border border-line bg-panel p-4 md:p-5">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <h2 id="cargo-heading" className={cx('mb-1', captionHeadingClasses)}>
            Cargo hold {status && <span className={cx('ml-1.5', toneText)}>· {status}</span>}
          </h2>
          <p className="flex items-baseline gap-2 tabular">
            <span className={cx('text-3xl font-semibold tracking-tight', toneText)}>
              <Number value={currentCargo} maximumFractionDigits={0} />
            </span>
            <span className="text-sm text-muted">
              / <Number value={ship.cargoSize} /> m³
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" leftSection={<Icon name="package-export" />} onClick={() => resetCurrentCargo()}>
            Empty
          </Button>
          <Button size="sm" leftSection={<Icon name="arrows-minimize" />} onClick={() => compressCurrentCargo()}>
            Compress
          </Button>
        </div>
      </div>
      <div
        role="meter"
        aria-label="Cargo used"
        aria-valuemin={0}
        aria-valuemax={ship.cargoSize}
        aria-valuenow={Math.round(currentCargo)}
        aria-valuetext={`${Math.round(currentCargo).toLocaleString('en-US')} of ${ship.cargoSize.toLocaleString('en-US')} m³`}
        className="mt-4 h-2 overflow-hidden rounded-full bg-canvas"
      >
        {/* slides a full-width bar instead of animating width: no layout work on every tick, and the rounded end keeps its shape */}
        <div
          className={cx(
            'h-full rounded-full transition-transform duration-700 ease-out motion-reduce:transition-none',
            toneFill,
          )}
          style={{ transform: `translateX(${Math.min(100, ratio * 100) - 100}%)` }}
        />
      </div>
      <p className="mt-3 text-xs text-subtle">
        Empty your cargo after unloading. Compress it when a fleet Porpoise, Orca or Rorqual compresses your hold (ore
        to 1%, ice to 10%).
      </p>
    </section>
  )
}
