import { useQuery } from '@tanstack/react-query'; // 
import { getCompras } from '../../services/compraServices';
import { useForm, useWatch } from 'react-hook-form';
import './AdminCompra.css';
import Loader from '../../components/Loader';

// definimos la interfaz para las fechas del filtro
interface FiltroFechaData {
  fechaDesde: string;
  fechaHasta: string;
}

export default function AdminCompras() {
  // Consulta de auditoría de compras con TanStack Query
  const {
    data: compras = [],
    isLoading: cargando,
    isError: error,
  } = useQuery({
    queryKey: ['admin', 'compras'],
    queryFn: getCompras,
  });

  // Configuramos el formulario
  const { register, control, reset } = useForm<FiltroFechaData>({
    defaultValues: { fechaDesde: '', fechaHasta: '' },
  });

  // "watch" observa los valores de los inputs en tiempo real
  const fechaDesde = useWatch({ control, name: 'fechaDesde' });
  const fechaHasta = useWatch({ control, name: 'fechaHasta' });
  

  // el filtrado usa los valores de "watch"
  const comprasFiltradas = compras.filter((compra) => {
    if (!fechaDesde && !fechaHasta) return true;
    const fechaCompra = new Date(compra.Fecha);
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

  if (cargando) return <Loader mensaje="Cargando auditoría de compras..." />;

  return (
    <div className="admin-compra-container">

      <div className="admin-compra-header">
        <h2 className="admin-compra-title">Auditoría de Compras</h2>

        {/* Controles del filtro de fecha */}
        <div className="admin-compra-filters">
          <label className="admin-compra-label">Desde:</label>
          <input
            type="date"
            {...register('fechaDesde')}
            className="admin-compra-input"
          />

          <label className="admin-compra-label" style={{ marginLeft: '5px' }}>Hasta:</label>
          <input
            type="date"
            {...register('fechaHasta')}
            className="admin-compra-input"
          />

          {/* Botón para limpiar filtros */}
          {(fechaDesde || fechaHasta) && (
            <button
              type="button" //  evita submits accidentales si está dentro de un form
              onClick={() => { reset({ fechaDesde: '', fechaHasta: '' }); }} // limpiamos con reset
              className="admin-compra-btn-clear"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {error && ( // 
        <p className="admin-compra-error">No se pudieron obtener los registros de compras.</p> 
      )}

      {comprasFiltradas.length === 0 && !error ? (
        <p className="admin-compra-empty">
          No hay compras registradas en el rango de fechas seleccionado.
        </p>
      ) : (
        <div className="admin-compra-list">
          {comprasFiltradas.map((c) => {
            const fechaObj = new Date(c.Fecha);
            const fechaFormateada = isNaN(fechaObj.getTime())
              ? String(c.Fecha)
              : fechaObj.toLocaleString('es-AR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                });

            return (
              <div key={c.IdCompra} className="admin-compra-card">
                <div>
                  <h3 className="admin-compra-movie-title">
                    {typeof c.funcion === 'object' ? c.funcion.pelicula?.TituloPelicula : 'Película Desconocida'}
                  </h3>

                  <div className="admin-compra-details">
                    <span className="admin-compra-detail-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M10 18v-7"/><path d="M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/>
                      </svg>
                      <span>Sala: {typeof c.funcion === 'object' ? c.funcion.sala?.NumSala : '-'}</span>
                    </span>

                    <span className="admin-compra-divider">|</span>

                    <span className="admin-compra-detail-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>
                      </svg>
                      <span>Cliente: {typeof c.usuario === 'object' ? c.usuario.EmailUsuario : `ID ${c.usuario}`}</span>
                    </span>

                    <span className="admin-compra-divider">|</span>

                    <span className="admin-compra-detail-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"/><path d="M5 18v2"/><path d="M19 18v2"/>
                      </svg>
                      <span>Asientos: {c.AsientosElegidos ? c.AsientosElegidos.split(',').join(', ') : 'N/A'}</span>
                    </span>
                  </div>

                  <small className="admin-compra-date">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-clock preview-icon"><path d="M16 14v2.2l1.6 1"/><path d="M16 2v3"/><path d="M21 7.338V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2.338"/><path d="M3 9h5.859"/><path d="M8 2v3"/><circle cx="16" cy="16" r="6"/></svg>
                    {fechaFormateada}
                  </small>
                </div>

                <div className="admin-compra-pricing">
                  <p className="admin-compra-price">${c.Precio}</p>
                  <p className="admin-compra-info">
                    {c.CantEntradas} {c.CantEntradas === 1 ? 'entrada' : 'entradas'} | {c.MetodoPago}
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