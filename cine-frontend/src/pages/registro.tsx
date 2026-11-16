import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrarUsuario } from '../services/usuarioServices';
import '../pages/Registro.css';

export default function Registro() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function handleRegistro(e: FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError('');

    // Validaciones
    if (contrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      await registrarUsuario({
        EmailUsuario: email,
        Contrasena: contrasena,
        FechaNacimiento: fechaNacimiento,
        rol: 'CLIENTE' // Rol por defecto
      });

      setExito(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta.');
    }  finally {
      setCargando(false);
  }
  }

  return (
    <div className="registro-container">
      
      <div className="registro-header">
        <h2 className="registro-title">
          🎬 Crear Cuenta
        </h2>
      </div>

      {error && <p className="registro-error">{error}</p>}
      {exito && <p className="registro-exito">¡Cuenta creada con éxito! Redirigiendo al login...</p>}

      <form onSubmit={handleRegistro} className="registro-form">
        <div>
          <label className="registro-label">Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            placeholder="ejemplo@correo.com"
            className="registro-input"
          />
        </div>

        <div>
          <label className="registro-label">Contraseña:</label>
          <input 
            type="password" 
            value={contrasena} 
            onChange={e => setContrasena(e.target.value)} 
            required 
            placeholder="Mínimo 6 caracteres"
            className="registro-input"
          />
        </div>

        <div>
          <label className="registro-label">Confirmar Contraseña:</label>
          <input 
            type="password" 
            value={confirmarContrasena} 
            onChange={e => setConfirmarContrasena(e.target.value)} 
            required 
            placeholder="Repetí tu contraseña"
            className="registro-input"
          />
        </div>

        <div>
          <label className="registro-label">Fecha de Nacimiento:</label>
          <input 
            type="date" 
            value={fechaNacimiento} 
            onChange={e => setFechaNacimiento(e.target.value)} 
            required 
            className="registro-input-date"
          />
        </div>

        <button 
          type="submit" 
          disabled={cargando} 
          className="registro-btn-submit"
        >
          {cargando ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <p className="registro-footer-text">
        ¿Ya tenés cuenta? <Link to="/login" className="registro-login-link">Iniciá sesión</Link>
      </p>
    </div>
  );
}