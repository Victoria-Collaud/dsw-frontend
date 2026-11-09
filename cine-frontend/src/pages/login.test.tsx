import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from './login';
import * as authServices from '../services/authServices';
import '@testing-library/jest-dom/vitest';
import Swal from 'sweetalert2';

// Mockeamos SweetAlert2 para evitar errores de window.matchMedia
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

// Mockeamos el hook useNavigate de react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mockeamos el servicio de login
vi.mock('../services/authServices', () => ({
  login: vi.fn(),
}));

describe('Login Component', () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();

    // Limpiamos el localStorage antes de cada test
    localStorage.clear();
  });

  it('debe renderizar el formulario correctamente', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Verificamos que los campos y el botón existan
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
  });

  it('debe llamar a la función login con los datos ingresados y guardar el token', async () => {
    const user = userEvent.setup();
    
    // Simulamos que el backend responde con éxito
    const mockLoginResponse = {
      token: 'fake-token-123',
      usuario: { idUsuario: 1, email: 'juan@test.com', rol: 'CLIENTE' }
    };
    vi.mocked(authServices.login).mockResolvedValueOnce(mockLoginResponse);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    
    await user.clear(emailInput);
    await user.type(emailInput, 'juan@test.com');
    await user.clear(passwordInput);
    await user.type(passwordInput, '123456');
    
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    // Verificamos que se llamó al servicio con los datos correctos
    expect(authServices.login).toHaveBeenCalledWith({
      email: 'juan@test.com',
      contrasena: '123456',
    });

    // Verificamos que se guardó en el localStorage
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-token-123');
    });
  });

  it('debe mostrar un mensaje de error si el login falla', async () => {
    const user = userEvent.setup();
    
    // Simulamos que el backend responde con error
    vi.mocked(authServices.login).mockRejectedValueOnce(new Error('Credenciales inválidas'));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    await user.clear(emailInput);
    await user.type(emailInput, 'error@mail.com');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'wrongpass');

    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    // Verificamos que aparezca el cartel de error en pantalla
     await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          // El texto que uses dentro del Swal en tu Login.tsx
          text: 'Credenciales inválidas' 
        })
      );
    });
  });
});