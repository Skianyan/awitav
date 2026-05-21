const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''

export const env = {
  apiBaseUrl,
  useMock: import.meta.env.VITE_USE_MOCK === 'true',
}
