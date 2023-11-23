import * as React from 'react'
import { Box, Textarea } from '@mantine/core'
import { parseScannerResult, ScannerResultType } from '../utils/parse-scanner-result/parse-scanner-result.tsx'

export type ScannerResultPasteInputProps = {
  onPaste: (result: ScannerResultType[]) => void
}

export const ScannerResultPasteInput: React.FC<ScannerResultPasteInputProps> = ({ onPaste }) => {
  return (
    <Box mt="md">
      <Textarea
        value=""
        placeholder="Paste survey scanner result here..."
        autoComplete="off"
        rows={3}
        styles={{
          input: {
            border: 0,
            background: '#fff',
          },
        }}
        onInput={(event) => {
          onPaste(parseScannerResult(event.currentTarget.value))
        }}
      />
    </Box>
  )
}
