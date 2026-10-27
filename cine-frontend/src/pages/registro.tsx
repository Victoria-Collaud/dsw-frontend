import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrarUsuario } from '../services/usuarioServices';

export default function Registro() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  async function handleRegistro(e: FormEvent) {
    e.preventDefault();
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
    }
  }

  return (
    <div style={{ maxWidth: '420px', margin: '50px auto', padding: '30px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#141414', border: '1px solid #222', borderRadius: '4px', color: '#fff' }}>
      
      <div style={{ margin: '0 0 25px 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '2px solid #e50914', paddingBottom: '8px', display: 'inline-block', color: '#fff' }}>
          🎬 Crear Cuenta
        </h2>
      </div>

      {error && <p style={{ color: '#ff4d4d', backgroundColor: '#2d1515', border: '1px solid #e50914', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</p>}
      {exito && <p style={{ color: '#4ade80', backgroundColor: '#14291c', border: '1px solid #4ade80', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '0.9rem' }}>¡Cuenta creada con éxito! Redirigiendo al login...</p>}

      <form onSubmit={handleRegistro} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            placeholder="ejemplo@correo.com"
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Contraseña:</label>
          <input 
            type="password" 
            value={contrasena} 
            onChange={e => setContrasena(e.target.value)} 
            required 
            placeholder="Mínimo 6 caracteres"
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Confirmar Contraseña:</label>
          <input 
            type="password" 
            value={confirmarContrasena} 
            onChange={e => setConfirmarContrasena(e.target.value)} 
            required 
            placeholder="Repetí tu contraseña"
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Fecha de Nacimiento:</label>
          <input 
            type="date" 
            value={fechaNacimiento} 
            onChange={e => setFechaNacimiento(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box', colorScheme: 'dark' }}
          />
        </div>

        <button 
          type="submit" 
          style={{ 
            padding: '14px', 
            backgroundColor: '#e50914', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            fontWeight: 'bold', 
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            cursor: 'pointer', 
            marginTop: '5px' 
          }}
        >
          Registrarse
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.9rem', color: '#888' }}>
        ¿Ya tenés cuenta? <Link to="/login" style={{ color: '#e50914', textDecoration: 'none', fontWeight: 'bold' }}>Iniciá sesión</Link>
      </p>
    </div>
  );
}