// api.js
import axios from "axios";

// This is where we'll store the token, but it will be managed externally
let accessToken = null;

// Function to set the token from outside
export const setApiAccessToken = (token) => {
  accessToken = token;
};

// Function to clear the token from outside
export const clearApiAccessToken = () => {
  accessToken = null;
};

const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});
console.log("api.js re-rendered")

// Request interceptor: attach access token
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401/403 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Check for 401 and make sure it's not a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh token using a separate axios instance to avoid a recursive loop
        const res = await axios.post("/api/v1/auth/refresh-token", {}, { withCredentials: true });
        
        // Update the token in our external variable
        const newAccessToken = res.data.data.accessToken;
        setApiAccessToken(newAccessToken);
        
        // Update the token in the original request headers
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Dispatch an event to notify the AuthContext that the token has been refreshed
        window.dispatchEvent(new CustomEvent('token-refreshed', { detail: { token: newAccessToken } }));
        
        // Retry the original request with the new token
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed, logging out user...");
        // Dispatch an event to trigger logout
        window.dispatchEvent(new Event('trigger-logout'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;