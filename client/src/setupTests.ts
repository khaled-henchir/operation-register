import "@testing-library/jest-dom"

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
})

// Mock navigator.onLine
Object.defineProperty(navigator, "onLine", {
  writable: true,
  value: true,
})

// Mock console methods to reduce test noise
const originalConsoleError = console.error
const originalConsoleWarn = console.warn
const originalConsoleLog = console.log

// Suppress console output during tests unless explicitly needed
console.error = (...args: any[]) => {
  if (process.env.DEBUG) {
    originalConsoleError(...args)
  }
}

console.warn = (...args: any[]) => {
  if (process.env.DEBUG) {
    originalConsoleWarn(...args)
  }
}

console.log = (...args: any[]) => {
  if (process.env.DEBUG) {
    originalConsoleLog(...args)
  }
}

// Restore console methods after tests
afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
  console.log = originalConsoleLog
})

