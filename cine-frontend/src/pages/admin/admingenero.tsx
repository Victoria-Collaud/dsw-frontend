
//export default function AdminGeneros() import { useState, useEffect } from 'react'
import { useEffect, useState, type FormEvent } from 'react'
import { getGeneros, createGenero } from '../../services/generosServices'
import { type Genero } from '../../services/generosServices'

export default function AdminGeneros() {
  const [generos, setGeneros] = useState<Genero[]>([])
  const [nombreGenero, setNombreGenero] = useState('')
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nombreGenero.trim()) {
      setError('El nombre del género es obligatorio.')
      return
    }

    try {
      await createGenero({ NombreGenero: nombreGenero })
      setNombreGenero('')
      setError('')
      cargarGeneros()
    } catch {
      setError('Error al crear el género.')
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>🎭 Gestión de Géneros</h2>

      {error && <p style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        <h3>Agregar Nuevo Género</h3>
        <input
          type="text"
          placeholder="Ej: Acciones, Comedia, Terror..."
          value={nombreGenero}
          onChange={(e) => setNombreGenero(e.target.value)}
          style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
        />
        <button type="submit" style={{ padding: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
          Crear Género
        </button>
      </form>

      <h3>Listado de Géneros</h3>
      {generos.length === 0 ? (
        <p>No hay géneros cargados.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {generos.map((g) => (
            <li key={g.CodGenero} style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>
              <strong>#{g.CodGenero}</strong> - {g.NombreGenero}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}