import { create } from 'zustand';

const useStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      set({ token, isAuthenticated: true });
    } else {
      localStorage.removeItem('token');
      set({ token: null, isAuthenticated: false });
    }
  },
}));

export default useStore;