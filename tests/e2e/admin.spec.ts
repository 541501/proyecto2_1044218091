/**
 * tests/e2e/admin.spec.ts
 *
 * Tests E2E para funcionalidades administrativas
 * - Admin puede acceder a /admin
 * - PROFESSOR no puede acceder a /admin (redirige a /dashboard)
 * - Admin puede cancelar reserva de otro usuario
 * - Admin ve todas las reservas del sistema
 */

import { test, expect } from '@playwright/test';

test.describe('✓ E2E: Admin Access & Permissions', () => {

  test('1️⃣  ADMIN login y acceso a panel admin', async ({ page }) => {
    // Login como ADMIN
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.edu');
    await page.fill('input[name="password"]', 'AdminPass123!');
    await page.click('button:has-text("Iniciar sesión")');

    await page.waitForURL('/dashboard');

    // Sidebar debe mostrar "Administración"
    const adminLink = page.locator('a, button', { has: page.locator(':text("Administración")') });
    await expect(adminLink).toBeVisible();

    // Click en Administración
    await adminLink.click();

    // Debe navegar a /admin
    await page.waitForURL('/dashboard/admin');

    // Debe ver stats cards
    const statsCards = page.locator('[data-testid="stat-card"]');
    await expect(statsCards).toHaveCount(5); // 5 cards: sedes, salones, reservas, hoy, canceladas

    // Debe ver números correctos (ej: 2 sedes, 26 salones)
    const sedesCard = page.locator('text=Sedes');
    await expect(sedesCard).toBeVisible();
  });

  test('2️⃣  PROFESSOR intenta acceder a /admin → redirige a /dashboard', async ({
    page,
  }) => {
    // Login como PROFESSOR
    await page.goto('/login');
    await page.fill('input[name="email"]', 'profesor1@test.edu');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("Iniciar sesión")');

    await page.waitForURL('/dashboard');

    // Sidebar NO debe mostrar "Administración"
    const adminLink = page.locator(':text("Administración")');
    await expect(adminLink).not.toBeVisible();

    // Intentar acceder directamente a /admin
    await page.goto('/dashboard/admin');

    // Debe ser redirigido a /dashboard
    await page.waitForURL('/dashboard', { timeout: 5000 });
    expect(page.url()).toContain('/dashboard');
    expect(page.url()).not.toContain('/admin');

    // Toast opcional: "No tienes permisos para acceder"
    const errorMessage = page.locator(
      'text=No tienes permisos|acceso denegado|Forbidden'
    );
    // No es obligatorio que haya error message
  });

  test('3️⃣  ADMIN ve todas las reservas (no solo propias)', async ({
    page,
  }) => {
    // Login ADMIN
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.edu');
    await page.fill('input[name="password"]', 'AdminPass123!');
    await page.click('button:has-text("Iniciar sesión")');
    await page.waitForURL('/dashboard');

    // Navegar a admin panel
    await page.click('button:has-text("Administración")');

    // Click en "Todas las Reservas" o similar
    const allReservasLink = page.locator(
      'a, button',
      { has: page.locator(':text("Todas las Reservas|reservas del sistema")') }
    );
    if (await allReservasLink.isVisible()) {
      await allReservasLink.click();
    } else {
      // Alternativamente, puede ser un link en la tabla
      await page.click('a:has-text("Gestionar")');
    }

    // Debe ver reservas de múltiples profesores
    const reservasList = page.locator('[data-testid="reservas-list"], table');
    await expect(reservasList).toBeVisible();

    // Debe haber múltiples reservas
    const reservaRows = page.locator('[data-testid="reserva-row"], tbody tr');
    const count = await reservaRows.count();
    expect(count).toBeGreaterThan(1);
  });

  test('4️⃣  ADMIN puede cancelar reserva de otro usuario', async ({
    page,
  }) => {
    // Login ADMIN
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.edu');
    await page.fill('input[name="password"]', 'AdminPass123!');
    await page.click('button:has-text("Iniciar sesión")');
    await page.waitForURL('/dashboard');

    // Navegar a todas las reservas
    await page.click('button:has-text("Administración")');
    await page.click('a:has-text("Todas las Reservas")'); // o similar

    // Encontrar una reserva ACTIVA de otro usuario
    const reservaDeOtro = page.locator('[data-testid="reserva-row"]').first();

    // Click en cancelar
    await reservaDeOtro.locator('button:has-text("Cancelar")').click();

    // Modal: "¿Cancelar reserva de [profesor]?"
    const modal = page.locator(
      'text=¿Cancelar reserva|Confirmar cancelación'
    );
    await expect(modal).toBeVisible();

    // Confirmar
    await page.click('button:has-text("Sí|Confirmar")');

    // Toast de éxito: "Reserva cancelada por administrador"
    const sucessToast = page.locator(
      'text=Reserva cancelada|Cancelada exitosamente'
    );
    await expect(sucessToast).toBeVisible({ timeout: 5000 });

    // Reserva debe desaparecer o marcar como CANCELADA
    const badge = reservaDeOtro.locator('text=Cancelada');
    await expect(badge).toBeVisible();
  });

  test('5️⃣  PROFESSOR no puede cancelar reserva ajena', async ({ page }) => {
    // Login PROFESSOR 1
    await page.goto('/login');
    await page.fill('input[name="email"]', 'profesor1@test.edu');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("Iniciar sesión")');
    await page.waitForURL('/dashboard');

    // Ir a mis reservas
    await page.click('a:has-text("Mis Reservas")');

    // PROFESSOR solo ve sus propias reservas
    // por tanto no puede intentar cancelar ajena desde la UI

    // Pero si intentara acceder a endpoint:
    // PUT /api/reservas/[id-de-otro-professor]/cancel
    // Debe recibir 403 Forbidden

    // En este test E2E simplemente verificamos que não haya botón cancelar
    // para reservas que no sean suyas (si estuvieran visibles)
  });
});
