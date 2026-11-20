import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/authServices'; // Ajusta la ruta a tu servicio si es necesario
import { useAlerta } from '../hooks/useAlerta.ts';
import { useForm } from 'react-hook-form';
import '../pages/Login.css'; 

  interface LoginFormData {
  email: string;
  contrasena: string;
}

export default function Login() {
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const { alertaError } = useAlerta();

  const { 
    register, 
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setCargando(true);

    try {
      const response = await login({ email: data.email, contrasena: data.contrasena });
      
      // Guardamos el token
      localStorage.setItem('token', response.token);
      
      // Redirigimos
      navigate(from, { replace: true });
      
    } catch (err) {
      const mensajeOriginal = err instanceof Error ? err.message : 'Error al iniciar sesión';
      const mensajeError = (mensajeOriginal === 'Failed to fetch') 
        ? 'No nos pudimos conectar con el servidor. Verificá que esté encendido.' 
        : mensajeErrorText(mensajeOriginal);
      alertaError('¡Atención!', mensajeError);
    } finally {
      setCargando(false);
    }
  }

  // Función auxiliar para limpiar mensajes de error
  function mensajeErrorText(msg: string) {
    if (msg.includes('credenciales') || msg.includes('password') || msg.includes('usuario')) {
      return 'Correo o contraseña incorrectos.';
    }
    return msg;
  }

 return (
    <div className="login-container">
      
      <div className="login-header">
        <h2 className="login-title">
          Iniciar Sesión
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <div>
          <label htmlFor="email" className="login-label">Email:</label>
          <input
            id="email"
            type="email"
            {...register('email', { required: 'El email es obligatorio' })}
            required
            placeholder="ejemplo@correo.com"
            className="login-input"
          />
         {/* Mostramos el error si existe */}
          {errors.email && (
            <span style={{ color: '#ff4d4d', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
              {errors.email.message}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="contrasena" className="login-label">Contraseña:</label>
          <input
            id="contrasena"
            type="password"
            {...register('contrasena', { required: 'La contraseña es obligatoria' })}
            required
            placeholder="••••••••"
            className="login-input"
          />
          {/* Mostramos el error si existe */}
          {errors.contrasena && (
            <span style={{ color: '#ff4d4d', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
              {errors.contrasena.message}
            </span>
          )}
        </div>

        <button 
          type="submit" 
          disabled={cargando}
          className="login-btn-submit"
        >
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="login-footer-text">
        ¿No tenés cuenta? <Link to="/registro" className="login-register-link">Registrate acá</Link>
      </p>
    </div>
  );
}