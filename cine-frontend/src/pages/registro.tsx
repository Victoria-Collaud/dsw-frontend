import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrarUsuario } from '../services/usuarioServices';
import '../pages/Registro.css';
import { useAlerta } from '../hooks/useAlerta.ts';

export default function Registro() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [cargando, setCargando] = useState(false);
  const { alertaExito, alertaError, alertaAdvertencia } = useAlerta();

  async function handleRegistro(e: FormEvent) {
    e.preventDefault();
    setCargando(true);

    // Validaciones
    if (contrasena !== confirmarContrasena) {
      alertaAdvertencia('Contraseñas no coinciden', 'Las contraseñas no coinciden.');
      return;
    }
    if (contrasena.length < 6) {
      alertaError('Contraseña corta', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      await registrarUsuario({
        EmailUsuario: email,
        Contrasena: contrasena,
        FechaNacimiento: fechaNacimiento,
        rol: 'CLIENTE' // Rol por defecto
      });

      alertaExito('¡Registro exitoso!', 'Tu cuenta ha sido creada. Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error(err);
      alertaError('Error al crear la cuenta', err instanceof Error ? err.message : 'Error al crear la cuenta.');
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