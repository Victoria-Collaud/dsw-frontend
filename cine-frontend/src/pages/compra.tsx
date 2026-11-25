import { useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Metodopago } from '../services/compraServices';
import { useFuncionPorId } from '../hooks/useFunciones';
import { useAsientosDeSala } from '../hooks/useSalas';
import { useAsientosOcupados, useCrearCompra } from '../hooks/useCompras';
import { obtenerUsuarioDesdeToken } from '../utils/auth.ts';
import '../pages/Compra.css';
import Loader from '../components/Loader';
import { useAlerta } from '../hooks/useAlerta.ts';


export default function Compra() {
  const { funcionId } = useParams<{ funcionId: string }>();
  const navigate = useNavigate();

  const idFuncionNum = Number(funcionId); 
  const idFuncionValido = Number.isFinite(idFuncionNum) && idFuncionNum > 0; 
  const [metodoPago, setMetodoPago] = useState<Metodopago>(Metodopago.MERCADO_PAGO);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState<string[]>([]);
  const usuario = obtenerUsuarioDesdeToken();
  const { alertaExito, alertaError, alertaAdvertencia } = useAlerta();
  const compraMutation = useCrearCompra(idFuncionNum);

  const {
    data: funcion,
    isLoading: cargandoFuncion,
    isError: errorFuncion,
  } = useFuncionPorId(idFuncionValido ? idFuncionNum : undefined);

  const numSala = funcion?.sala?.NumSala; 

  const {
    data: asientosDisponibles = [],
    isLoading: cargandoAsientosSala,
  } = useAsientosDeSala(numSala);

  const {
    data: asientosOcupados = [],
    isLoading: cargandoOcupados,
  } = useAsientosOcupados(idFuncionValido ? idFuncionNum : undefined);

  function toggleAsiento(asiento: string) {
    if (asientosOcupados.includes(asiento)) return;

    if (asientosSeleccionados.includes(asiento)) {
      setAsientosSeleccionados(asientosSeleccionados.filter((a) => a !== asiento));
    } else {
      if (asientosSeleccionados.length >= 5) {
        alertaAdvertencia('Límite alcanzado', 'Solo podés seleccionar hasta 5 asientos.');
        return;
      }
      setAsientosSeleccionados([...asientosSeleccionados, asiento]);
    }
  }

  // Estado de carga unificado desde las queries
  const cargando =
    cargandoFuncion || (Boolean(numSala) && cargandoAsientosSala) || cargandoOcupados;

  if (!idFuncionValido) { 
    return <p className="compra-not-found">Función inválida.</p>; 
  } 

  if (cargando) {
    return <Loader mensaje="Cargando..." />;
  }

  if (errorFuncion || !funcion) { 
    return <p className="compra-not-found">Función no encontrada.</p>;

  }

  const precioUnitario = funcion.sala.PrecioSala;
  const total = asientosSeleccionados.length * precioUnitario;
  const procesandoCompra = compraMutation.isPending || compraMutation.isSuccess; 

  async function handleComprar(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario || !usuario.idUsuario) {
      alertaError('Sesión requerida', 'Tenés que iniciar sesión para comprar.');
      return;
    }
    if (asientosSeleccionados.length === 0) {
      alertaAdvertencia('Sin asientos', 'Seleccioná al menos un asiento.');
      return;
    }
    if (!funcion) {
      alertaError('Función no encontrada', 'No se encontró la función seleccionada.');
      return;
    }
    const capacidadMaxima = funcion.CapacidadDisponible ?? 0;
    if (asientosSeleccionados.length > capacidadMaxima) {
      alertaError(
        'Capacidad excedida',
        `Solo quedan ${capacidadMaxima} entradas disponibles para esta función.`
      );
      return;
    }

    try {
      await compraMutation.mutateAsync({
        MetodoPago: metodoPago,
        AsientosElegidos: asientosSeleccionados,
        CantEntradas: asientosSeleccionados.length,
        IdUsuario: usuario.idUsuario,
        IdFuncion: idFuncionNum,
      });
      setAsientosSeleccionados([]);
      alertaExito('¡Compra exitosa!', 'Redirigiendo a la cartelera...');
      setTimeout(() => {
        navigate('/', { state: { compraExitosa: true } });
      }, 2000);
    } catch (err) {
      console.error(err);
      const mensajeError =
        err instanceof Error ? err.message : 'Hubo un error al procesar la compra.';
      alertaError('Error al comprar', mensajeError);
    }
  }

 return (
    <div className="compra-container">
      <div className="compra-header">
        <h2 className="compra-title">Finalizar Compra</h2>
      </div>

      {/* Resumen de la Función seleccionada */}
      <div className="compra-resumen-funcion">
        <h3 className="compra-pelicula-titulo">{funcion.pelicula.TituloPelicula}</h3>
        <p className="compra-detalle-texto">Fecha: {new Date(funcion.Fecha).toLocaleDateString('es-AR')}</p>
        <p className="compra-detalle-texto">Horario: {funcion.Horario}</p>
        <p className="compra-detalle-texto">Sala #{funcion.sala.NumSala}</p>
        <p className="compra-detalle-iconos">
          <span className="compra-detalle-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 21h10" />
              <rect width="20" height="14" x="2" y="3" rx="2" />
            </svg>
            Pantalla: {funcion.sala.TipoPantalla}
          </span>
          <span>|</span>
          <span className="compra-detalle-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
              <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
              <path d="M5 18v2" />
              <path d="M19 18v2" />
            </svg>
            Asientos: {funcion.sala.TipoAsientos}
          </span>
        </p>
        <p className="compra-disponibles">Asientos disponibles: {funcion.CapacidadDisponible}</p>
      </div>

      
      {/* MAPA DE ASIENTOS */}
      <div className="compra-mapa-seccion">
        <h3>Seleccioná tus asientos:</h3>

        <div className="compra-pantalla-wrapper">
          <div className="compra-pantalla-barra"></div>
          <p className="compra-pantalla-texto">PANTALLA</p>
        </div>

        <div className="compra-filas-container">
          {Array.from(new Set(asientosDisponibles.map(a => a[0]))).map(fila => (
            <div key={fila} className="compra-fila">
              <span className="compra-fila-letra">{fila}</span>
              {asientosDisponibles.filter(a => a[0] === fila).map(asiento => {
                const ocupado = asientosOcupados.includes(asiento);
                const seleccionado = asientosSeleccionados.includes(asiento);
                return (
                  <button
                    key={asiento}
                    type="button"
                    onClick={() => toggleAsiento(asiento)}
                    disabled={ocupado}
                    className={`compra-asiento-btn ${ocupado ? 'ocupado' : ''} ${seleccionado ? 'seleccionado' : ''}`}
                  >
                    {asiento.slice(1)}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="compra-seleccionados-texto">
          {asientosSeleccionados.length > 0
            ? `Seleccionados: ${asientosSeleccionados.join(', ')}`
            : 'Ningún asiento seleccionado'}
        </div>
      </div>

      <form onSubmit={handleComprar} className="compra-form">
        {/* PANEL DE RESUMEN DINÁMICO */}
        <div className="compra-resumen-pago">
          <p className="compra-pago-item">
            Entradas a comprar: <strong>{asientosSeleccionados.length}</strong>
          </p>
          <p className="compra-pago-item">
            Precio por entrada: <strong>${precioUnitario}</strong>
          </p>
          <h3 className="compra-pago-total">Total a Pagar: ${total}</h3>
        </div>

        <div>
          <label className="compra-label">Método de Pago:</label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value as Metodopago)}
            className="compra-select"
          >
            <option value={Metodopago.MERCADO_PAGO}>Mercado Pago</option>
            <option value={Metodopago.TARJETA_CREDITO}>Tarjeta de Crédito</option>
            <option value={Metodopago.TARJETA_DEBITO}>Tarjeta de Débito</option>
            <option value={Metodopago.TRANSFERENCIA}>Transferencia Bancaria</option>
          </select>
        
        </div>


       <button
          type="submit"
          disabled={procesandoCompra || asientosSeleccionados.length === 0}
          className="compra-btn-confirmar"
        >
          {procesandoCompra
            ? 'Procesando...'
            : asientosSeleccionados.length === 0
            ? 'Seleccioná un asiento'
            : `Confirmar y Pagar (${asientosSeleccionados.length} ${asientosSeleccionados.length === 1 ? 'entrada' : 'entradas'})`}
        </button>
      </form>
    </div>
  ); }