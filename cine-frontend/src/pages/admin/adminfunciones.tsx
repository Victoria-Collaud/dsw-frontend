import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { createFuncion, deleteFuncion, getFuncionesDePelicula, updateFuncion } from '../../services/funcionesServices';
import type { Funcion } from '../../services/funcionesServices';
import type { Pelicula } from '../../services/peliculaServices';
import { getallSala } from '../../services/salaServices';
import type { Sala } from '../../services/salaServices';
import { getPeliculas } from '../../services/peliculaServices';
import Loader from '../../components/Loader';
import './AdminFunciones.css';
import { useAlerta } from '../../hooks/useAlerta';

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

  const [cargando, setCargando] = useState(true);

  const { alertaConfirmacion, alertaExito, alertaError, alertaAdvertencia } = useAlerta();
  

 useEffect(() => {
    async function cargarBase() {
      try {
        const [pelis, salasData] = await Promise.all([
          getPeliculas(),
          getallSala()
        ]);
        setPeliculas(pelis);
        setSalas(salasData);
      } catch (err) {
        console.log('Error al cargar base', err);
        alertaError('Error de conexión', 'No se pudieron obtener las películas o salas. Por favor, intentá nuevamente.');
      } finally {
        setCargando(false); 
      }
    }
    cargarBase();
  }, );

  // Función para limpiar el formulario
  function limpiarFormulario() {
    setIdioma('');
    setFecha('');
    setHorario('');
    setPeliculaSeleccionada(null);
    setSalaSeleccionada(null);
    setFuncionEditando(null);
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
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }

    // Crear o Actualizar función
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!Idioma || !Fecha || !Horario || !peliculaSeleccionada || !salaSeleccionada) {
      alertaAdvertencia('Campos incompletos', 'Por favor completá todos los campos.');
      return; 
    }
    // Juntamos la fecha y el horario en un solo objeto Date
    const fechaHoraFuncion = new Date(`${Fecha}T${Horario}`);
    const ahora = new Date();
    if (fechaHoraFuncion < ahora) {
      alertaAdvertencia('Fecha inválida', 'No podés crear una función con una fecha u horario que ya pasó.');
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
        await updateFuncion(funcionEditando, funcionData);
        alertaExito('¡Actualizada!', 'La función fue actualizada exitosamente.');
      } else {
        await createFuncion(funcionData);
        alertaExito('¡Creada!', 'La función fue creada exitosamente.');
      }
      limpiarFormulario();
      // Si había una búsqueda activa, refrescamos la lista
      if (peliculaBuscada?.IdPelicula !== undefined) {
        await buscarFunciones(peliculaBuscada.IdPelicula);
      }
    } catch (err) {
      console.error('Error al guardar la función', err);
      const mensajeError = err instanceof Error ? err.message : 'No se pudo guardar la función.';
      alertaError('Error', mensajeError);
    }
  }
  
  async function handleDelete(IdFuncion?: number) {
    if (!IdFuncion) return;
    const confirmado = await alertaConfirmacion(
      '¿Estás seguro?', 
      '¿Seguro que querés eliminar esta función?',
      'Si, Eliminar'
    );
    if (!confirmado) return;
    try {
      await deleteFuncion(IdFuncion);
      alertaExito('¡Eliminado!', 'La función ha sido eliminada correctamente.');
      buscarFunciones(peliculaBuscada?.IdPelicula ?? 0);
    } catch (error) {
      console.error(error);
      alertaError('Error', 'No se pudo eliminar la función.');
    }
  }


   async function buscarFunciones(idPelicula: number) {
    try {
      const funcs = await getFuncionesDePelicula(idPelicula);
      setFunciones(funcs);
      const peli = peliculas.find(p => p.IdPelicula === idPelicula) || null;
      setPeliculaBuscada(peli);
    } catch (err) {
      console.log('Error al buscar funciones', err);
      alertaError('Error de conexión', 'No se pudieron obtener las funciones de esta película.');
      setFunciones([]);
      setPeliculaBuscada(null);
    }
  }

   async function handleBuscar() {
    if (!peliculaABuscar) {
      alertaAdvertencia('Atención', 'Seleccioná una película primero.');
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

   if (cargando) {
    return <Loader mensaje="Cargando funciones..." />;
  }

  return (
    <div className="admin-funciones-container">
      
      <div className="admin-funciones-header">
        <h2 className="admin-funciones-title">
          Gestión de Funciones
        </h2>
      </div>


      {/* FORMULARIO DE CREACIÓN / EDICIÓN */}
      <form onSubmit={handleSubmit} className="admin-funciones-form">
        <h3 className="admin-funciones-form-title">
          {funcionEditando ? ` Editar Función #${funcionEditando}` : 'Agregar Nueva Función'}
        </h3>

        <div className="admin-funciones-field">
          <label className="admin-funciones-label">Película:</label>
          <select
            value={peliculaSeleccionada?.IdPelicula || ''}
            onChange={(e) => {
              const id = Number(e.target.value);
              setPeliculaSeleccionada(peliculas.find(p => p.IdPelicula === id) || null);
            }}
            className="admin-funciones-select"
          >
            <option value="">-- Seleccioná una película --</option>
            {peliculas.map(p => (
              <option key={p.IdPelicula} value={p.IdPelicula}>{p.TituloPelicula}</option>
            ))}
          </select>
        </div>
        
        <div className="admin-funciones-field">
          <label className="admin-funciones-label">Sala:</label>
          <select
            value={salaSeleccionada?.NumSala || ''}
            onChange={(e) => {
              const num = Number(e.target.value);
              setSalaSeleccionada(salas.find(s => s.NumSala === num) || null);
            }}
            className="admin-funciones-select"
          >
            <option value="">-- Seleccioná una sala --</option>
            {salas.map(s => (
              <option key={s.NumSala} value={s.NumSala}>
                Sala #{s.NumSala} - {s.TipoPantalla} ({s.Capacidad} asientos)
              </option>
            ))}
          </select>
        </div>
        
        <div className="admin-funciones-field">
          <label className="admin-funciones-label">Idioma:</label>
          <select 
            value={Idioma} 
            onChange={(e) => setIdioma(e.target.value)}
            className="admin-funciones-select"
          >
            <option value="">-- Seleccioná --</option>
            <option value="Español">Español</option>
            <option value="Subtitulada">Subtitulada</option>
          </select>
        </div>

        <div className="admin-funciones-field">
          <label className="admin-funciones-label">Fecha:</label>
          <input 
            type="date" 
            value={Fecha} 
            onChange={(e) => setFecha(e.target.value)}
            className="admin-funciones-input" 
          />
        </div>

        <div className="admin-funciones-field">
          <label className="admin-funciones-label">Horario:</label>
          <input 
            type="time" 
            value={Horario} 
            onChange={(e) => setHorario(e.target.value)}
            className="admin-funciones-input" 
          />
        </div>

        <div className="admin-funciones-actions">
          <button 
            type="submit" 
            className="admin-funciones-btn-submit"
          >
            {funcionEditando ? 'Guardar Cambios' : 'Crear Función'}
          </button>
          {funcionEditando && (
            <button 
              type="button" 
              onClick={limpiarFormulario}
              className="admin-funciones-btn-cancel"
            >
              Cancelar
            </button>
          )}
        </div>

      </form>

      {/*ECCIÓN DE BÚSQUEDA*/}
      <div className="admin-funciones-search-section">
        <h3 className="admin-funciones-search-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg> Buscar Funciones de una Película
        </h3>

        <div className="admin-funciones-search-bar">
          <select
            value={peliculaABuscar}
            onChange={(e) => setPeliculaABuscar(Number(e.target.value))}
            className="admin-funciones-search-select"
          >
            <option value="">-- Seleccioná una película --</option>
            {peliculas.map(p => (
              <option key={p.IdPelicula} value={p.IdPelicula}>{p.TituloPelicula}</option>
            ))}
          </select>

          <button
            onClick={handleBuscar}
            className="admin-funciones-btn-search"
          >
            Buscar
          </button>

        </div>

        {/* LISTADO DE RESULTADOS */}
        {peliculaBuscada && (
          <div className="admin-funciones-results">
            <h4 className="admin-funciones-results-title">Funciones de: {peliculaBuscada.TituloPelicula}</h4>
            {funciones.length === 0 ? (
              <p className="admin-funciones-empty">Esta película no tiene funciones programadas.</p>
            ) : (
              <ul className="admin-funciones-list">
                {funciones.map(f => (
                  <li key={f.IdFuncion} className="admin-funciones-card">

                    <div className="admin-funciones-card-info">
                      <strong>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 14v2.2l1.6 1"/><path d="M16 2v3"/><path d="M21 7.338V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2.338"/><path d="M3 9h5.859"/><path d="M8 2v3"/><circle cx="16" cy="16" r="6"/></svg> 
                        {formatearFecha(f.Fecha)} a las {f.Horario}
                      </strong>
                      <br />
                      <small>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg> {f.Idioma} | 
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 18v-7"/><path d="M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/></svg> Sala #{f.sala.NumSala}
                      </small>
                    </div>
                    
                    <div className="admin-funciones-card-actions">
                      <button 
                        onClick={() => handleEditar(f)}
                        className="admin-funciones-btn-edit"
                      >
                        Editar
                      </button>

                      <button 
                        onClick={() => handleDelete(f.IdFuncion)}
                        className="admin-funciones-btn-delete"
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