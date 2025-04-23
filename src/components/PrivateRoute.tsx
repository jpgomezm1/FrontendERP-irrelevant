import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: JSX.Element;
}

/**
 * Bloquea la navegación si no existe un access_token válido.
 * Cambia la clave de localStorage si guardas el token con otro nombre.
 */
export default function PrivateRoute({ children }: PrivateRouteProps) {
  const token = localStorage.getItem("access_token");

  // Si hay token renderiza los hijos; si no, redirige al login
  return token ? children : <Navigate to="/login" replace />;
}
