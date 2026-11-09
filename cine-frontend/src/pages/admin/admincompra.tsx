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

  //  Lógica de filtrado por fecha
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
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', color: '#ccc', fontSize: '0.9rem', margin: '0 0 5px 0' }}>
  
  
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M10 18v-7"/><path d="M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/>
    </svg>
    <span>Sala: {typeof c.funcion === 'object' ? c.funcion.sala?.NumSala : '-'}</span>
  </span>

  <span style={{ color: '#555' }}>|</span>


  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>
    </svg>
    <span>Cliente: {typeof c.usuario === 'object' ? c.usuario.EmailUsuario : `ID ${c.usuario}`}</span>
  </span>

  <span style={{ color: '#555' }}>|</span>

 
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"/><path d="M5 18v2"/><path d="M19 18v2"/>
    </svg>
    <span>Asientos: {c.AsientosElegidos ? c.AsientosElegidos.split(',').join(', ') : 'N/A'}</span>
  </span>

</div>
                  <small style={{ color: '#888' }}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-calendar-clock preview-icon"><path d="M16 14v2.2l1.6 1"/><path d="M16 2v3"/><path d="M21 7.338V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2.338"/><path d="M3 9h5.859"/><path d="M8 2v3"/><circle cx="16" cy="16" r="6"/></svg> {fechaFormateada}</small>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '1.1rem', fontWeight: 'bold' , color:'#4ade80'}}>${c.Precio}</p>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#aaa' }}>
                     {c.CantEntradas} {c.CantEntradas === 1 ? 'entrada' : 'entradas'} |  {c.MetodoPago}
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