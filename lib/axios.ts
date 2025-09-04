import axios from 'axios'

// สร้าง axios instance พร้อม interceptor
const axiosInstance = axios.create({
  baseURL: '/',
  timeout: 10000,
})

// Request interceptor - เพิ่ม token ใน header อัตโนมัติ
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - จัดการ error และ token expiry
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // ถ้า token หมดอายุหรือไม่ valid
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token')
      // Only redirect if not already on login page to prevent loops
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance 
