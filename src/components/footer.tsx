import type { FunctionComponent } from 'preact'
import { Tooltip } from './ui/tooltip.tsx'

export const Footer: FunctionComponent = () => {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-1 px-4 py-6 text-sm text-subtle md:flex-row md:items-center md:justify-between md:px-6">
        <p>
          Tool created by <span className="font-medium text-muted">Marumis Wuif</span>, with the help of{' '}
          <Tooltip label="For the Nov 2025 mining mechanics updates (Catalyst expansion)">
            <span className="font-medium text-muted">Ryuuki Ran</span>
          </Tooltip>
        </p>
        <p>Feel free to send me questions, suggestions or donations of ISK in game.</p>
      </div>
    </footer>
  )
}
