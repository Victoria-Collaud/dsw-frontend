import { useEffect, useState, type FormEvent } from 'react'
import { getGeneros, createGenero, updateGenero, deleteGenero } from '../../services/generosServices'
import { type Genero } from '../../services/generosServices'

export default function AdminGeneros() {
  const [generos, setGeneros] = useState<Genero[]>([])
  const [nombreGenero, setNombreGenero] = useState('')
  const [generoEditando, setGeneroEditando] = useState<number | null>(null) // 👈 Estado para edición
  const [error, setError] = useState('')

  useEffect(() => {
    cargarGeneros()
  }, [])

  async function cargarGeneros() {
    setError('')
    try {
      const data = await getGeneros()
      setGeneros(data)
    } catch {
      setError('No se pudieron obtener los géneros.')
    }
  }

  // Limpiar formulario
  function limpiarFormulario() {
    setNombreGenero('')
    setGeneroEditando(null)
    setError('')
  }

  // Cargar datos en el formulario para editar
  function handleEditar(genero: Genero) {
    setNombreGenero(genero.NombreGenero)
    setGeneroEditando(genero.CodGenero!)
    setError('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nombreGenero.trim()) {
      setError('El nombre del género es obligatorio.')
      return
    }

    try {
      if (generoEditando) {
        // MODO EDICIÓN
        await updateGenero(generoEditando, { NombreGenero: nombreGenero })
      } else {
        // MODO CREACIÓN
        await createGenero({ NombreGenero: nombreGenero })
      }
      
      limpiarFormulario()
      cargarGeneros()
    } catch {
      setError(generoEditando ? 'Error al actualizar el género.' : 'Error al crear el género.')
    }
  }

  // Manejador para eliminar
  async function handleDelete(CodGenero?: number) {
    if (!CodGenero) return
    if (!window.confirm(`¿Seguro que querés eliminar el género "${nombreGenero}"?`)) return

    try {
      await deleteGenero(CodGenero)
      cargarGeneros()
      // Si estábamos editando este género, limpiamos
      if (generoEditando === CodGenero) limpiarFormulario()
    } catch {
      setError('No se pudo eliminar el género. Verificá que no tenga películas asociadas.')
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>🎭 Gestión de Géneros</h2>

      {error && <p style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        {/* 👇 Título dinámico */}
        <h3>{generoEditando ? '✏️ Editar Género' : 'Agregar Nuevo Género'}</h3>
        <input
          type="text"
          placeholder="Ej: Acción, Comedia, Terror..."
          value={nombreGenero}
          onChange={(e) => setNombreGenero(e.target.value)}
          style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
        />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ flex: 1, padding: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
            {generoEditando ? 'Guardar Cambios' : 'Crear Género'}
          </button>
          
          {/* 👇 Botón de cancelar en modo edición */}
          {generoEditando && (
            <button 
              type="button" 
              onClick={limpiarFormulario}
              style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#ccc', border: 'none', borderRadius: '4px' }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <h3>Listado de Géneros</h3>
      {generos.length === 0 ? (
        <p>No hay géneros cargados.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {generos.map((g) => (
            <li key={g.CodGenero} style={{ 
              padding: '10px', 
              borderBottom: '1px solid #ccc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span><strong>#{g.CodGenero}</strong> - {g.NombreGenero}</span>
              
              <div style={{ display: 'flex', gap: '5px' }}>
                <button 
                  onClick={() => handleEditar(g)}
                  style={{ color: '#3498db', padding: '5px 10px', cursor: 'pointer' }}
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(g.CodGenero)}
                  style={{ color: 'red', padding: '5px 10px', cursor: 'pointer' }}
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