import "@testing-library/jest-dom"
import { jest } from "@jest/globals"

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

// Mock IndexedDB
const indexedDB = {
  open: jest.fn().mockReturnValue({
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
    result: {
      transaction: jest.fn().mockReturnValue({
        objectStore: jest.fn().mockReturnValue({
          put: jest.fn(),
          add: jest.fn(),
          get: jest.fn(),
          getAll: jest.fn(),
          delete: jest.fn(),
          clear: jest.fn(),
          count: jest.fn(),
        }),
      }),
      createObjectStore: jest.fn(),
    },
  }),
}

Object.defineProperty(window, "indexedDB", {
  value: indexedDB,
})

// Mock navigator.onLine
Object.defineProperty(navigator, "onLine", {
  writable: true,
  value: true,
})

