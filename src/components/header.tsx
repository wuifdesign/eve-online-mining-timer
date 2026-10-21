import type { FunctionComponent } from 'preact'
import logo from '../assets/logo.png'
import { Button } from './ui/button.tsx'
import { Icon } from './ui/icon.tsx'

export const Header: FunctionComponent = () => {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {/* 47×48 source, shown at 24px tall for 2x screens */}
          <img alt="" src={logo} width={23} height={24} className="h-6 w-auto" />
          <h1 className="truncate text-[15px] font-semibold">
            <span className="text-muted max-sm:sr-only">EVE Online </span>Mining Timer
          </h1>
        </div>
        <nav className="flex gap-1">
          <Button
            target="_blank"
            href="https://github.com/wuifdesign/eve-online-mining-timer/issues"
            variant="ghost"
            size="sm"
            leftSection={<Icon name="message-report" />}
          >
            Issues
          </Button>
          <Button
            target="_blank"
            href="https://github.com/wuifdesign/eve-online-mining-timer"
            variant="ghost"
            size="sm"
            leftSection={<Icon name="github" />}
          >
            GitHub
          </Button>
        </nav>
      </div>
    </header>
  )
}
