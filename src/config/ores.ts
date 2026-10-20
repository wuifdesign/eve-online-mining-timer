export const oreSizes = {
  // Basic Ore
  Arkonor: 16,
  Bezdnacine: 16,
  Bistot: 16,
  Crokite: 16,
  'Dark Ochre': 8,
  Ducinium: 16,
  Eifyrium: 16,
  Gneiss: 5,
  Hedbergite: 3,
  Hemorphite: 3,
  Jaspet: 2,
  Kernite: 1.2,
  Mercoxit: 40,
  Mordunium: 0.1,
  Omber: 0.6,
  Plagioclase: 0.35,
  Pyroxeres: 0.3,
  Rakovene: 16,
  Scordite: 0.15,
  Spodumain: 16,
  Talassonite: 16,
  Veldspar: 0.1,
  Ytirium: 0.6,
  Kylixium: 1.2,

  // Nullsec prospecting ores (YC126)
  Griemeer: 0.8,
  Hezorime: 5,
  Nocxite: 4,
  Ueganite: 5,

  // Erratic Ore (Catalyst, phased asteroid fields)
  Prismaticite: 40,

  // Mission Ores
  Augumene: 0.3,
  Banidine: 0.1,
  Geodite: 16,
  'Green Arisite': 5,
  Lyavite: 1.2,
  Mercium: 0.6,
  Oeryl: 8,
  Pithix: 2,
  Polygypsum: 16,

  // Ice Ores
  'Clear Icicle': 1000,
  'White Glaze': 1000,
  'Blue Ice': 1000,
  'Glacial Mass': 1000,
  'Glare Crust': 1000,
  'Dark Glitter': 1000,
  Gelidus: 1000,
  Krystallos: 1000,

  // Moon Ores
  Bitumens: 10,
  Coesite: 10,
  Sylvite: 10,
  Zeolites: 10,
  Cobaltite: 10,
  Euxenite: 10,
  Scheelite: 10,
  Titanite: 10,
  Chromite: 10,
  Otavite: 10,
  Sperrylite: 10,
  Vanadinite: 10,
  Carnotite: 10,
  Cinnabar: 10,
  Pollucite: 10,
  Zircon: 10,
  Loparite: 10,
  Monazite: 10,
  Xenotime: 10,
  Ytterbite: 10,
}

export const oreNames = Object.keys(oreSizes).sort()

// ice compresses to 10% of its volume, every other ore to 1%
const iceOres: ReadonlySet<string> = new Set([
  'Clear Icicle',
  'White Glaze',
  'Blue Ice',
  'Glacial Mass',
  'Glare Crust',
  'Dark Glitter',
  'Gelidus',
  'Krystallos',
])

export const getCompressionRatio = (oreType: string) => {
  return iceOres.has(oreType) ? 10 : 100
}

// known ores use the table, unknown ones the unit volume taken from the scanner paste
export const getOreUnitSize = (oreType: string, unitVolume?: number) => {
  return oreSizes[oreType as keyof typeof oreSizes] ?? unitVolume ?? 0
}
