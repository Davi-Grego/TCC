import { usuarioRepository } from "@/lib/repositories/usuarioRepository";

export const usuarioService = {
  async buscarPorFirebaseUid(firebaseUid: string) {
    return await usuarioRepository.buscarPorFirebaseUid(firebaseUid);
  },

  async get_user_by_id(id: string) {
    return await usuarioRepository.get_user_by_id(id);
  },

  async get_username_by_id(id: string) {
    const user = await usuarioRepository.get_user_by_id(id);
    return user?.nome || null;
  },

  
};