import { test, expect } from '@playwright/test';

test('Flujo completo: iniciar sesión, comprar una entrada para Shrek y verificar éxito', async ({ page }) => {
  // ============ PASO 1: LOGIN ============
  await page.goto('/login');

  // Completamos el formulario de login
  // (Asegurate de que estos labels coincidan con tu Login.tsx)
  await page.getByLabel('Email:').fill('juan@test.com'); // 👈 Usá un usuario REAL de tu BD
  await page.getByLabel('Contraseña:').fill('123456');   // 👈 Usá la contraseña REAL
  await page.getByRole('button', { name: 'Ingresar' }).click();

  // Verificamos que el login fue exitoso (el navbar debería mostrar el nombre del usuario)
  // O simplemente esperamos a que redirija al inicio
  await page.waitForURL('/');

  // ============ PASO 2: IR A LA CARTELERA ============
  await page.goto('/peliculas');

  // Esperamos a que carguen las películas y hacemos clic en "Shrek"
  await page.getByText('Shrek', { exact: true }).first().click();

  // ============ PASO 3: SELECCIONAR FUNCIÓN ============
  // Verificamos que estamos en el detalle de la película
  await expect(page.getByRole('heading', { level: 1, name: 'Shrek' })).toBeVisible(); //level 1 es el h1

  // Hacemos clic en el primer botón de "Comprar Entrada"
  await page.getByRole('link', { name: 'Comprar Entrada' }).first().click();

  // ============ PASO 4: FINALIZAR COMPRA ============
  // Verificamos que estamos en la página de compra
  await expect(page.getByRole('heading', { name: 'Finalizar Compra' })).toBeVisible();

  // (Opcional) Seleccionar una cantidad de entradas
  // await page.getByLabel('Cantidad de Entradas:').fill('2');

  // Hacer clic en "Confirmar y Pagar"
  await page.getByRole('button', { name: 'Confirmar y Pagar' }).click();

  // ============ PASO 5: VERIFICAR ÉXITO ============
  // Verificamos que aparezca el mensaje de éxito
  await expect(page.getByText('¡Compra exitosa! Redirigiendo...')).toBeVisible();
});