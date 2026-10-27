import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { createFuncion, deleteFuncion, getFuncionesDePelicula, updateFuncion } from '../../services/funcionesServices';
import type { Funcion } from '../../services/funcionesServices';
import type { Pelicula } from '../../services/peliculaServices';
import { getallSala } from '../../services/salaServices';
import type { Sala } from '../../services/salaServices';
import { getPeliculas } from '../../services/peliculaServices';

export default function AdminFunciones() {

  const [funciones, setFunciones] = useState<Funcion[]>([]);
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [peliculaBuscada, setPeliculaBuscada] = useState<Pelicula | null>(null);
  const [peliculaABuscar, setPeliculaABuscar] = useState<number | ''>('');
  const [funcionEditando, setFuncionEditando] = useState<number | null>(null);
  // Estados del formulario
  const [Idioma, setIdioma] = useState<string>('');
  const [Fecha, setFecha] = useState<string>('');
  const [Horario, setHorario] = useState<string>('');
  const [peliculaSeleccionada, setPeliculaSeleccionada] = useState<Pelicula | null>(null);  // ← Objeto
  const [salaSeleccionada, setSalaSeleccionada] = useState<Sala | null>(null);              // ← Objeto

  const [error, setError] = useState('');
  const [exito, setExito] = useState('');  


 useEffect(() => {
  async function cargarBase() {
    setError('');
    try {
      const [pelis, salasData] = await Promise.all([
        getPeliculas(),
        getallSala()
      ]);
      setPeliculas(pelis);
      setSalas(salasData);
    } catch (err) {
      console.log('Error al cargar base', err);
      setError('No se pudieron obtener los datos iniciales.');
    }
  }
  cargarBase();
}, []);

  // Función para limpiar el formulario
  function limpiarFormulario() {
    setIdioma('');
    setFecha('');
    setHorario('');
    setPeliculaSeleccionada(null);
    setSalaSeleccionada(null);
    setFuncionEditando(null);
    setError('');
  }

  // Función para cargar los datos en el formulario al editar
  function handleEditar(func: Funcion) {
    setIdioma(func.Idioma);
    // Formateamos la fecha ISO a YYYY-MM-DD para el input type="date"
    setFecha(func.Fecha.split('T')[0]); 
    setHorario(func.Horario);
    setPeliculaSeleccionada(func.pelicula);
    setSalaSeleccionada(func.sala);
    setFuncionEditando(func.IdFuncion!);
    setError('');
    setExito('');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scrolleamos al form
  }

  // Crear o Actualizar función
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!Idioma || !Fecha || !Horario || !peliculaSeleccionada || !salaSeleccionada) {
      setError('Por favor completá todos los campos.');
      return; 
    }
    // Juntamos la fecha y el horario en un solo objeto Date
    const fechaHoraFuncion = new Date(`${Fecha}T${Horario}`);
    const ahora = new Date();
    if (fechaHoraFuncion < ahora) {
      setError('No puedes crear una función con una fecha u horario que ya pasó.');
      return; 
    }
    try {
      const funcionData = {
        Idioma,
        Fecha,
        Horario,
        pelicula: peliculaSeleccionada,
        sala: salaSeleccionada
      };
      if (funcionEditando) {
        // MODO EDICIÓN
        await updateFuncion(funcionEditando, funcionData);
        setExito('Función actualizada exitosamente.');
      } else {
        // MODO CREACIÓN
        await createFuncion(funcionData);
        setExito('Función creada exitosamente.');
      }
      limpiarFormulario();
      // Si había una búsqueda activa, refrescamos la lista
      if (peliculaBuscada?.IdPelicula !== undefined) {
        await buscarFunciones(peliculaBuscada.IdPelicula);
      }
    }catch (err) {
  console.error('Error al guardar la función', err);
  if (err instanceof Error) {
    setError(err.message); 
  } else {
    setError('No se pudo crear la función.');
  } }
  }
      //borra funcion 
  async function handleDelete(IdFuncion?: number) {
    if (!IdFuncion) return;
    if (!window.confirm('¿Seguro que querés eliminar esta función?')) return;
    try {
      await deleteFuncion(IdFuncion);
      if (peliculaBuscada?.IdPelicula !== undefined) {
      await getFuncionesDePelicula(peliculaBuscada.IdPelicula);
    }
    } catch (err) {
  console.error('Error al guardar la función', err);
  if (err instanceof Error) {
    setError(err.message); 
  } else {
    setError('No se pudo crear la función.');
  }
 }
  }

   async function buscarFunciones(idPelicula: number) {
    setError('');
    setExito('');
    try {
      const funcs = await getFuncionesDePelicula(idPelicula);
      setFunciones(funcs);
      const peli = peliculas.find(p => p.IdPelicula === idPelicula) || null;
      setPeliculaBuscada(peli);
    } catch (err) {
      console.log('Error al buscar funciones', err);
      setError('No se pudieron obtener las funciones de esta película.');
      setFunciones([]);
      setPeliculaBuscada(null);
    }
  }

   async function handleBuscar() {
    if (!peliculaABuscar) {
      setError('Seleccioná una película primero.');
      return;
    }
    await buscarFunciones(Number(peliculaABuscar));
  }

  const formatearFecha = (f: string) => {
    try {
      return new Date(f).toLocaleDateString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    } catch { return f; }
  };



   return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      
      <div style={{ margin: '20px 0 30px 0' }}>
        <h2 style={{ fontSize: '1.25rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '2px solid #e50914', paddingBottom: '8px', display: 'inline-block', color: '#fff' }}>
          🎬 Gestión de Funciones
        </h2>
      </div>

      {error && (
        <p style={{ color: '#ff4d4d', backgroundColor: '#2d1515', border: '1px solid #e50914', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </p>
      )}
      {exito && (
        <p style={{ color: '#4ade80', backgroundColor: '#14291c', border: '1px solid #4ade80', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>
          {exito}
        </p>
      )}

{/*FORMULARIO DE CREACIÓN / EDICIÓN*/}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#141414', border: '1px solid #222', padding: '25px', borderRadius: '4px', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {funcionEditando ? `✏️ Editar Función #${funcionEditando}` : '➕ Agregar Nueva Función'}
        </h3>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Película:</label>
          <select
            value={peliculaSeleccionada?.IdPelicula || ''}
            onChange={(e) => {
              const id = Number(e.target.value);
              setPeliculaSeleccionada(peliculas.find(p => p.IdPelicula === id) || null);
            }}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          >
            <option value="">-- Seleccioná una película --</option>
            {peliculas.map(p => (
              <option key={p.IdPelicula} value={p.IdPelicula}>{p.TituloPelicula}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Sala:</label>
          <select
            value={salaSeleccionada?.NumSala || ''}
            onChange={(e) => {
              const num = Number(e.target.value);
              setSalaSeleccionada(salas.find(s => s.NumSala === num) || null);
            }}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          >
            <option value="">-- Seleccioná una sala --</option>
            {salas.map(s => (
              <option key={s.NumSala} value={s.NumSala}>
                Sala #{s.NumSala} - {s.TipoPantalla} ({s.Capacidad} asientos)
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Idioma:</label>
          <select 
            value={Idioma} 
            onChange={(e) => setIdioma(e.target.value)}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          >
            <option value="">-- Seleccioná --</option>
            <option value="Español">Español</option>
            <option value="Subtitulada">Subtitulada</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Fecha:</label>
          <input 
            type="date" 
            value={Fecha} 
            onChange={(e) => setFecha(e.target.value)}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Horario:</label>
          <input 
            type="time" 
            value={Horario} 
            onChange={(e) => setHorario(e.target.value)}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} 
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button 
            type="submit" 
            style={{ flex: 1, padding: '12px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#e50914', color: '#fff', border: 'none', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            {funcionEditando ? 'Guardar Cambios' : 'Crear Función'}
          </button>
          {funcionEditando && (
            <button 
              type="button" 
              onClick={limpiarFormulario}
              style={{ padding: '12px 20px', cursor: 'pointer', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* ============ SECCIÓN DE BÚSQUEDA ============ */}
      <div style={{ borderTop: '1px solid #222', paddingTop: '30px', marginTop: '30px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🔍 Buscar Funciones de una Película
        </h3>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={peliculaABuscar}
            onChange={(e) => setPeliculaABuscar(Number(e.target.value))}
            style={{ flex: 1, padding: '10px', backgroundColor: '#141414', border: '1px solid #222', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          >
            <option value="">-- Seleccioná una película --</option>
            {peliculas.map(p => (
              <option key={p.IdPelicula} value={p.IdPelicula}>{p.TituloPelicula}</option>
            ))}
          </select>
          <button
            onClick={handleBuscar}
            style={{ padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#333', color: '#fff', border: '1px solid #444', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            Buscar
          </button>
        </div>

{/* LISTADO DE RESULTADOS*/}
        {peliculaBuscada && (
          <div style={{ marginTop: '25px' }}>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '15px' }}>Funciones de: {peliculaBuscada.TituloPelicula}</h4>
            {funciones.length === 0 ? (
              <p style={{ color: '#888' }}>Esta película no tiene funciones programadas.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {funciones.map(f => (
                  <li key={f.IdFuncion} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px', backgroundColor: '#141414', border: '1px solid #222', borderRadius: '4px'
                  }}>
                    <div>
                      <strong style={{ color: '#fff', fontSize: '1rem' }}>📅 {formatearFecha(f.Fecha)} a las {f.Horario}</strong>
                      <br />
                      <small style={{ color: '#888', fontSize: '0.85rem' }}>
                        🗣️ {f.Idioma} | 🏛️ Sala #{f.sala.NumSala}
                      </small>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleEditar(f)}
                        style={{ color: '#fff', padding: '6px 12px', cursor: 'pointer', border: '1px solid #333', borderRadius: '4px', backgroundColor: '#222', fontWeight: 'bold', fontSize: '0.85rem' }}
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(f.IdFuncion)}
                        style={{ color: '#ff4d4d', padding: '6px 12px', cursor: 'pointer', border: '1px solid #552222', borderRadius: '4px', backgroundColor: '#2a1212', fontWeight: 'bold', fontSize: '0.85rem' }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}