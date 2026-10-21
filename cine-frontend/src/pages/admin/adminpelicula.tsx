import { useState, useEffect } from 'react'
import { getPeliculas, createPelicula, deletePelicula, updatePelicula } from '../../services/peliculaServices.ts'
import type { Pelicula } from '../../services/peliculaServices.ts'
import type { FormEvent } from 'react'

export default function AdminPeliculas() {
  const [peliculas, setPeliculas] = useState<Pelicula[]>([])
  
  // Estados para los campos de la entidad Película
  const [tituloPelicula, setTituloPelicula] = useState('')
  const [sinopsis, setSinopsis] = useState('')
  const [duracion, setDuracion] = useState<string>('')
  const [clasificacion, setClasificacion] = useState('')
  const [codGenero, setCodGenero] = useState<string>('')
  const [cartelera, setCartelera] = useState('')
  const [trailer, setTrailer] = useState('')
 // 👇 NUEVO ESTADO: Guarda el ID si estamos editando, o null si creamos
  const [peliculaEditando, setPeliculaEditando] = useState<number | null>(null)
  // Estado para la barra de búsqueda
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    cargarPeliculas()
  }, [])

  async function cargarPeliculas() {
    setError('')
    try {
      const data = await getPeliculas()
      setPeliculas(data)
    } catch  {
      setError('No se pudieron obtener las películas.')
    }
  }


   // 👇 Función para limpiar el formulario
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

   // 👇 Función para cargar los datos de la película en el formulario
  function handleEditar(pelicula: Pelicula) {
    setTituloPelicula(pelicula.TituloPelicula)
    setSinopsis(pelicula.Sinopsis)
    setDuracion(String(pelicula.Duracion))
    setClasificacion(pelicula.Clasificacion)
    setCodGenero(String(pelicula.genero))
    setCartelera(pelicula.Cartelera)
    setTrailer(pelicula.Trailer)
    setPeliculaEditando(pelicula.IdPelicula!) // Guardamos el ID
    setError('')
  }

 async function handleSubmit(e: FormEvent) {
  e.preventDefault()

  if (!tituloPelicula.trim() || !duracion || !codGenero) {
    setError('Por favor completá los campos obligatorios (Título, Duración y Género).')
    return
  }
  try {
    //Armamos el objeto con los datos del formulario
    const peliculaData = {
      TituloPelicula: tituloPelicula,
      Sinopsis: sinopsis,
      Duracion: Number(duracion),
      Clasificacion: clasificacion,
      genero: Number(codGenero),
      Cartelera: cartelera,
      Trailer: trailer
    }
    if (peliculaEditando) {
      // MODO EDICIÓN
      await updatePelicula(peliculaEditando, peliculaData)
    } else {
      // MODO CREACIÓN
      await createPelicula(peliculaData)
    }
    // 3. Limpiamos el formulario y recargamos
    limpiarFormulario()
    cargarPeliculas()
  } catch (error) {
    console.error(error)
    setError(peliculaEditando ? 'Error al actualizar la película.' : 'Error al crear la película.')
  }
}

 async function handleDelete(id?: number) {
    if (!id) return
    if (!window.confirm(`¿Seguro que querés eliminar esta película?`)) return

    try {
      await deletePelicula(id)
      cargarPeliculas()
      // Si estábamos editando la película que borramos, limpiamos el form
      if (peliculaEditando === id) limpiarFormulario()
    } catch  {
      setError('Error al eliminar la película.')
    }
  }

  // Filtrado de películas por título
  const peliculasFiltradas = peliculas.filter((p) =>
    p.TituloPelicula?.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>🎬 Administración - Películas</h1>

      {error && (
        <p style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px' }}>
          {error}
        </p>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        <h3>{peliculaEditando ? '✏️ Editar Película' : 'Agregar Nueva Película'}</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Título:</label>
          <input 
          type="text" 
          placeholder="Ej: El Padrino, Matrix, Titanic..."
          value={tituloPelicula} 
          onChange={(e) => setTituloPelicula(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Duración (minutos):</label>
          <input 
          type="number" 
          placeholder="Ej: 120"
          value={duracion} 
          onChange={(e) => setDuracion(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>ID del Género:</label>
          <input 
          type="number" 
          placeholder="Ej: 1"
          value={codGenero} 
          onChange={(e) => setCodGenero(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Clasificación:</label>
          <input 
          type="text" 
          placeholder="Ej: ATP, +13, +18"
          value={clasificacion} onChange={(e) => setClasificacion(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>URL Cartelera (Imagen):</label>
          <input 
          type="text" 
          placeholder="Ej: https://example.com/cartelera.jpg"
          value={cartelera} 
          onChange={(e) => setCartelera(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>URL Trailer:</label>
          <input 
          type="text" 
          placeholder="Ej: https://example.com/trailer.mp4"
          value={trailer} onChange={(e) => setTrailer(e.target.value)}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Sinopsis:</label>
          <textarea 
            placeholder="Ej: Shrek es un ogro verde y solitario que vive en su pantano..."
            value={sinopsis} onChange={(e) => setSinopsis(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', minHeight: '60px' }} />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ flex: 1, padding: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
            {peliculaEditando ? 'Guardar Cambios' : 'Crear Película'}
          </button>
          
          {peliculaEditando && (
            <button type="button" onClick={limpiarFormulario}
              style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#ccc', border: 'none', borderRadius: '4px' }}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    {/* Busca*/}
    <div style={{ marginBottom: '20px' }}>
      <h3>🔍 Buscar Película</h3>
      <input
        type="text"
        placeholder="Escribí el título para filtrar..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ width: '100%', padding: '10px', fontSize: '15px', boxSizing: 'border-box' }}
     />
    </div>
      {/* Lista de Películas */}
      <h3>Listado de Películas</h3>
      {peliculasFiltradas.length === 0 ? (
        <p>No se encontraron películas.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {peliculasFiltradas.map((p) => (
            <li key={p.IdPelicula} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px', borderBottom: '1px solid #ccc'
            }}>
              <div>
                <strong>#{p.IdPelicula} - {p.TituloPelicula}</strong> ({p.Duracion} min)
                <br />
                <small>Clasificación: {p.Clasificacion || 'N/A'}</small>
              </div>

              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => handleEditar(p)}
                  style={{ color: '#3498db', padding: '5px 10px', cursor: 'pointer' }}>
                  Editar
                </button>
                <button onClick={() => handleDelete(p.IdPelicula)}
                  style={{ color: 'red', padding: '5px 10px', cursor: 'pointer' }}>
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