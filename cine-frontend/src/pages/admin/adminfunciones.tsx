import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { createFuncion, deleteFuncion, getFuncionesDePelicula } from '../../services/funcionesServices';
import type { Funcion } from '../../services/funcionesServices';
//import { getPeliculas } from '../../services/peliculaServices';
import type { Pelicula } from '../../services/peliculaServices';
import { getallSala } from '../../services/salaServices';
import type { Sala } from '../../services/salaServices';
//import { useParams } from 'react-router-dom';
import { getPeliculas } from '../../services/peliculaServices';

export default function AdminFunciones() {
  //const { IdPelicula } = useParams<{ IdPelicula: string }>();
  //const idPelicula= Number(IdPelicula);

  const [funciones, setFunciones] = useState<Funcion[]>([]);
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  //const [, setCapacidadDisponible] = useState<number | null>(null); // Estado para la capacidad de la sala   
  const [salas, setSalas] = useState<Sala[]>([]);
  const [peliculaBuscada, setPeliculaBuscada] = useState<Pelicula | null>(null);
  const [peliculaABuscar, setPeliculaABuscar] = useState<number | ''>('');

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

  /*async function cargarTodo() {
    setError('');
    try {
      const [funcionesData, peliculasData, salasData] = await Promise.all([
        getFuncionesDePelicula(idPelicula),
        getPeliculas(),
        getallSala()
      ]);
      setFunciones(funcionesData);
      setPeliculas(peliculasData);
      setSalas(salasData);
    } catch (error) {
      console.log('Error al cargar datos', error);
      setError('No se pudieron obtener los datos del servidor.');
    }
  } */


      //crea funcion nueva
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!Idioma || !Fecha || !Horario || !peliculaSeleccionada || !salaSeleccionada) {
      setError('Por favor completá todos los campos.');
      return;
    }

    try {
      await createFuncion({
        Idioma,
        Fecha,
        Horario,
        pelicula: peliculaSeleccionada,   // ← Enviamos el objeto completo
        sala: salaSeleccionada            // ← Enviamos el objeto completo
      });

      // Limpiar formulario
      setIdioma('');
      setFecha('');
      setHorario('');
      setPeliculaSeleccionada(null);
      setSalaSeleccionada(null);
      setExito('Función creada exitosamente.');
      
      setError('');
      //cargarTodo();
    } catch (error) {
      console.log('Error al crear la función', error);
      setError('No se pudo crear la función.');
    }
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
    } catch (error) {
      console.log('Error al borrar la función', error);
      setError('No se pudo eliminar la función.');
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
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>🎬 Gestión de Funciones</h2>

      {error && (
        <p style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px' }}>
          {error}
        </p>
      )}
      {exito && (
        <p style={{ color: 'green', backgroundColor: '#e6ffe6', padding: '10px', borderRadius: '4px' }}>
          {exito}
        </p>
      )}
      {/* ============ FORMULARIO DE CREACIÓN ============ */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        <h3>Agregar Nueva Función</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Película:</label>
          <select
            value={peliculaSeleccionada?.IdPelicula || ''}
            onChange={(e) => {
              const id = Number(e.target.value);
              setPeliculaSeleccionada(peliculas.find(p => p.IdPelicula === id) || null);
            }}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="">-- Seleccioná una película --</option>
            {peliculas.map(p => (
              <option key={p.IdPelicula} value={p.IdPelicula}>{p.TituloPelicula}</option>
            ))}
          </select>
        </div>
               <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Sala:</label>
          <select
            value={salaSeleccionada?.NumSala || ''}
            onChange={(e) => {
              const num = Number(e.target.value);
              setSalaSeleccionada(salas.find(s => s.NumSala === num) || null);
            }}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
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
          <label style={{ display: 'block', marginBottom: '4px' }}>Idioma:</label>
          <select value={Idioma} onChange={(e) => setIdioma(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
            <option value="">-- Seleccioná --</option>
            <option value="Español">Español</option>
            <option value="Inglés">Inglés</option>
            <option value="Subtitulada">Subtitulada</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Fecha:</label>
          <input type="date" value={Fecha} onChange={(e) => setFecha(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Horario:</label>
          <input type="time" value={Horario} onChange={(e) => setHorario(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <button type="submit" style={{ padding: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
          Crear Función
        </button>
      </form>
   {/* ============ SECCIÓN DE BÚSQUEDA ============ */}
      <div style={{ borderTop: '2px solid #ccc', paddingTop: '20px', marginTop: '30px' }}>
        <h3>🔍 Buscar Funciones de una Película</h3>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={peliculaABuscar}
            onChange={(e) => setPeliculaABuscar(Number(e.target.value))}
            style={{ flex: 1, padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="">-- Seleccioná una película --</option>
            {peliculas.map(p => (
              <option key={p.IdPelicula} value={p.IdPelicula}>{p.TituloPelicula}</option>
            ))}
          </select>
       <button
            onClick={handleBuscar}
            style={{ padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Buscar
          </button>
        </div>
     {/* ============ LISTADO DE RESULTADOS ============ */}
        {peliculaBuscada && (
          <div style={{ marginTop: '20px' }}>
            <h4>Funciones de: {peliculaBuscada.TituloPelicula}</h4>
            {funciones.length === 0 ? (
              <p>Esta película no tiene funciones programadas.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {funciones.map(f => (
                  <li key={f.IdFuncion} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px', borderBottom: '1px solid #ccc'
                  }}>
                    <div>
                      <strong>📅 {formatearFecha(f.Fecha)} a las {f.Horario}</strong>
                      <br />
                      <small>
                        🗣️ {f.Idioma} | 🏛️ Sala #{f.sala.NumSala}
                      </small>
                    </div>
                                      <button onClick={() => handleDelete(f.IdFuncion)}
                      style={{ color: 'pink', padding: '5px 10px', cursor: 'pointer' }}>
                      Eliminar
                    </button>
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