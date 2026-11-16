export interface UsuarioPayload {
  idUsuario: number;
  rol: string;
  email: string;
  iat: number;
  exp: number;
}

export function obtenerUsuarioDesdeToken(): UsuarioPayload | null {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    // el JWT tiene 3 partes separadas por punto: Header.Payload.Signature
    // agarramos la parte del medio (índice 1)
    const payloadBase64 = token.split('.')[1];
    
    // atob() decodifica el base64 a un string JSON
    const payloadDecodificado = JSON.parse(atob(payloadBase64));
    
    // verificamos que el token no esté vencido
    const ahora = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
    if (payloadDecodificado.exp && payloadDecodificado.exp < ahora) {
      // si está vencido, lo eliminamos del storage y devolvemos null
      localStorage.removeItem('token');
      return null;
    }
    
    return payloadDecodificado as UsuarioPayload;
  } catch (error) {
    console.error('Error al decodificar el token', error);
    return null;
  }
}