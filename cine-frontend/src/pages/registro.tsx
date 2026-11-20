import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrarUsuario } from '../services/usuarioServices';
import '../pages/Registro.css';
import { useAlerta } from '../hooks/useAlerta.ts';
import { useForm, useWatch } from 'react-hook-form';

interface RegistroFormData {
  EmailUsuario: string;
  Contrasena: string;
  confirmarContrasena: string;
  FechaNacimiento: string;
}

export default function Registro() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const { alertaExito, alertaError } = useAlerta();

    const { 
    register, 
    handleSubmit, 
    control, 
    formState: { errors } 
  } = useForm<RegistroFormData>();

  const contrasenaActual = useWatch({ control, name: 'Contrasena' });

   const onSubmit = async (data: RegistroFormData) => {
    setCargando(true);
    try {
      await registrarUsuario({
        EmailUsuario: data.EmailUsuario,
        Contrasena: data.Contrasena,
        FechaNacimiento: data.FechaNacimiento,
        rol: 'CLIENTE' // Rol por defecto
      });
      alertaExito('¡Registro exitoso!', 'Tu cuenta ha sido creada. Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      alertaError('Error al crear la cuenta', err instanceof Error ? err.message : 'Error al crear la cuenta.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="registro-container">
      
      <div className="registro-header">
        <h2 className="registro-title">
           Crear Cuenta
        </h2>
      </div>


      <form onSubmit={handleSubmit(onSubmit)} className="registro-form">
        <div>
          <label className="registro-label">Email:</label>
          <input 
            type="email" 
            {...register('EmailUsuario', { required: 'El email es obligatorio' })}
            required 
            placeholder="ejemplo@correo.com"
            className="registro-input"
          />
        {/*  Mostramos el error si existe */}
  {errors.EmailUsuario && (
    <span style={{ color: '#ff4d4d', fontSize: '0.8rem' }}>{errors.EmailUsuario.message}</span>
       )}
        </div>

        <div>
          <label className="registro-label">Contraseña:</label>
          <input 
            type="password" 
             {...register('Contrasena', { 
              required: 'La contraseña es obligatoria.',
              minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres.' }
            })}
            required 
            placeholder="Mínimo 6 caracteres"
            className="registro-input"
          />
        {errors.Contrasena && (
          <span style={{ color: '#ff4d4d', fontSize: '0.8rem' }}>{errors.Contrasena.message}</span>
        )}
        </div>

        <div>
          <label className="registro-label">Confirmar Contraseña:</label>
          <input 
            type="password" 
             {...register('confirmarContrasena', { 
              required: 'Tenés que confirmar la contraseña.',
              validate: value => value === contrasenaActual || 'Las contraseñas no coinciden.'
            })}
            required 
            placeholder="Repetí tu contraseña"
            className="registro-input"
          />
        {errors.confirmarContrasena && (
          <span style={{ color: '#ff4d4d', fontSize: '0.8rem' }}>{errors.confirmarContrasena.message}</span>
        )}
        </div>

        <div>
          <label className="registro-label">Fecha de Nacimiento:</label>
          <input 
            type="date" 
            {...register('FechaNacimiento', { required: 'La fecha de nacimiento es obligatoria' })}
            required 
            className="registro-input-date"
          />
        {errors.FechaNacimiento && (
          <span style={{ color: '#ff4d4d', fontSize: '0.8rem' }}>{errors.FechaNacimiento.message}</span>
        )}
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