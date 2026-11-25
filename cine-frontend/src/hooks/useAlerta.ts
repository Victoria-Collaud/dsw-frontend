import Swal, { type SweetAlertIcon } from 'sweetalert2';

interface AlertaParams {
  titulo: string;
  mensaje: string;
  tipo: SweetAlertIcon;
  timer?: number;
}

export function useAlerta() {
  
  // Función base para alertas simples (éxito, error, warning)
  const dispararAlerta = ({ titulo, mensaje, tipo, timer }: AlertaParams) => {
    return Swal.fire({
      title: titulo,
      text: mensaje,
      icon: tipo,
      confirmButtonColor: '#e50914',
      background: '#141414',
      color: '#fff',
      timer: timer,
      showConfirmButton: !timer,
      allowOutsideClick: false,
    });
  };

  // Atajos para alertas simples
  const alertaExito = (titulo: string, mensaje: string, timer = 2000) => 
    dispararAlerta({ titulo, mensaje, tipo: 'success', timer });

  const alertaError = (titulo: string, mensaje: string) => 
    dispararAlerta({ titulo, mensaje, tipo: 'error' });

  const alertaAdvertencia = (titulo: string, mensaje: string) => 
    dispararAlerta({ titulo, mensaje, tipo: 'warning' });

  // Para confirmaciones (devuelve true o false)
  const alertaConfirmacion = async (titulo: string, mensaje: string, textoboton: string) => {
    const result = await Swal.fire({
      title: titulo,
      text: mensaje,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e50914',
      cancelButtonColor: '#222',
      confirmButtonText: textoboton,
      cancelButtonText: 'Cancelar',
      background: '#141414',
      color: '#fff',
    });
    
  // devuelve true si el usuario hace clic en "confirmar"
    return result.isConfirmed; 
  };

  return { dispararAlerta, alertaExito, alertaError, alertaConfirmacion, alertaAdvertencia };
}