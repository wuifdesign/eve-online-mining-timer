import { memo } from 'preact/compat'
import { useMemo } from 'preact/hooks'
import { OreType } from '../@types/ore.type.ts'
import { getOreUnitSize, oreNames } from '../config/ores.ts'
import { ShipType } from '../utils/use-ship-store.ts'
import { secToTime } from '../utils/sec-to-time/sec-to-time.tsx'
import { getRowTurrets, GlobalStoreRowType, useOreRowActions } from '../utils/use-global-store.ts'
import { getMiningStats } from '../utils/mining-math.ts'
import { simulateMiningBands } from '../utils/mining-sim.ts'
import { BandValue } from './band-value.tsx'
import { Number } from './number.tsx'
import { oreRowGridClasses } from './ore-row-info.tsx'
import { IconButton } from './ui/button.tsx'
import { cx } from './ui/cx.ts'
import { NumberInput, Select, TextInput } from './ui/inputs.tsx'
import { Icon } from './ui/icon.tsx'

const fixedDecimals = { minimumFractionDigits: 2, maximumFractionDigits: 2 }

export type OreRowType = {
  name: string
  oreType: OreType
  oreCount: number
}

export type OreRowProps = {
  ship: ShipType
  data: GlobalStoreRowType
}

// memo: while one row ticks, the others keep their props and skip the simulation entirely
export const OreRow = memo(function OreRow({ ship, data }: OreRowProps) {
  const { updateOreRow, deleteOreRow } = useOreRowActions()
  // getMiningStats returns a new object per call, keep it stable so the simulation memo below can hit
  const stats = useMemo(() => getMiningStats(ship), [ship])

  const turrets = getRowTurrets(data, ship)
  const oreUnitSize = data.oreType ? getOreUnitSize(data.oreType, data.unitVolume) : 0
  const oreSize = oreUnitSize * data.oreAmount
  const bands = useMemo(
    () =>
      simulateMiningBands({
        oreAmount: data.oreAmount,
        oreUnitSize,
        stats,
        turrets,
        seed: data.id,
      }),
    [data.oreAmount, data.id, turrets, oreUnitSize, stats],
  )
  const turretSelect: string[] = []
  for (let i = 1; i <= ship.numberOfTurrets; i++) {
    turretSelect.push(i.toString())
  }

  // an ore missing from the table stays selectable for its own row
  const oreOptions = oreNames.includes(data.oreType) ? oreNames : [data.oreType, ...oreNames]

  const depleted = data.oreAmount <= 0

  return (
    <div
      className={cx(
        oreRowGridClasses,
        'items-center border-b border-line px-4 py-3 transition-colors duration-200 last:border-b-0',
        data.running && 'bg-accent/[0.06]',
        // dimmed through color, not opacity, so the text keeps its contrast
        depleted && '[&_:is(input,select)]:text-muted',
      )}
    >
      <div className="[grid-area:label]">
        <TextInput
          size="xs"
          required
          defaultValue={data.name}
          aria-label="Label"
          onInput={(name) => updateOreRow(data.id, { name })}
        />
      </div>
      <div className="[grid-area:ore]">
        <Select
          size="xs"
          data={oreOptions}
          required
          aria-label="Ore"
          onChange={(type) => {
            updateOreRow(data.id, { oreType: type as OreType })
          }}
          value={data.oreType}
        />
      </div>
      <div className="[grid-area:count]">
        <NumberInput
          required
          size="xs"
          aria-label="Units left"
          thousandSeparator
          allowDecimal={false}
          allowNegative={false}
          value={data.oreAmount}
          onChange={(oreAmount) => {
            updateOreRow(data.id, { oreAmount })
          }}
        />
      </div>
      <div className="[grid-area:turrets]">
        <Select
          required
          size="xs"
          aria-label="Turrets"
          data={turretSelect}
          onChange={(value) => updateOreRow(data.id, { turrets: parseInt(value) })}
          value={turrets.toString()}
        />
      </div>
      <div className="flex items-center gap-2 [grid-area:time]">
        {/* the dot keeps its space while paused or depleted, so every time value starts on the same line */}
        <span aria-hidden="true" className={cx('relative flex size-2 shrink-0', !data.running && 'invisible')}>
          {data.running && (
            <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
          )}
          <span className="relative size-2 rounded-full bg-accent" />
        </span>
        {depleted ? (
          <span className="text-sm font-medium text-muted">Depleted</span>
        ) : (
          <BandValue
            band={bands.timeBands}
            format={secToTime}
            className={data.running ? '[&>span:first-child]:text-accent' : undefined}
          />
        )}
      </div>
      <div className="flex justify-end gap-2 [grid-area:actions]">
        {!depleted &&
          (data.running ? (
            <IconButton variant="secondary" onClick={() => updateOreRow(data.id, { running: false })} title="Pause">
              <Icon name="player-pause-filled" />
            </IconButton>
          ) : (
            <IconButton variant="primary" onClick={() => updateOreRow(data.id, { running: true })} title="Start">
              <Icon name="player-play-filled" />
            </IconButton>
          ))}
        <IconButton variant="danger" onClick={() => deleteOreRow(data.id)} title="Delete row">
          <Icon name="x" />
        </IconButton>
      </div>
      {/* fixed slots and fixed decimals, so the ticking values never push their neighbours around */}
      {/* narrow windows stack the figures so nothing gets cut off */}
      <p className="grid grid-cols-1 gap-x-4 gap-y-0.5 text-xs text-subtle [grid-area:stats] sm:grid-cols-2 sm:whitespace-nowrap lg:grid-cols-[8rem_10rem_15rem_15rem] sm:[&>span]:truncate">
        <span className="tabular">
          <span className="text-muted">
            <Number maximumFractionDigits={0} value={oreSize} /> m³
          </span>{' '}
          volume
        </span>
        <span>
          <BandValue inline band={bands.cyclesBands} options={fixedDecimals} /> cycles
        </span>
        <span>
          <BandValue inline band={bands.critBonusTotalBands} unit="m³" options={fixedDecimals} /> crit bonus
        </span>
        <span>
          <BandValue inline band={bands.residueTotalBands} unit="m³" options={fixedDecimals} /> residue
        </span>
      </p>
    </div>
  )
})
