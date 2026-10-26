import { useEffect, useState, type FormEvent } from 'react'
import { getGeneros, createGenero, updateGenero, deleteGenero } from '../../services/generosServices'
import { type Genero } from '../../services/generosServices'

export default function AdminGeneros() {
  const [generos, setGeneros] = useState<Genero[]>([])
  const [nombreGenero, setNombreGenero] = useState('')
  const [generoEditando, setGeneroEditando] = useState<number | null>(null)
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

  function limpiarFormulario() {
    setNombreGenero('')
    setGeneroEditando(null)
    setError('')
  }

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
        await updateGenero(generoEditando, { NombreGenero: nombreGenero })
      } else {
        await createGenero({ NombreGenero: nombreGenero })
      }
      
      limpiarFormulario()
      cargarGeneros()
    } catch {
      setError(generoEditando ? 'Error al actualizar el género.' : 'Error al crear el género.')
    }
  }

  async function handleDelete(CodGenero?: number) {
    if (!CodGenero) return
    if (!window.confirm(`¿Seguro que querés eliminar este género?`)) return

    try {
      await deleteGenero(CodGenero)
      cargarGeneros()
      if (generoEditando === CodGenero) limpiarFormulario()
    } catch {
      setError('No se pudo eliminar el género. Verificá que no tenga películas asociadas.')
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      
      <div style={{ margin: '20px 0 30px 0' }}>
        <h2 style={{ fontSize: '1.25rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '2px solid #e50914', paddingBottom: '8px', display: 'inline-block', color: '#fff' }}>
          Gestión de Géneros
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
          {generoEditando ? '✏️ Editar Género' : '➕ Agregar Nuevo Género'}
        </h3>
        
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaa' }}>Nombre del Género:</label>
          <input
            type="text"
            placeholder="Ej: Acción, Comedia, Terror..."
            value={nombreGenero}
            onChange={(e) => setNombreGenero(e.target.value)}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0b0c10', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button 
            type="submit" 
            style={{ flex: 1, padding: '12px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#e50914', color: '#fff', border: 'none', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            {generoEditando ? 'Guardar Cambios' : 'Crear Género'}
          </button>
          
          {generoEditando && (
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

      <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Listado de Géneros
      </h3>

      {generos.length === 0 ? (
        <p style={{ color: '#888' }}>No hay géneros cargados.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {generos.map((g) => (
            <li key={g.CodGenero} style={{ 
              padding: '16px', 
              backgroundColor: '#141414',
              border: '1px solid #222',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: '#fff', fontSize: '1rem' }}>
                <strong style={{ color: '#aaa', marginRight: '10px' }}>#{g.CodGenero}</strong>
                {g.NombreGenero}
              </span>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => handleEditar(g)}
                  style={{ color: '#fff', padding: '6px 12px', cursor: 'pointer', border: '1px solid #333', borderRadius: '4px', backgroundColor: '#222', fontWeight: 'bold', fontSize: '0.85rem' }}
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(g.CodGenero)}
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