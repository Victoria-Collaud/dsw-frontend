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
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif', border: '1px solid #444', borderRadius: '10px', backgroundColor: '#1e1e1e', color: '#fff' }}>
      <h2 style={{ textAlign: 'center' }}>🎬 Crear Cuenta</h2>

      {error && <p style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '5px' }}>{error}</p>}
      {exito && <p style={{ color: 'green', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '5px' }}>¡Cuenta creada con éxito! Redirigiendo al login...</p>}

      <form onSubmit={handleRegistro} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña:</label>
          <input 
            type="password" 
            value={contrasena} 
            onChange={e => setContrasena(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Confirmar Contraseña:</label>
          <input 
            type="password" 
            value={confirmarContrasena} 
            onChange={e => setConfirmarContrasena(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Fecha de Nacimiento:</label>
          <input 
            type="date" 
            value={fechaNacimiento} 
            onChange={e => setFechaNacimiento(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', outline: 'none' }}
          />
        </div>

        <button type="submit" style={{ padding: '12px', backgroundColor: '#9b59b6', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
          Registrarse
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
        ¿Ya tenés cuenta? <Link to="/login" style={{ color: '#ea5098', textDecoration: 'none' }}>Iniciá sesión</Link>
      </p>
    </div>
  );
}