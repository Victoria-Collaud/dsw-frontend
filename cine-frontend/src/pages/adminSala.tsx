import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { getallSala, createSala, deleteSala} from '../services/salaServices'
import type { Sala } from '../services/salaServices'
import { getPeliculas, createPelicula, deletePelicula} from '../services/peliculaServices'
import type { Pelicula } from '../services/peliculaServices'

export default function Admin() {
  // Estados para manejar la lista de salas
  const [salas, setSalas] = useState<Sala[]>([])
  
  // Estados para los campos del formulario
  const [NumSala, setNumSala] = useState<number | ''>('')
  const [capacidad, setCapacidad] = useState<number | ''>('')
  const [TipoPantalla, setTipoPantalla] = useState<string>('')
  const [TipoAsientos, setTipoAsientos] = useState<string>('')
  const [precioSala, setPrecioSala] = useState<number | ''>('')



  const [peliculas, setPeliculas] = useState<Pelicula[]>([])
  
  // Estados para los campos de la entidad Película
  const [tituloPelicula, setTituloPelicula] = useState('')
  const [sinopsis, setSinopsis] = useState('')
  const [duracion, setDuracion] = useState<string>('')
  const [clasificacion, setClasificacion] = useState('')
  const [codGenero, setCodGenero] = useState<string>('')
  const [cartelera, setCartelera] = useState('')
  const [trailer, setTrailer] = useState('')

  // Estado para la barra de búsqueda
  const [busqueda, setBusqueda] = useState('')

  // Estado para capturar errores de conexión o validación
  const [error, setError] = useState('')

  // Cargar las salas al montar el componente
  useEffect(() => {
    cargarSalas()
    cargarPeliculas()
  }, [])

  // Función para obtener las salas desde el backend
  async function cargarSalas() {
    setError('')
    try {
      const data = await getallSala()
      setSalas(data)
    }catch (error) {
      console.log('Error al buscar las salas', error)
      setError('No se pudieron obtener las salas del servidor.')
    }
  }

  // Manejador del formulario para crear una sala
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!NumSala || !capacidad || !precioSala) {
      setError('Por favor completá todos los campos.')
      return
    }

    try {
      await createSala({
          NumSala: Number(NumSala),
          Capacidad: Number(capacidad),
          TipoPantalla: TipoPantalla,
          TipoAsientos: TipoAsientos,
          PrecioSala: Number(precioSala)
      })

      // Limpiar el formulario y recargar la lista
      setNumSala('')
      setCapacidad('')
      setPrecioSala('')
      setTipoPantalla('')
      setTipoAsientos('')
      setError('')
      cargarSalas()
    } catch (error) {
        console.log('Error al crear la sala', error)
      setError('No se pudo crear la sala.')
    }
  }

  // Manejador para eliminar una sala 
  async function handleDelete(NumSala: number) {
    if (!NumSala) return
    try {
      await deleteSala(NumSala)
      cargarSalas()
    } catch (error) {
      console.log('Error al borrar la sala', error)
      setError('No se pudo eliminar la sala.')
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>⚙️ Administración - Salas</h1>

      {error && (
        <p style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px' }}>
          {error}
        </p>
      )}

      {/* Formulario de Alta de Sala */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        <h3>Agregar Nueva Sala</h3>
        
        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Numero de sala:</label>
          <input
            type="number"
            placeholder="Ej: 1"
            value={NumSala}
            onChange={(e) => setNumSala(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Capacidad:</label>
          <input
            type="number"
            placeholder="Ej: 120"
            value={capacidad}
            onChange={(e) => setCapacidad(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Tipo de Pantalla:</label>
          <input
            type="string"
            placeholder="Ej: IMAX"
            value={ TipoPantalla}
            onChange={(e) => setTipoPantalla (e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
          <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Tipo de Asiento:</label>
          <input
            type="string"
            placeholder="Ej: Reclinable"
            value={ TipoAsientos}
            onChange={(e) => setTipoAsientos (e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Precio de las entradas de la sala ($):</label>
          <input
            type="number"
            placeholder="Ej: 4500"
            value={precioSala}
            onChange={(e) => setPrecioSala(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
          Crear Sala
        </button>
      </form>

      {/* Listado de Salas */}
      <h3>Salas Creadas</h3>
      {salas.length === 0 ? (
        <p>No hay salas registradas aún.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {salas.map((sala) => (
            <li
              key={sala.NumSala}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid #ccc'
              }}
            >
              <div>
                <strong>#{sala.NumSala} </strong>
                <br />
                <small>Capacidad: {sala.Capacidad} | Tipo de Pantalla: {sala.TipoPantalla} | Tipo de Asiento: {sala.TipoAsientos} | Precio: ${sala.PrecioSala}</small>
              </div>

              <button
                onClick={() => handleDelete(sala.NumSala)}
                style={{ color: 'pink', padding: '5px 10px', cursor: 'pointer' }}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  ) 
  async function cargarPeliculas() {
    setError('')
    try {
      const data = await getPeliculas()
      setPeliculas(data)
    } catch  {
      setError('No se pudieron obtener las películas.')
    }
  }

  async function handleSubmitPelicula(e: FormEvent) {
    e.preventDefault()

    if (!tituloPelicula.trim() || !duracion || !codGenero) {
      setError('Por favor completá los campos obligatorios (Título, Duración y Género).')
      return
    }

    try {
      await createPelicula({
        TituloPelicula: tituloPelicula,
        Sinopsis: sinopsis,
        Duracion: Number(duracion),
        Clasificacion: clasificacion,
        genero: Number(codGenero), // Se envía el ID del género asociado
        Cartelera: cartelera,
        Trailer: trailer
      })

      // Limpiar campos del formulario
      setTituloPelicula('')
      setSinopsis('')
      setDuracion('')
      setClasificacion('')
      setCodGenero('')
      setCartelera('')
      setTrailer('')
      setError('')
      
      cargarPeliculas()
    } catch  {
      setError('Error al intentar crear la película.')
    }
  }

  async function handleDeletePelicula(id?: number) {
    if (!id) return
    try {
      await deletePelicula(id)
      cargarPeliculas()
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
      <form onSubmit={handleSubmitPelicula} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        <h3>Agregar Nueva Película</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Título:</label>
          <input
            type="text"
            placeholder="Ej: El Señor de los Anillos"
            value={tituloPelicula}
            onChange={(e) => setTituloPelicula(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Duración (minutos):</label>
          <input
            type="number"
            placeholder="Ej: 180"
            value={duracion}
            onChange={(e) => setDuracion(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>ID del Género:</label>
          <input
            type="number"
            placeholder="Ej: 1"
            value={codGenero}
            onChange={(e) => setCodGenero(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Clasificación:</label>
          <input
            type="text"
            placeholder="Ej: PG-13 / +16"
            value={clasificacion}
            onChange={(e) => setClasificacion(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>URL Cartelera (Imagen):</label>
          <input
            type="text"
            placeholder="https://..."
            value={cartelera}
            onChange={(e) => setCartelera(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>URL Trailer:</label>
          <input
            type="text"
            placeholder="https://youtube.com/..."
            value={trailer}
            onChange={(e) => setTrailer(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>Sinopsis:</label>
          <textarea
            placeholder="Resumen de la película..."
            value={sinopsis}
            onChange={(e) => setSinopsis(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', minHeight: '60px' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
          Crear Película
        </button>
      </form>

      {/* Barra de Búsqueda */}
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
            <li
              key={p.IdPelicula}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid #ccc'
              }}
            >
              <div>
                <strong>#{p.IdPelicula} - {p.TituloPelicula}</strong> ({p.Duracion} min)
                <br />
                <small>Clasificación: {p.Clasificacion || 'N/A'}</small>
                {p.Sinopsis && <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>{p.Sinopsis}</p>}
              </div>

              <button
                onClick={() => handleDeletePelicula(p.IdPelicula)}
                style={{ color: 'red', padding: '5px 10px', cursor: 'pointer' }}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )


}