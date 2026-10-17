import { useState, useEffect } from 'react'
import { getCompras } from '../../services/compraServices'
import { type Compra } from '../../services/compraServices'

export default function AdminCompras() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    getCompras()
      .then((data) => {
        if (activo) setCompras(data)
      })
      .catch(() => {
        if (activo) setError('No se pudieron obtener los registros de compras.')
      })

    return () => {
      activo = false
    }
  }, [])

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>🎟️ Auditoría de Compras</h2>

      {error && <p style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px' }}>{error}</p>}

      {compras.length === 0 ? (
        <p>No hay compras registradas en el sistema.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {compras.map((c) => (
            <li
              key={c.IdCompra}
              style={{
                padding: '12px',
                marginBottom: '10px',
                border: '1px solid #ccc',
                borderRadius: '6px'
              }}
            >
              <strong>Compra #{c.IdCompra}</strong>
              <br />
              <small>
                💳 Método de Pago: {c.MetodoPago} | 🎟️ Entradas: {c.CantEntradas} | 💰 Total: ${c.Precio}
                <br />
                📅 Fecha: {String(c.Fecha).substring(0, 10)}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
    )
}