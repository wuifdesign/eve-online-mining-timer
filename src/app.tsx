import * as React from 'react'
import { Box, Button, Container, createTheme, MantineProvider, Text } from '@mantine/core'
import { useEffect } from 'react'
import { TbTrash } from 'react-icons/tb'
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

const theme = createTheme({})

export const App: React.FC = () => {
  const { ship } = useShipStore()
  const { oreRows, addOreRows, deleteEmptyOreRows } = useOreRows()

  useEffect(() => {
    startTimerInterval(ship)
    return () => {
      stopTimerInterval()
    }
  }, [ship])

  return (
    <MantineProvider forceColorScheme="dark" theme={theme}>
      <Header />
      <Container size="xl">
        <ShipConfig />
        <CargoInfo ship={ship} />
        <div style={{ border: '1px solid var(--mantine-color-dark-4)' }}>
          <OreRowInfo />
          {oreRows.length > 0 ? (
            <>
              {oreRows.map((item, index) => (
                <OreRow key={item.id} ship={ship} index={index} data={item} />
              ))}
            </>
          ) : (
            <Text ta="center" my="sm" c="dimmed">
              Start by pasting your scanner result in the textarea below
            </Text>
          )}
        </div>
        {oreRows.length > 0 && (
          <Box mt="xs" ta="right">
            <Button
              leftSection={<TbTrash />}
              size="compact-xs"
              color="red"
              variant="outline"
              onClick={() => deleteEmptyOreRows()}
            >
              Delete rows where there is no remaining ore
            </Button>
          </Box>
        )}
        <ScannerResultPasteInput
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
        <HowTo />
      </Container>
      <Footer />
    </MantineProvider>
  )
}
