import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors globally
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 403) {
      // Handle unauthorized access with user-friendly messages
      const message = error.response.data?.message || 'You do not have permission to perform this action';
      
      // Show toast notification for unauthorized access
      if (typeof window !== 'undefined') {
        import('react-toastify').then(({ toast }) => {
          toast.error(message, {
            position: 'top-right',
            autoClose: 5000,
          });
        });
      }
    }
    
    return Promise.reject(error);
  }
);

export default instance;
