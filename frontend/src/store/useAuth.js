import { create } from 'zustand';

const useAuth = create((set) => ({
  token: localStorage.getItem('token') || null,
  setToken: (token) => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    set({ token });
  }
}));

export default useAuth;