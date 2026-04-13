import { defineConfig, devices } from '@playwright/test';

/**
 * playwright.config.ts
 * 
 * Configuración de Playwright para E2E testing de flujos críticos
 * Enfoque: flujo de reserva, conflicto de race condition, cancelación
 */

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Ejecutar tests sequencialmente para evitar conflicts en BD de test
  forbidOnly: !!process.env.CI, // En CI, No permitir .only
  retries: process.env.CI ? 2 : 0, // Reintentar 2 veces en CI
  workers: process.env.CI ? 1 : 1, // 1 worker para evitar race conditions

  reporter: 'html',
  
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry', // Capturar trace solo en primer reintento
    screenshot: 'only-on-failure', // Capturar screenshot solo en fallos
  },

  webServer: {
    command: process.env.CI ? '' : 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutos para esperar a que el server esté listo
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // === MOBILE TESTING ===
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  timeout: 30 * 1000, // 30 segundos por test
  expect: {
    timeout: 5 * 1000, // 5 segundos para assertions
  },
});
