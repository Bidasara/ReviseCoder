// AuthContext.js
import { createContext, useState, useContext, useEffect, useCallback } from "react";
import api, { setApiAccessToken, clearApiAccessToken } from "../api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState(null);
  const [username, setUsername] = useState(() => localStorage.getItem("username") || null);
  const [avatarLink, setAvatarLink] = useState(() => localStorage.getItem("avatarLink") || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [pixels, setPixels] = useState(0);
  const isLoggedIn = !!accessToken;
  console.log("AuthContext re-rendered")

  // We can combine multiple logout steps into a single function
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error("Server logout failed, proceeding with client logout:", err);
    } finally {
      setAccessToken(null);
      clearApiAccessToken(); // Clear the token in the api.js module
      setUsername(null);
      setAvatarLink(null);
      localStorage.clear();
      if(!window.location.hash.includes('/login') && !window.location.hash.includes('/register') && !window.location.hash.includes('/resetPass') && !window.location.hash.includes('/getEmail') && !window.location.hash.includes('/user/'))
      navigate('/login');
    }
  }, [navigate]);

  // Handler for the custom logout event
  const handleTriggerLogout = useCallback(() => {
    logout();
  }, [logout]);

  // Handler for the custom token refresh event
  const handleTokenRefreshed = useCallback((event) => {
    setAccessToken(event.detail.token);
  }, []);

  // Set up event listeners on component mount
  useEffect(() => {
    window.addEventListener('trigger-logout', handleTriggerLogout);
    window.addEventListener('token-refreshed', handleTokenRefreshed);
    
    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener('trigger-logout', handleTriggerLogout);
      window.removeEventListener('token-refreshed', handleTokenRefreshed);
    };
  }, [handleTriggerLogout, handleTokenRefreshed]);

  // This effect synchronizes the API token with the state
  useEffect(() => {
    if (accessToken) {
      setApiAccessToken(accessToken);
    } else {
      clearApiAccessToken();
    }
  }, [accessToken]);

  // Initial token refresh check
  useEffect(() => {
    if(accessToken)
      return;
    const refreshAndSetUser = async () => {
      try {
        const res = await api.post('/auth/refresh-token');
        const newAccessToken = res.data.data.accessToken;
        
        // Update both the context state and the api module's variable
        setAccessToken(newAccessToken);
        setApiAccessToken(newAccessToken);
        
        // Set user info from localStorage if available
        setUsername(res.data.data.username);
        localStorage.setItem('username',JSON.stringify(res.data.data.username));
        setAvatarLink(res.data.data.avatar);
        localStorage.setItem('avatarLink',JSON.stringify(res.data.data.avatar));

      } catch (err) {
        console.error("Initial token refresh failed. User is not logged in or session expired.");
        // Logout if refresh fails
        logout();
      } finally {
        setLoading(false);
      }
    };

    refreshAndSetUser();
  }, []);

  const login = async (formData) => {
    try {
      const response = await api.post("/auth/login", formData);
      console.log(response.data)

      const { accessToken, user } = response.data.data;
      setAccessToken(accessToken);
      setApiAccessToken(accessToken); // Synchronize token with the api.js module
      setUsername(user.username);
      setAvatarLink(user.avatar);
      localStorage.setItem("username", user.username);
      localStorage.setItem("avatarLink", user.avatar);
      navigate("/");
    } catch (error) {
      console.log("Login failed:", error);
      setError(error.response?.data?.message || "Login failed. Please try again.");
    }
  };


  const value = {
    accessToken,
    username,
    avatarLink,
    loading,
    isLoggedIn,
    logout,
    login,
    cart,
    setCart,
    pixels,
    setPixels,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);