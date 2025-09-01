import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTheme } from '../contexts/ThemeContext';

const Register = (props) => {
    const [error, setError] = useState(null);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [selectedFileAvatar, setSelectedFileAvatar] = useState(null);
    const { setAccessToken, setUsername, setAvatarLink } = useAuth();
    const { theme } = useTheme();
    const isPasswordValid = (password) => {
        return password && password.length >= 8 && password.length <= 24;
    }
    const isUsernameValid = (username) => {
        username = username.trim();
        return username && username.length >= 3 && username.length <= 20;
    }
    const isEmailValid = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    const [formData, setformData] = useState({ username: "", email: "", password: "" });
    const isFormValid = isUsernameValid(formData.username) && isEmailValid(formData.email) && isPasswordValid(formData.password) && (selectedAvatar || selectedFileAvatar);
    const navigate = useNavigate();
    // Store username and password in state

    // Default avatars array
    const defaultAvatars = [
        {
            id: 1,
            src: "https://res.cloudinary.com/harshitbd/image/upload/v1751105892/vxi4hdzknhh5c8bekrwr.png",
            alt: "Samurai"
        },
        {
            id: 2,
            src: "https://res.cloudinary.com/harshitbd/image/upload/v1751107358/Gemini_Generated_Image_5kbrju5kbrju5kbr_l4gdqb.png",
            alt: "Ninja"
        },
        {
            id: 3,
            src: "https://res.cloudinary.com/harshitbd/image/upload/v1751106265/Gemini_Generated_Image_nfvrfsnfvrfsnfvr_t9loqj.png",
            alt: "Wizard"
        },
        {
            id: 4,
            src: "https://res.cloudinary.com/harshitbd/image/upload/v1751106265/Gemini_Generated_Image_9fz4199fz4199fz4_gaijb6.png",
            alt: "Knight"
        },
        {
            id: 5,
            src: "https://res.cloudinary.com/harshitbd/image/upload/v1751106264/Gemini_Generated_Image_d2xqycd2xqycd2xq_ts9a8g.png",
            alt: "Demon"
        }
    ];

    // Handle input changes
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setformData({ ...formData, [id]: value })
        setError(null);
    };

    // Handle file change for custom avatar
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFileAvatar(file);
            setSelectedAvatar(null);
            setError(null);
        }
    }
    // Handle avatar selection
    const handleAvatarSelect = (avatar) => {
        setSelectedAvatar(avatar);
        setSelectedFileAvatar(null);
        setError(null);
    };

    // Send data to the server
    const sendRegisterReq = async (e) => {
        e.preventDefault();

        if (!selectedAvatar && !selectedFileAvatar) {
            setError("Please select an avatar");
            return;
        }

        const uploadData = new FormData();

        // Always append these required fields
        uploadData.append("username", formData.username);
        uploadData.append("email", formData.email);
        uploadData.append("password", formData.password);

        // Only append file if it exists
        if (selectedFileAvatar) {
            uploadData.append("avatar", selectedFileAvatar);
        }

        // Only append avatarLink if a default avatar is selected (NOT null)
        if (selectedAvatar && selectedAvatar.src) {
            uploadData.append("avatarLink", selectedAvatar.src);
        }


        try {
            const response = await api.post("/auth/register", uploadData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            const note = "Your first-time login requires the password sent to your email. Afterward, use your registered password.";
            navigate(`/login?username=${formData.username}&note=${encodeURIComponent(note)}`);
        } catch (error) {
            console.log("Error:", error);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Registration failed. Please try again.");
            }
        }
    }
    return (
    <div className={`h-full flex flex-col items-center justify-start transition-all duration-300 ${theme === 'tos' ? 'tos' : theme === 'cyberpunk' ? 'cyberpunk-bg neon-text' : 'bg-gray-100 dark:bg-gray-900'}`} style={{ padding: 'calc(2 * var(--unit))' }}>
        <img title='ReviseCoder' src={"https://res.cloudinary.com/harshitbd/image/upload/v1755760194/ReviseCoder-modified_x58b5u.png"} style={{ imageRendering: 'pixelated', width: 'calc(8 * var(--unit))', marginBottom: 'calc(1.5 * var(--unit))' }} onClick={() => navigate("/")} className={`cursor-pointer ${theme === 'tos' ? 'tos-accent tos-theme-mono' : ''}`} alt="" />
        <div className={`rounded-xl shadow-lg ${theme === 'tos' ? 'tos tos-border' : theme === 'cyberpunk' ? 'bg-black border-2 border-cyan-400 neon-text' : 'bg-white dark:bg-gray-800'}`} style={{ width: 'calc(20 * var(--unit-lg))', padding: 'calc(2 * var(--unit))' }}>

            <h2 className={`font-bold text-center ${theme === 'tos' ? 'tos-accent' : theme === 'cyberpunk' ? 'text-cyan-400' : 'text-gray-800'}`} style={{ fontSize: 'calc(1.5 * var(--text-base))', marginBottom: 'calc(1.5 * var(--unit))' }}>Register</h2>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 'calc(1 * var(--unit))' }}>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 rounded" style={{ padding: 'calc(0.5 * var(--unit))', fontSize: 'var(--text-sm)' }}>
                        {error}
                    </div>
                )}
                {/* Avatar Selection Section */}
                <div>
                    <div className="flex justify-center items-center flex-nowrap" style={{ gap: 'calc(0.9 * var(--unit))' }}>
                        {defaultAvatars.map((avatar) => (
                            <div
                                key={avatar.id}
                                onClick={() => handleAvatarSelect(avatar)}
                                className={`cursor-pointer transition-all duration-200 transform hover:scale-105 flex-shrink-0 ${selectedAvatar?.id === avatar.id
                                    ? theme === 'tos' ? 'ring-2 tos-border' : 'ring-2 ring-indigo-500 ring-offset-1'
                                    : theme === 'tos' ? 'ring-1 tos-border hover:tos-accent' : 'ring-1 ring-gray-200 hover:ring-indigo-300'
                                    } rounded-full`}
                                style={{ padding: 'calc(0.125 * var(--unit))' }}
                            >
                                <img
                                    src={avatar.src}
                                    alt={avatar.alt}
                                    className={`rounded-full object-cover border ${theme === 'tos' ? 'tos-border' : 'border-white dark:border-gray-700'}`}
                                    style={{ width: 'calc(3 * var(--unit))', height: 'calc(3 * var(--unit))' }}
                                />
                            </div>
                        ))}
                        <div className={`cursor-pointer transition-all duration-200 transform hover:scale-105 flex-shrink-0 rounded-full flex items-center justify-center relative overflow-hidden ${theme === 'tos' ? 'tos-border bg-[#23234a]' : 'ring-1 ring-gray-200 hover:ring-indigo-300 bg-gray-100 dark:bg-gray-700'}`} style={{ padding: 'calc(0.125 * var(--unit))', width: 'calc(3 * var(--unit))', height: 'calc(3 * var(--unit))' }}>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${theme === 'tos' ? 'bg-[#23234a]' : ''} `}
                            />
                            {!selectedFileAvatar && (
                                <img
                                    src="/plus.svg"
                                    alt="Add file"
                                    style={{ width: 'calc(1.5 * var(--unit))', height: 'calc(1.5 * var(--unit))' }}
                                />
                            )}
                            {selectedFileAvatar && (
                                <span className="truncate max-w-[80%]" style={{ fontSize: 'var(--text-xs)' }}>
                                    {selectedFileAvatar.name}
                                </span>
                            )}
                        </div>
                    </div>
                    {(selectedAvatar || selectedFileAvatar) && (
                        <p className={`text-center ${theme === 'tos' ? 'tos-light tos-theme-mono' : 'text-gray-600 dark:text-gray-400'}`} style={{ fontSize: 'var(--text-sm)', marginTop: 'calc(0.5 * var(--unit))' }}>
                            {selectedAvatar ? selectedAvatar.alt : "Custom Avatar"}
                        </p>
                    )}
                </div>
                {(selectedAvatar != null || selectedFileAvatar != null) ? null : <label className={`block font-medium text-center ${theme === 'tos' ? 'tos-accent tos-theme-mono' : 'text-gray-700 dark:text-gray-200'}`} style={{ fontSize: 'var(--text-sm)' }}>
                    Choose a default avatar
                </label>}

                <div>
                    <label className={`block font-medium ${theme === 'tos' ? 'tos-accent tos-theme-mono' : 'text-gray-700 dark:text-gray-200'}`} style={{ fontSize: 'var(--text-base)', marginBottom: 'calc(0.25 * var(--unit))' }} htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        style={{ padding: 'calc(0.5 * var(--unit))', fontSize: 'var(--text-base)' }}
                        required
                    />
                    {!isUsernameValid(formData.username) && (<p className="dark:text-gray-400 text-gray-500" style={{ fontSize: 'var(--text-xs)', marginTop: 'calc(0.25 * var(--unit))' }}>Username must be 3-20 characters long.</p>)}
                </div>
                <div>
                    <label className={`block font-medium ${theme === 'tos' ? 'tos-accent tos-theme-mono' : 'text-gray-700 dark:text-gray-200'}`} style={{ fontSize: 'var(--text-base)', marginBottom: 'calc(0.25 * var(--unit))' }} htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        style={{ padding: 'calc(0.5 * var(--unit))', fontSize: 'var(--text-base)' }}
                        required
                    />
                    {!isEmailValid(formData.email) && (<p className="dark:text-gray-400 text-gray-500" style={{ fontSize: 'var(--text-xs)', marginTop: 'calc(0.25 * var(--unit))' }}>Please enter a valid email address.</p>)}
                </div>
                <div>
                    <label className={`block font-medium ${theme === 'tos' ? 'tos-accent tos-theme-mono' : 'text-gray-700 dark:text-gray-200'}`} style={{ fontSize: 'var(--text-base)', marginBottom: 'calc(0.25 * var(--unit))' }} htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        style={{ padding: 'calc(0.5 * var(--unit))', fontSize: 'var(--text-base)' }}
                        required
                    />
                    {!isPasswordValid(formData.password) && (<p className="dark:text-gray-400 text-gray-500" style={{ fontSize: 'var(--text-xs)', marginTop: 'calc(0.25 * var(--unit))' }}>Password must be 8-24 characters long.</p>)}
                </div>
                <button type="submit" className={`w-full font-semibold rounded-lg transition-colors duration-200 ${isFormValid ? 'bg-indigo-600 hover:bg-indigo-700' : 'opacity-50 cursor-not-allowed bg-gray-500'}`} style={{ padding: 'calc(0.5 * var(--unit))', fontSize: 'calc(1.125 * var(--text-base))' }} onClick={sendRegisterReq}>Register</button>
            </form>
        </div>
    </div>
);

}

export default React.memo(Register);