import type { FunctionComponent } from 'preact'
import { Tooltip } from './ui/tooltip.tsx'

export const oreRowGridClasses =
  'grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_4.5rem] gap-x-3 gap-y-2 [grid-template-areas:"label_label_label""ore_count_turrets""time_time_actions""stats_stats_stats"] md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,1fr)_4.5rem_minmax(0,1fr)_4.5rem] md:[grid-template-areas:"label_ore_count_turrets_time_actions""stats_stats_stats_stats_stats_stats"]'

export const OreRowInfo: FunctionComponent = () => {
  return (
    <div
      className={`${oreRowGridClasses} hidden border-b border-line px-4 py-2.5 text-xs font-medium text-subtle md:grid`}
    >
      <div className="[grid-area:label]">Label</div>
      <div className="[grid-area:ore]">Ore</div>
      <div className="[grid-area:count]">Units left</div>
      <div className="[grid-area:turrets]">Turrets</div>
      <div className="[grid-area:time]">
        <Tooltip label="Average time to deplete, with the likely range (mean ± 1σ) below it">Time left</Tooltip>
      </div>
    </div>
  )
}
