import { useState, useEffect } from 'react';
import { getCompras } from '../../services/compraServices';
import type { Compra } from '../../services/compraServices';

export default function AdminCompras() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  //  Estados para los filtros de fecha
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  useEffect(() => {
    async function cargar() {
      try {
        const data = await getCompras();
        setCompras(data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron obtener los registros de compras.');
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  // 👇 Lógica de filtrado por fecha
  const comprasFiltradas = compras.filter((compra) => {
    if (!fechaDesde && !fechaHasta) return true; // Si no hay filtros, muestra todo

    const fechaCompra = new Date(compra.Fecha);
    
    // Ajustamos las fechas para comparar solo el día (ignorando la hora)
    fechaCompra.setHours(0, 0, 0, 0);

    if (fechaDesde) {
      const desde = new Date(`${fechaDesde}T00:00:00`);
      if (fechaCompra < desde) return false;
    }

    if (fechaHasta) {
      const hasta = new Date(`${fechaHasta}T23:59:59`);
      if (fechaCompra > hasta) return false;
    }

    return true;
  });

  if (cargando) return <p style={{ textAlign: 'center', marginTop: '20px' }}>Cargando auditoría de compras...</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ margin: 0 }}> Auditoría de Compras</h2>
        
        {/*  Controles del filtro de fecha */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#141414', padding: '10px', borderRadius: '6px', border: '1px solid #333' }}>
          <label style={{ fontSize: '0.85rem', color: '#aaa' }}>Desde:</label>
          <input 
            type="date" 
            value={fechaDesde} 
            onChange={(e) => setFechaDesde(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#0b0c10', color: '#fff' }}
          />
          
          <label style={{ fontSize: '0.85rem', color: '#aaa', marginLeft: '5px' }}>Hasta:</label>
          <input 
            type="date" 
            value={fechaHasta} 
            onChange={(e) => setFechaHasta(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#0b0c10', color: '#fff' }}
          />

          {/* Botón para limpiar filtros */}
          {(fechaDesde || fechaHasta) && (
            <button 
              onClick={() => { setFechaDesde(''); setFechaHasta(''); }}
              style={{ marginLeft: '10px', padding: '6px 12px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {error && <p style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '5px' }}>{error}</p>}

      {comprasFiltradas.length === 0 && !error ? (
        <p style={{ color: '#666', textAlign: 'center', marginTop: '20px' }}>
          No hay compras registradas en el rango de fechas seleccionado.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {comprasFiltradas.map((c) => {
            const fechaObj = new Date(c.Fecha);
            const fechaFormateada = isNaN(fechaObj.getTime()) 
              ? String(c.Fecha) 
              : fechaObj.toLocaleString('es-AR', { 
                  day: '2-digit', month: '2-digit', year: 'numeric', 
                  hour: '2-digit', minute: '2-digit' 
                });

            return (
              <div
                key={c.IdCompra}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '15px', backgroundColor: '#141414', border: '1px solid #222',
                  borderRadius: '8px', color: '#fff', flexWrap: 'wrap', gap: '10px'
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#ea3a55' }}>
                     {typeof c.funcion === 'object' ? c.funcion.pelicula?.TituloPelicula : 'Película Desconocida'}
                  </h3>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#ccc' }}>
                    🏛️ Sala: {typeof c.funcion === 'object' ? c.funcion.sala?.NumSala : '-'} | 
                    👤 Cliente: {typeof c.usuario === 'object' ? c.usuario.EmailUsuario : `ID ${c.usuario}`}
                    🪑 Asientos: Asientos: {c.AsientosElegidos ? c.AsientosElegidos.split(',').join(', ') : 'N/A'}


                  </p>
                  <small style={{ color: '#888' }}>📅 {fechaFormateada}</small>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>${c.Precio}</p>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#aaa' }}>
                    🎟️ {c.CantEntradas} {c.CantEntradas === 1 ? 'entrada' : 'entradas'} | 💳 {c.MetodoPago}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}