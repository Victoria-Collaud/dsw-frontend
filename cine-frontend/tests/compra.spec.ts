import { test, expect } from '@playwright/test';

test('Flujo completo: iniciar sesión, comprar una entrada para Shrek y verificar éxito', async ({ page }) => {
  // ============ LOGIN ============
  await page.goto('/login');

  // Completamos el formulario de login
  // (Asegurate de que estos labels coincidan con tu Login.tsx)
  await page.getByLabel('Email:').fill('juan@test.com'); // Usuario real 
  await page.getByLabel('Contraseña:').fill('123456');   // Contraseña real
  await page.getByRole('button', { name: 'Ingresar' }).click();

  // Verificamos que el login fue exitoso (el navbar debería mostrar el nombre del usuario)
  // O simplemente esperamos a que redirija al inicio
  await page.waitForURL('/');

  // ============ IR A LA CARTELERA ============
  await page.goto('/peliculas');

  // Esperamos a que carguen las películas y hacemos clic en "Shrek"
  await page.getByText('Shrek', { exact: true }).first().click();

  // ============ SELECCIONAR FUNCIÓN ============
  // Verificamos que estamos en el detalle de la película
  await expect(page.getByRole('heading', { level: 1, name: 'Shrek' })).toBeVisible(); //level 1 es el h1

  // Hacemos clic en el primer botón de "Comprar Entrada"
  await page.getByRole('link', { name: 'Comprar Entrada' }).first().click();

  // ============  FINALIZAR COMPRA ============
  // Verificamos que estamos en la página de compra
  await expect(page.getByRole('heading', { name: 'Finalizar Compra' })).toBeVisible();


  // Hacer clic en "Confirmar y Pagar"
  await page.getByRole('button', { name: 'Confirmar y Pagar' }).click();

  // ============  VERIFICAR ÉXITO ============
  // Verificamos que redirija a la página de éxito
   await page.waitForURL('/'); 
});