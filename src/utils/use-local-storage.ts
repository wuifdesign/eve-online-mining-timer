import { useCallback, useEffect, useMemo, useState } from 'preact/hooks'

// values are stored as JSON, same format as the previously used @mantine/hooks useLocalStorage

const listeners = new Map<string, Set<() => void>>()

const notify = (key: string) => {
  listeners.get(key)?.forEach((listener) => listener())
}

const subscribe = (key: string, listener: () => void) => {
  let keyListeners = listeners.get(key)
  if (!keyListeners) {
    keyListeners = new Set()
    listeners.set(key, keyListeners)
  }
  keyListeners.add(listener)

  // keep other tabs in sync
  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) {
      listener()
    }
  }
  window.addEventListener('storage', onStorage)

  return () => {
    keyListeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

const readRaw = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

const parse = <T>(raw: string | null, defaultValue: T): T => {
  if (raw === null) {
    return defaultValue
  }
  try {
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const [raw, setRaw] = useState(() => readRaw(key))
  useEffect(() => {
    const sync = () => setRaw(readRaw(key))
    // the key may have changed or been written between render and subscribe
    sync()
    return subscribe(key, sync)
  }, [key])
  const value = useMemo(() => parse(raw, defaultValue), [raw, defaultValue])

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(parse(readRaw(key), defaultValue)) : next
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved))
      } catch {
        // storage unavailable (private mode, quota), value is lost on reload
      }
      notify(key)
    },
    [key, defaultValue],
  )

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // storage unavailable
    }
    notify(key)
  }, [key])

  return [value, setValue, removeValue] as const
}
