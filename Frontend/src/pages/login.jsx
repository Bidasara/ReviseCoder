import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from '../contexts/ThemeContext';

const Login = (props) => {
    const [searchParams] = useSearchParams();
    const [error, setError] = useState(decodeURIComponent(searchParams.get('note')) || null);
    const navigate = useNavigate();
    const { login, isLoggedIn, loading } = useAuth();
    const { theme } = useTheme();
    const [formData, setFormData] = useState({ username: `${searchParams.get('username') ? searchParams.get('username') : ''}`, password: "" });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        setError(null);
    };

    useEffect(() => {
        if (!loading && isLoggedIn) {
            navigate('/home');
        }
    }, [isLoggedIn, loading, navigate]);

    const sendLoginReq = async (e) => {
        e.preventDefault();
        await login(formData);
    };

    return (
    <div className={`h-full flex flex-col items-center justify-start transition-all duration-300 ${theme === 'tos' ? 'tos' : theme === 'cyberpunk' ? 'cyberpunk-bg neon-text' : 'bg-gray-100'}`} style={{ padding: 'calc(2 * var(--unit))' }}>
        
        <img 
            title='Revise Coder' 
            src={"https://res.cloudinary.com/harshitbd/image/upload/v1755760194/ReviseCoder-modified_x58b5u.png"} 
            style={{ 
                imageRendering: 'pixelated',
                width: 'calc(8 * var(--unit))',
                marginBottom: 'calc(1.5 * var(--unit))'
            }} 
            onClick={() => navigate("/")} 
            className={`cursor-pointer ${theme === 'tos' ? 'tos-accent tos-theme-mono' : ''}`} 
            alt="Revise Coder Logo" 
        />
        
        <div className={`rounded-xl shadow-lg ${theme === 'tos' ? 'tos tos-border' : theme === 'cyberpunk' ? 'bg-black border-2 border-pink-500 neon-text' : 'bg-white'}`} style={{ width: 'calc(20 * var(--unit-lg))', padding: 'calc(2 * var(--unit))' }}>
            <h2 className={`font-bold text-center ${theme === 'tos' ? 'tos-accent' : theme === 'cyberpunk' ? 'text-cyan-400' : 'text-gray-800'}`} style={{ fontSize: 'calc(1.5 * var(--text-base))', marginBottom: 'calc(1.5 * var(--unit))' }}>
                Login
            </h2>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 'calc(1 * var(--unit))' }}>
                {(error!="null" && error) && (
                    <div className="bg-red-100 border border-red-400 text-red-700 rounded" style={{ padding: 'calc(0.5 * var(--unit))', fontSize: 'var(--text-sm)' }}>
                        {error}
                    </div>
                )}
                <div>
                    <label className={`block font-medium ${theme === 'tos' ? 'tos-accent' : theme === 'cyberpunk' ? 'text-pink-400' : 'text-gray-700'}`} style={{ fontSize: 'var(--text-base)', marginBottom: 'calc(0.25 * var(--unit))' }} htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg focus:outline-none focus:ring-2 ${theme === 'tos' ? 'tos-border' : 'border border-gray-300 focus:ring-indigo-500'}`}
                        style={{ padding: 'calc(0.5 * var(--unit))', fontSize: 'var(--text-base)' }}
                        required
                    />
                </div>
                <div>
                    <label className={`block font-medium ${theme === 'tos' ? 'tos-accent' : theme === 'cyberpunk' ? 'text-pink-400' : 'text-gray-700'}`} style={{ fontSize: 'var(--text-base)', marginBottom: 'calc(0.25 * var(--unit))' }} htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg focus:outline-none focus:ring-2 ${theme === 'tos' ? 'tos-border' : 'border border-gray-300 focus:ring-indigo-500'}`}
                        style={{ padding: 'calc(0.5 * var(--unit))', fontSize: 'var(--text-base)' }}
                        required
                    />
                </div>
                <button type="submit" className={`w-full font-semibold rounded-lg transition-colors duration-200 ${theme === 'tos' ? 'tos-border tos-accent' : 'text-white bg-indigo-600 hover:bg-indigo-700'}`} style={{ padding: 'calc(0.5 * var(--unit))', fontSize: 'calc(1.125 * var(--text-base))' }} onClick={sendLoginReq}>Login</button>
                
                <div className="text-center" style={{ fontSize: 'var(--text-base)', display: 'flex', flexDirection: 'column', gap: 'calc(0.5 * var(--unit))' }}>
                    <div>OR</div>
                    <div>
                        <span className={`text-gray-600 ${theme === 'cyberpunk' ? 'text-cyan-300' : ''}`}>Don't have an account? </span>
                        <span className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-800" onClick={() => navigate("/register")}>Sign Up</span>
                    </div>
                    <div>OR</div>
                    <div>
                        <span className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-800" onClick={() => navigate("/getEmail")}>Forgot Password ?</span>
                    </div>
                </div>
            </form>
        </div>
    </div>
);

}

export default Login;