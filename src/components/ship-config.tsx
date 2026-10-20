import type { FunctionComponent } from 'preact'
import { useMemo, useState } from 'preact/hooks'
import { getMiningStats } from '../utils/mining-math.ts'
import { simulateCargoBands } from '../utils/mining-sim.ts'
import { useShipStore } from '../utils/use-ship-store.ts'
import { secToTime } from '../utils/sec-to-time/sec-to-time.tsx'
import { BandValue } from './band-value.tsx'
import { SoundSettingsModal } from './sound-settings-modal.tsx'
import { IconButton } from './ui/button.tsx'
import { NumberInput } from './ui/inputs.tsx'
import { Tooltip } from './ui/tooltip.tsx'
import { Icon } from './ui/icon.tsx'
import { captionHeadingClasses } from './ui/typography.ts'

const groupHeadingClasses = `mb-3 ${captionHeadingClasses}`

export const ShipConfig: FunctionComponent = () => {
  const { ship, setShip, resetShip } = useShipStore()
  const [soundModalOpened, setSoundModalOpened] = useState(false)
  // stable reference, otherwise the simulation memo below never hits
  const stats = useMemo(() => getMiningStats(ship), [ship])

  const cargoBands = useMemo(
    () =>
      simulateCargoBands({
        cargoSize: ship.cargoSize,
        stats,
        turrets: ship.numberOfTurrets,
        seed: ship.name ?? 'cargo',
      }),
    [ship.cargoSize, ship.numberOfTurrets, ship.name, stats],
  )

  return (
    <section aria-labelledby="ship-heading" className="rounded-xl border border-line bg-panel">
      <SoundSettingsModal opened={soundModalOpened} onClose={() => setSoundModalOpened(false)} />
      <div className="flex items-center justify-between border-b border-line py-2 pr-2 pl-4">
        <h2 id="ship-heading" className="text-sm font-semibold">
          Ship
        </h2>
        <div className="flex gap-0.5">
          <IconButton size="md" onClick={() => setSoundModalOpened(true)} title="Alert sounds">
            <Icon name="volume" />
          </IconButton>
          <IconButton size="md" onClick={() => resetShip()} title="Reset to default ship values">
            <Icon name="repeat" />
          </IconButton>
        </div>
      </div>

      <div className="grid gap-6 p-4 md:grid-cols-[4fr_3fr] xl:grid-cols-1">
        <div>
          <h3 className={groupHeadingClasses}>Fitting</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-2">
            <NumberInput
              label={
                <Tooltip label="Per-cycle yield of one fitted laser, strip miner or ice harvester, from Show Info. Don't add drone yield: drones get no crits.">
                  Yield / turret
                </Tooltip>
              }
              required
              value={ship.yieldPerTurret}
              thousandSeparator
              allowNegative={false}
              suffix=" m³"
              onChange={(yieldPerTurret) => setShip({ ...ship, yieldPerTurret })}
            />
            <NumberInput
              label={
                <Tooltip label="Cycle time of the fitted module, from Show Info. Since Catalyst the base is 15 s for lasers and 45 s for strip miners; ice harvesters kept theirs.">
                  Cycle duration
                </Tooltip>
              }
              required
              value={ship.turretCycleDuration}
              thousandSeparator
              allowNegative={false}
              suffix=" s"
              onChange={(turretCycleDuration) => setShip({ ...ship, turretCycleDuration })}
            />
            <NumberInput
              label="Turrets"
              required
              value={ship.numberOfTurrets}
              min={1}
              thousandSeparator
              allowDecimal={false}
              allowNegative={false}
              onChange={(numberOfTurrets) => setShip({ ...ship, numberOfTurrets })}
            />
            <NumberInput
              label="Cargo hold"
              required
              value={ship.cargoSize}
              thousandSeparator
              allowDecimal={false}
              allowNegative={false}
              suffix=" m³"
              onChange={(cargoSize) => setShip({ ...ship, cargoSize })}
            />
          </div>
        </div>

        <div>
          <h3 className={groupHeadingClasses}>Modifiers</h3>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label={
                <Tooltip label="From Show Info on the fitted module: 0% on T1, 34% on T2, plus the crystal's (Type A II +3.6%, Type B II +30%). Mining Survey Chipset II lowers it by 20%, e.g. 34% → 27.2%.">
                  Residue chance
                </Tooltip>
              }
              required
              value={ship.residueChancePercent ?? 0}
              min={0}
              max={100}
              step={0.1}
              allowNegative={false}
              suffix="%"
              onChange={(residueChancePercent) => setShip({ ...ship, residueChancePercent })}
            />
            <NumberInput
              label={
                <Tooltip label="Extra volume destroyed in the asteroid when residue triggers, as a multiple of the cycle yield. 1× for every module and Type A/B crystal; only Type C crystals raise it.">
                  Residue volume
                </Tooltip>
              }
              required
              value={ship.residueMultiplier ?? 1}
              min={0}
              step={0.1}
              allowNegative={false}
              suffix="×"
              onChange={(residueMultiplier) => setShip({ ...ship, residueMultiplier })}
            />
            <NumberInput
              label={
                <Tooltip label="Base 1%. Mining Precision adds 10% per level (1.5% at V), Mining Survey Chipset II another 20% (1.8%), Consortium Issue hulls 50%. Not for mining drones or gas.">
                  Critical chance
                </Tooltip>
              }
              required
              value={ship.critChancePercent ?? 0}
              min={0}
              max={100}
              step={0.1}
              allowNegative={false}
              suffix="%"
              onChange={(critChancePercent) => setShip({ ...ship, critChancePercent })}
            />
            <NumberInput
              label={
                <Tooltip label="Extra ore on a critical success, on top of the cycle yield. Base 200%, Mining Exploitation adds 5% per level (250% at V), Mining Survey Chipset II another 20% (300%).">
                  Crit bonus yield
                </Tooltip>
              }
              required
              value={ship.critBonusYieldPercent ?? 200}
              min={0}
              step={1}
              allowNegative={false}
              suffix="%"
              onChange={(critBonusYieldPercent) => setShip({ ...ship, critBonusYieldPercent })}
            />
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 border-t border-line p-4 md:grid-cols-[auto_auto_1fr] md:items-end md:gap-x-10 xl:grid-cols-2 xl:gap-x-3">
        <div>
          <dt className="mb-1 text-xs text-subtle">Cargo / sec</dt>
          <dd>
            <BandValue band={cargoBands.cargoPerSecondBands} unit="m³" options={{ maximumFractionDigits: 2 }} />
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-xs text-subtle">Cargo full in</dt>
          <dd>
            <BandValue band={cargoBands.cargoFullTimeBands} format={secToTime} />
          </dd>
        </div>
        <p className="col-span-2 text-xs text-subtle md:col-span-1 md:justify-self-end xl:col-span-2 xl:justify-self-start">
          <Tooltip label="Low / high are mean − 1σ and mean + 1σ, simulated from your crit and residue chances.">
            Smaller figures show the likely range.
          </Tooltip>
        </p>
      </dl>
    </section>
  )
}
