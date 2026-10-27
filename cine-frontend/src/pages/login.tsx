import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { login } from '../services/authServices';

export default function Login() {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const data = await login({ email, contrasena });
      //guardamos el token y los datos del usuario en el navegador
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      //redirigimos a donde estaba
      navigate(from, { replace: true });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  }

 return (
    <div style={{ maxWidth: '420px', margin: '60px auto', fontFamily: 'system-ui, sans-serif', padding: '30px', backgroundColor: '#141414', border: '1px solid #222', borderRadius: '4px', color: '#fff' }}>
      
      <div style={{ margin: '0 0 25px 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '2px solid #e50914', paddingBottom: '8px', display: 'inline-block', color: '#fff' }}>
          🎬 Iniciar Sesión
        </h2>
      </div>
      
      {error && (
        <p style={{ color: '#ff4d4d', backgroundColor: '#2d1515', border: '1px solid #e50914', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '0.9rem' }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            onChange={(e) => setContrasena(e.target.value)}
            required
            placeholder="••••••••"
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={cargando}
          style={{ 
            padding: '14px', 
            backgroundColor: cargando ? '#333' : '#e50914', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            fontWeight: 'bold', 
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            cursor: cargando ? 'not-allowed' : 'pointer' 
          }}
        >
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', color: '#888' }}>
        ¿No tenés cuenta? <Link to="/registro" style={{ color: '#e50914', textDecoration: 'none', fontWeight: 'bold' }}>Registrate acá</Link>
      </p>
    </div>
  );
}