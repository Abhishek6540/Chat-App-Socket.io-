import axios, { AxiosInstance, AxiosError } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const refreshAccessToken = async () => {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    );

    const newAccessToken = res.data.access_token;

    localStorage.setItem("authToken", newAccessToken);

    return newAccessToken;
  } catch (error) {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
    return null;
  }
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response.data,

  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (error.response?.status === 401 || error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newToken = await refreshAccessToken();

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return axiosInstance(originalRequest); 
      }
    }

    return Promise.reject(error.response?.data || error.message);
  },
);

export default axiosInstance;
