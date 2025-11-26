import axios from 'axios';

// Cria uma conexão inteligente
const api = axios.create({
  // Se estiver no site (Vercel), usa o link da nuvem. Se estiver no seu PC, usa localhost.
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
});

export default api;