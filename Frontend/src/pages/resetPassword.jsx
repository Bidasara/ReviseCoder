import React from 'react';
import { useState } from "react";
import { useNavigate,useSearchParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from '../contexts/ThemeContext';

const ResetPassword = (props) => {
    const {setATokenExpiry,setAccessToken,setAvatarLink,setUsername} = useAuth();
    const [error, setError] = useState("A reset code has been sent to your registered email, use that here");
    const navigate = useNavigate();
    const { login } = useAuth();
    const { theme } = useTheme();
    const [searchParams] = useSearchParams();

    // Store username and password in state
    const [formData, setformData] = useState({ resetCode: "", password: "", confirmPassword: "" });

    // Handle input changes
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setformData({ ...formData, [id]: value })
        setError(null);
    };

    // Send data to the server
    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = searchParams.get('email'); 
        if (formData.password != formData.confirmPassword) {
            setError("The new password and the confirm password should be same")
            return;
        }
        if (!email) {
            setError("Email parameter is missing from the URL.");
            return;
        }
        try {
            console.log(email)
            const response = await api.post('auth/reset-password', {
                email: email,
                password: formData.password,
                token: formData.resetCode
            })
            console.log(response)
            const { accessToken, user, accessTokenExpiry, refreshTokenExpiry } = response.data.data;
            setAccessToken(accessToken); // Store accessToken in memory
            setATokenExpiry(accessTokenExpiry);
            setUsername(user.username);
            setAvatarLink(user.avatar);
            localStorage.setItem("username", user.username);
            localStorage.setItem("avatarLink", user.avatar);
            navigate("/");
        } catch (error) {
            console.log(error)
            if (error.response && error.response.data) {
                setError(error.response.data.message || 'An error occurred');
            } else {
                setError(error.message);
            }
        }
    }
    return (
    <div className={`h-full flex flex-col items-center justify-start transition-all duration-300 ${theme === 'tos' ? 'tos' : theme === 'cyberpunk' ? 'cyberpunk-bg neon-text' : 'bg-gray-100 dark:bg-gray-900'}`} style={{ padding: 'calc(2 * var(--unit))' }}>
        <img title='ReviseCoder' src={"https://res.cloudinary.com/harshitbd/image/upload/v1755760194/ReviseCoder-modified_x58b5u.png"} style={{ imageRendering: 'pixelated', width: 'calc(8 * var(--unit))', marginBottom: 'calc(1.5 * var(--unit))' }} onClick={() => navigate("/")} className={`cursor-pointer ${theme === 'tos' ? 'tos-accent tos-theme-mono' : ''}`} alt="" />
        <div className={`rounded-xl shadow-lg ${theme === 'tos' ? 'tos tos-border' : theme === 'cyberpunk' ? 'bg-black border-2 border-pink-500 neon-text' : 'bg-white dark:bg-gray-800'}`} style={{ width: 'calc(20 * var(--unit-lg))', padding: 'calc(2 * var(--unit))' }}>
            <h2 className={`font-bold text-center ${theme === 'tos' ? 'tos-accent tos-theme-mono' : theme === 'cyberpunk' ? 'text-cyan-400 neon-text' : 'text-gray-800 dark:text-white'}`} style={{ fontSize: 'calc(1.5 * var(--text-base))', marginBottom: 'calc(1.5 * var(--unit))' }}>Reset Password</h2>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 'calc(1 * var(--unit))' }}>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 rounded" style={{ padding: 'calc(0.75 * var(--unit))', fontSize: 'var(--text-sm)' }}>
                        {error}
                    </div>
                )}
                <div>
                    <label className={`block font-medium ${theme === 'tos' ? 'tos-accent tos-theme-mono' : theme === 'cyberpunk' ? 'text-pink-400 neon-text' : 'text-gray-700 dark:text-gray-200'}`} style={{ fontSize: 'var(--text-base)', marginBottom: 'calc(0.5 * var(--unit))' }} htmlFor="password">Reset Code</label>
                    <input
                        type="password"
                        id="resetCode"
                        value={formData.resetCode}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg focus:outline-none focus:ring-2 ${theme === 'tos' ? 'tos-border tos-theme-mono' : 'border border-gray-300 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'}`}
                        style={{ padding: 'calc(0.75 * var(--unit))', fontSize: 'var(--text-base)' }}
                        required
                    />
                </div>
                <div>
                    <label className={`block font-medium ${theme === 'tos' ? 'tos-accent tos-theme-mono' : theme === 'cyberpunk' ? 'text-pink-400 neon-text' : 'text-gray-700 dark:text-gray-200'}`} style={{ fontSize: 'var(--text-base)', marginBottom: 'calc(0.5 * var(--unit))' }} htmlFor="password">New Password</label>
                    <input
                        type="password"
                        id="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg focus:outline-none focus:ring-2 ${theme === 'tos' ? 'tos-border tos-theme-mono' : 'border border-gray-300 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'}`}
                        style={{ padding: 'calc(0.75 * var(--unit))', fontSize: 'var(--text-base)' }}
                        required
                    />
                </div>
                <div>
                    <label className={`block font-medium ${theme === 'tos' ? 'tos-accent tos-theme-mono' : theme === 'cyberpunk' ? 'text-pink-400 neon-text' : 'text-gray-700 dark:text-gray-200'}`} style={{ fontSize: 'var(--text-base)', marginBottom: 'calc(0.5 * var(--unit))' }} htmlFor="password">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg focus:outline-none focus:ring-2 ${theme === 'tos' ? 'tos-border tos-theme-mono' : 'border border-gray-300 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'}`}
                        style={{ padding: 'calc(0.75 * var(--unit))', fontSize: 'var(--text-base)' }}
                        required
                    />
                </div>
                <button type="submit" className={`w-full font-semibold rounded-lg transition-colors duration-200 ${theme === 'tos' ? 'tos-border tos-accent tos-theme-mono' : 'text-white bg-indigo-600 hover:bg-indigo-700'}`} style={{ padding: 'calc(0.5 * var(--unit))', fontSize: 'calc(1.125 * var(--text-base))' }} onClick={handleSubmit}>Submit</button>
            </form>
        </div>
    </div>
);

}

export default ResetPassword;