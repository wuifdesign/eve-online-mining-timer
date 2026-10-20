import type { FunctionComponent } from 'preact'

// raw svg sources from src/assets/icons, bundled at build time
const files = import.meta.glob<string>('../../assets/icons/*.svg', { query: '?raw', import: 'default', eager: true })

type ParsedIcon = {
  attributes: Record<string, string>
  body: string
}

// split each file into its root <svg> attributes and inner markup, so the root can be rendered as a real element
const icons: Record<string, ParsedIcon> = {}
for (const [path, source] of Object.entries(files)) {
  const name = path.slice(path.lastIndexOf('/') + 1, -'.svg'.length)
  const match = source.match(/<svg([^>]*)>([\s\S]*)<\/svg>/)
  if (!match) {
    continue
  }
  const attributes: Record<string, string> = {}
  for (const [, key, value] of match[1].matchAll(/([\w:-]+)="([^"]*)"/g)) {
    if (key !== 'xmlns') {
      attributes[key] = value
    }
  }
  icons[name] = { attributes, body: match[2].trim() }
}

export type IconName =
  | 'arrows-minimize'
  | 'chevron-down'
  | 'clipboard-text'
  | 'github'
  | 'message-report'
  | 'package-export'
  | 'player-pause-filled'
  | 'player-play'
  | 'player-play-filled'
  | 'repeat'
  | 'trash'
  | 'volume'
  | 'x'

export type IconProps = {
  name: IconName
  // defaults to 1em so the icon follows the surrounding font size
  size?: number | string
  className?: string
}

// decorative by default: icon-only buttons carry their accessible name on the button itself
export const Icon: FunctionComponent<IconProps> = ({ name, size = '1em', className }) => {
  const icon = icons[name]
  return (
    <svg
      {...icon.attributes}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={className}
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  )
}
