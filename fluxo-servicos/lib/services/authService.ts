import { adminAuth } from "@/lib/firebase/admin";
import { usuarioRepository } from "@/lib/repositories/usuarioRepository";

export class TokenInvalidoError extends Error {}
export class ContaBloqueadaError extends Error {}

export const authService = {
  async sincronizarUsuario(token: string) {
    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(token);
    } catch {
      throw new TokenInvalidoError();
    }

    let usuario = await usuarioRepository.buscarPorFirebaseUid(decoded.uid);

    if (!usuario) {
      usuario = await usuarioRepository.criar({
        firebaseUid: decoded.uid,
        email: decoded.email ?? "",
        nome: decoded.name ?? "",
      });
    }

    if (usuario.bloqueado) {
      throw new ContaBloqueadaError();
    }

    return usuario;
  },
};
