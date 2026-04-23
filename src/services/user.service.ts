import api from "@/lib/api";

export const UserService = {
  updateProfile: async (data: { name: string }) => {
    const res = await api.patch('/users/me', data);
    return res.data.user; 
  },

  deleteAccount: async () => {
    const res = await api.delete('/users/me');
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/users/me');
    return res.data;
  }
}