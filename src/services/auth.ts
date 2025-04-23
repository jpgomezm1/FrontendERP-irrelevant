import { AuthService, type Token } from "@/api";
import { OpenAPI } from "@/api/core/OpenAPI";

/**
 * Hace login contra el backend y guarda los tokens.
 * Devuelve true si todo va bien, false si falla.
 */
export async function login(username: string, password: string) {
  try {
    // Llama al endpoint generado por el SDK
    const tokenResponse: Token = await AuthService.postLogin({
      username,
      password,
    });

    // Guarda los tokens donde prefieras (localStorage es lo más simple)
    localStorage.setItem("access_token", tokenResponse.access_token);
    localStorage.setItem("refresh_token", tokenResponse.refresh_token);

    // ▸ Muy importante: dile al SDK cuál es el token actual
    OpenAPI.TOKEN = tokenResponse.access_token;

    return true;
  } catch {
    return false;
  }
}

export function logout() {
  localStorage.clear();
  OpenAPI.TOKEN = undefined;
}
