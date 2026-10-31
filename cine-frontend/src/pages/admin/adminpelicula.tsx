import { useState, useEffect } from 'react'
import { getPeliculas, createPelicula, deletePelicula, updatePelicula } from '../../services/peliculaServices.ts'
import type { Pelicula } from '../../services/peliculaServices.ts'
import type { FormEvent } from 'react'
import Loader from '../../components/Loader';

export default function AdminPeliculas() {
  const [peliculas, setPeliculas] = useState<Pelicula[]>([])
  const [tituloPelicula, setTituloPelicula] = useState('')
  const [sinopsis, setSinopsis] = useState('')
  const [duracion, setDuracion] = useState<string>('')
  const [clasificacion, setClasificacion] = useState('')
  const [codGenero, setCodGenero] = useState<string>('')
  const [cartelera, setCartelera] = useState('')
  const [trailer, setTrailer] = useState('')
  const [peliculaEditando, setPeliculaEditando] = useState<number | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPeliculas()
  }, [])

  async function cargarPeliculas() {
    setError('')
    setCargando(true);
    try {
      const data = await getPeliculas()
      setPeliculas(data)
    } catch  {
      setError('No se pudieron obtener las películas.')
    } finally {
      setCargando(false); 
  } }

  function limpiarFormulario() {
    setTituloPelicula('')
    setSinopsis('')
    setDuracion('')
    setClasificacion('')
    setCodGenero('')
    setCartelera('')
    setTrailer('')
    setPeliculaEditando(null)
    setError('')
  }

  function handleEditar(pelicula: Pelicula) {
    const idGenero = typeof pelicula.genero === 'object' 
    ? (pelicula.genero as { CodGenero: number }).CodGenero 
    : pelicula.genero;

    setTituloPelicula(pelicula.TituloPelicula)
    setSinopsis(pelicula.Sinopsis)
    setDuracion(String(pelicula.Duracion))
    setClasificacion(pelicula.Clasificacion)
    setCodGenero(String(idGenero))
    setCartelera(pelicula.Cartelera)
    setTrailer(pelicula.Trailer)
    setPeliculaEditando(pelicula.IdPelicula!)
    setError('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!tituloPelicula.trim() || !duracion || !codGenero) {
      setError('Por favor completá los campos obligatorios (Título, Duración y Género).')
      return
    }
    try {
      const peliculaData = {
        TituloPelicula: tituloPelicula,
        Sinopsis: sinopsis,
        Duracion: Number(duracion),
        Clasificacion: clasificacion,
        CodGenero: Number(codGenero),
        Cartelera: cartelera,
        Trailer: trailer
      }
      if (peliculaEditando) {
        await updatePelicula(peliculaEditando, peliculaData)
      } else {
        await createPelicula(peliculaData)
      }
      limpiarFormulario()
      cargarPeliculas()
    } catch (err) {
       if (err instanceof Error) {
        setError(err.message); 
      } else {
        setError('Error al crear la película.');
      }
    }
  }

  async function handleDelete(id?: number) {
    if (!id) return
    if (!window.confirm(`¿Seguro que querés eliminar esta película?`)) return

    try {
      await deletePelicula(id)
      cargarPeliculas()
      if (peliculaEditando === id) limpiarFormulario()
    }  catch (err) {
    console.error(err);
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('Error al eliminar la película.');
    }
  } 
}

  const peliculasFiltradas = peliculas.filter((p) =>
    p.TituloPelicula?.toLowerCase().includes(busqueda.toLowerCase())
  )

  if (cargando) {
      return <Loader mensaje="Cargando funciones..." />;
    }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      
      <div style={{ margin: '20px 0 30px 0' }}>
        <h2 style={{ fontSize: '1.25rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '2px solid #e50914', paddingBottom: '8px', display: 'inline-block', color: '#fff' }}>
          🎬 Administración de Películas
        </h2>
      </div>

      {error && (
        <p style={{ color: '#ff4d4d', backgroundColor: '#2d1515', border: '1px solid #e50914', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </p>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#141414', border: '1px solid #222', padding: '25px', borderRadius: '4px', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {peliculaEditando ? '✏️ Editar Película' : '➕ Agregar Nueva Película'}
        </h3>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Título:</label>
          <input 
            type="text" 
            placeholder="Ej: El Padrino, Matrix, Titanic..."
            value={tituloPelicula} 
            onChange={(e) => setTituloPelicula(e.target.value)}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Duración (minutos):</label>
          <input 
            type="number" 
            placeholder="Ej: 120"
            value={duracion} 
            onChange={(e) => setDuracion(e.target.value)}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>ID del Género:</label>
          <input 
            type="number" 
            placeholder="Ej: 1"
            value={codGenero} 
            onChange={(e) => setCodGenero(e.target.value)}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Clasificación:</label>
          <input 
            type="text" 
            placeholder="Ej: ATP, +13, +18"
            value={clasificacion} 
            onChange={(e) => setClasificacion(e.target.value)}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>URL Cartelera (Imagen):</label>
          <input 
            type="text" 
            placeholder="Ej: https://example.com/cartelera.jpg"
            value={cartelera} 
            onChange={(e) => setCartelera(e.target.value)}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>URL Trailer:</label>
          <input 
            type="text" 
            placeholder="Ej: https://example.com/trailer.mp4"
            value={trailer} 
            onChange={(e) => setTrailer(e.target.value)}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Sinopsis:</label>
          <textarea 
            placeholder="Ej: Shrek es un ogro verde y solitario..."
            value={sinopsis} 
            onChange={(e) => setSinopsis(e.target.value)}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box', minHeight: '80px' }} 
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button 
            type="submit" 
            style={{ flex: 1, padding: '12px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#e50914', color: '#fff', border: 'none', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            {peliculaEditando ? 'Guardar Cambios' : 'Crear Película'}
          </button>
          
          {peliculaEditando && (
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

{/* Búsqueda */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🔍 Buscar Película
        </h3>
        <input
          type="text"
          placeholder="Escribí el título para filtrar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: '100%', padding: '12px', backgroundColor: '#141414', border: '1px solid #222', color: '#fff', fontSize: '15px', borderRadius: '4px', boxSizing: 'border-box' }}
        />
      </div>

{/* Lista de Películas */}
      <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Listado de Películas
      </h3>

      {peliculasFiltradas.length === 0 ? (
        <p style={{ color: '#888' }}>No se encontraron películas.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {peliculasFiltradas.map((p) => (
            <li key={p.IdPelicula} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px', backgroundColor: '#141414', border: '1px solid #222', borderRadius: '4px'
            }}>
              <div>
                <strong style={{ color: '#fff', fontSize: '1rem' }}>
                  <span style={{ color: '#aaa', marginRight: '8px' }}>#{p.IdPelicula}</span>
                  {p.TituloPelicula}
                </strong> 
                <span style={{ color: '#888', fontSize: '0.9rem', marginLeft: '8px' }}>({p.Duracion} min)</span>
                <br />
                <small style={{ color: '#666', fontSize: '0.85rem' }}>Clasificación: {p.Clasificacion || p.Clasificacion || 'N/A'}</small>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => handleEditar(p)}
                  style={{ color: '#fff', padding: '6px 12px', cursor: 'pointer', border: '1px solid #333', borderRadius: '4px', backgroundColor: '#222', fontWeight: 'bold', fontSize: '0.85rem' }}
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(p.IdPelicula)}
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
  )
}