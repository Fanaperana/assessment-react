// Settings for the mock server.
// In the browser you can change them from the DevTools console, for example:
//   localStorage.setItem('flowboard:failRate', '0.5')  // 50% of writes fail
//   localStorage.setItem('flowboard:delay', '2000')    // every request waits 2 s
//   localStorage.removeItem('flowboard:db')            // reset the data
// Then reload the page.

export const mockConfig = {
  /** Minimum and maximum delay of each response, in ms. */
  minDelay: 300,
  maxDelay: 800,
  /** Probability (0 to 1) that a write request (POST, PATCH, DELETE) fails with 500. */
  failRate: 0.1,
  /** Save the data in localStorage so it survives a reload. */
  persist: true,
}

export function loadBrowserOverrides() {
  try {
    const failRate = localStorage.getItem('flowboard:failRate')
    const delay = localStorage.getItem('flowboard:delay')
    if (failRate !== null) mockConfig.failRate = Number(failRate)
    if (delay !== null) mockConfig.minDelay = mockConfig.maxDelay = Number(delay)
  } catch {
    // Storage is not available. Keep the defaults.
  }
}
