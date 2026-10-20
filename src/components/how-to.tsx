import type { FunctionComponent } from 'preact'
import { modKey } from '../utils/mod-key.ts'

const linkClasses = 'text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent'

export const HowTo: FunctionComponent = () => {
  return (
    <section className="grid gap-8 px-1 py-2 text-sm leading-relaxed text-muted md:grid-cols-2">
      <div>
        <h2 className="mb-2 text-sm font-semibold text-fg">How to use</h2>
        <p className="max-w-[65ch]">
          Use the survey scanner results to generate pre-filled rows. Copy the selected survey scanner result with{' '}
          <b className="font-medium text-fg">{modKey} + C</b> and paste it into the field above with{' '}
          <b className="font-medium text-fg">{modKey} + V</b>. Press start on the asteroid you lock to count it down.
        </p>
      </div>
      <div>
        <h2 className="mb-2 text-sm font-semibold text-fg">Mining update notes</h2>
        <ul className="max-w-[65ch] list-disc space-y-1 pl-5 marker:text-subtle">
          <li>
            Since Catalyst (Nov 2025) mining lasers and strip miners cycle 4× faster with a quarter of the yield per
            cycle. Ice harvesters keep their cycle time. Enter the current values from Show Info on the fitted module.
          </li>
          <li>
            Critical successes add bonus ore to your cargo without reducing the asteroid. Each turret rolls its own.
          </li>
          <li>
            Only lasers, strip miners and ice harvesters can crit. Mining drones and gas harvesters can&rsquo;t, so
            leave drone yield out of the ship values.
          </li>
          <li>
            Residue destroys extra ore in the asteroid without reducing your cargo, so rocks empty faster than your hold
            fills.
          </li>
          <li>
            Prismaticite from phased asteroid fields only mines at full yield while a Mobile Phase Anchor is active. The
            timer assumes it is.
          </li>
        </ul>
        <p className="mt-3">
          References:{' '}
          <a
            className={linkClasses}
            href="https://www.eveonline.com/news/view/catalyst-expansion-notes"
            target="_blank"
            rel="noreferrer"
          >
            Catalyst expansion notes
          </a>
          ,{' '}
          <a className={linkClasses} href="https://wiki.eveuniversity.org/Mining" target="_blank" rel="noreferrer">
            EVE University Wiki
          </a>
        </p>
      </div>
    </section>
  )
}
