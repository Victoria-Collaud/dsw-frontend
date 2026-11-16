import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { login } from '../services/authServices'; // Ajusta la ruta a tu servicio si es necesario

export default function Login() {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setCargando(true);

    try {
      const data = await login({ email, contrasena });
      // Guardamos el token y NO los datos del usuario en el navegador
      localStorage.setItem('token', data.token);
      //localStorage.setItem('usuario', JSON.stringify(data.usuario));
      
      // Redirigimos a donde estaba
      navigate(from, { replace: true });
      
    } catch (err) {
      const mensajeOriginal = err instanceof Error ? err.message : 'Error al iniciar sesión';
      
      // Traducción amigable si el servidor está caído
      const mensajeError = (mensajeOriginal === 'Failed to fetch') 
        ? 'No nos pudimos conectar con el servidor. Verificá que esté encendido.' 
        : mensajeErrorText(mensajeOriginal);

      //  Alerta con SweetAlert2
      Swal.fire({
        title: '¡Atención!',
        text: mensajeError,
        icon: 'error',
        confirmButtonColor: '#e50914',
        background: '#141414',
        color: '#fff'
      });
    } finally {
      setCargando(false);
    }
  }

  // Función auxiliar opcional para limpiar mensajes de error del backend si vienen en inglés
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

      <form onSubmit={handleSubmit} className="login-form">
        <div>
          <label htmlFor="email" className="login-label">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="ejemplo@correo.com"
            className="login-input"
          />
        </div>

        <div>
          <label htmlFor="contrasena" className="login-label">Contraseña:</label>
          <input
            id="contrasena"
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            placeholder="••••••••"
            className="login-input"
          />
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