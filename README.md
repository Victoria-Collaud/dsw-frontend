# dsw-frontend

### Dependencias del Frontend

El frontend está construido con React y TypeScript, utilizando Vite como empaquetador. Las dependencias principales son:

*   **Librerías Principales (Dependencies):**
    *   `react` y `react-dom`: Biblioteca principal para construir la interfaz de usuario.
    *   `react-router-dom`: Para manejar la navegación entre páginas sin recargar el navegador.
    *   `sweetalert2`: Para mostrar alertas y modales elegantes (reemplazando los `alert()` nativos).
*   **Herramientas de Desarrollo y testing (DevDependencies):**
    *   `vite`: Empaquetador y servidor de desarrollo ultrarrápido.
    *   `typescript`: Lenguaje que añade tipado estático a JavaScript.
    *   `@vitejs/plugin-react`: Plugin oficial de React para Vite.
    *   `eslint` y sus plugins (`@eslint/js`, `eslint-plugin-react-hooks`, etc.): Herramientas de análisis de código para mantener buenas prácticas.
    *   `@types/react`, `@types/react-dom`, `@types/node`: Definiciones de tipos para TypeScript.
    *   **Testing Unitario:** `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`.
    *   **Testing E2E:** `@playwright/test`.
*(Nota: Para instalar todas estas dependencias, ejecutá `pnpm install` dentro de la carpeta `cine-frontend`).*
