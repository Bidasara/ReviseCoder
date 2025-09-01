import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../api.js';

export const useCart = () => {
    const { accessToken } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const fetchData = async() => {
            try {
                const response = await api.get(`/user/cart`)
                setCart(response.data.data);
                return;
            } catch (err) {
                console.error(err);
                return;
            }
        }
        fetchData();
    }, [])


    const addToCart = async (animationId) => {
        try {
            const response = await api.post(`/user/cart/${animationId}`)
            setCart(response.data.data);
        } catch (err) {
            console.error(err);
        }
    }

    const removeFromCart = async (animationId) => {
        try {
            const response = await api.delete(`/user/cart/${animationId}`)
            setCart(response.data.data);
        } catch (err) {
            console.error(err);
        }
    }


    return { isLoading, error, addToCart, removeFromCart, cart };
};