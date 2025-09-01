import React, { useEffect, useState, useRef } from 'react';
import SpriteDemo from '../components/AnimationPart/SpriteAnimation.jsx';
import BreakDemo from '../components/AnimationPart/BreakAnimations.jsx';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../hooks/useCart.js';
import api from '../api';
import { getAccessToken } from '../authToken';
import { useNavigate } from 'react-router-dom';

const getAllAnimationPacks = async () => {
  try {
    const response = await api.get('/animation/allAnim', {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching animation packs:", error);
    return [];
  }
}

function AnimationCard({ pack }) {
  const parentRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [currentAnimation, setCurrentAnimation] = useState('idle');

  const [showBreakAnimation, setShowBreakAnimation] = useState(false);
  const breakTimeoutRef = useRef(null);
  const waitForBreak = useRef(null);
  const ANIMATION_DELAY = pack.pack.break.delay;
  const breakAnimTime = (pack.pack.break.frames / pack.pack.break.fps) * 1000;
  const [loop, setLoop] = useState(true);

  useEffect(() => {
    if (parentRef.current && pack) {
      // Get the element's computed styles
      const styles = window.getComputedStyle(parentRef.current);

      // Get the value of the CSS variable and convert it to a number
      const scaleFactor = parseFloat(styles.getPropertyValue('--scale-factor'));

      // Check if the value is a valid number before setting the state
      if (!isNaN(scaleFactor)) {
        setScale(scaleFactor * 2);
      }
    }
  }, [pack]);

  useEffect(() => {
    return () => {
      clearTimeout(breakTimeoutRef.current);
      clearTimeout(waitForBreak.current);
    }
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(waitForBreak.current);
    setCurrentAnimation('attack');
    setLoop(false);

    breakTimeoutRef.current = setTimeout(() => {
      setShowBreakAnimation(true);
      waitForBreak.current = setTimeout(() => {
        setShowBreakAnimation(false);
      }, breakAnimTime);
    }, ANIMATION_DELAY);
  };

  const handleMouseLeave = () => {
    clearTimeout(waitForBreak.current);
    setShowBreakAnimation(false);
    clearTimeout(breakTimeoutRef.current);
    setCurrentAnimation('idle');
    setLoop(true);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="flex flex-row w-3/4 h-full bg-gray-200"
      style={{ padding: 'calc(2 * var(--unit-xs))', gap: 'calc(2 * var(--unit-xs))', borderRadius: 'calc(8 * var(--unit-xs))' }}
    >
      {/* Animation Container - Left Side */}
      <div className='w-1/3 h-full relative' style={{}}>
        <SpriteDemo move={currentAnimation} height={"h-10/12"} pack={[pack]} loop={loop} backTo={() => {
          clearTimeout(breakTimeoutRef.current);
          setCurrentAnimation('idle');
          setLoop(true);
        }} />
      </div>

      {/* Card Container - Right Side */}
      <div ref={parentRef} className='w-2/3 h-full flex items-center justify-center'>
        <div className='relative w-full flex items-center justify-center'>
            <div
              className="bg-white z-50 transition-all duration-200 hover:border-indigo-400 flex flex-row items-center justify-between overflow-hidden relative"
              style={{
                height: `calc(${pack.pack.break.frameHeight} * var(--unit-xs) * 1.43)`,
                width: `calc(${pack.pack.break.frameWidth} * var(--unit-xs) * 1.43)`,
                padding: 'calc(1 * var(--unit))',
                borderRadius: 'calc(0.75 * var(--unit))',
                boxShadow: '0 calc(0.5 * var(--unit)) calc(2 * var(--unit)) calc(-0.5 * var(--unit)) rgba(0, 0, 0, 0.1)',
                border: `calc(0.125 * var(--unit)) solid rgb(199 210 254)`
              }}
              >
              {!showBreakAnimation ? (
                <>
              <div className="">
                <div className="font-semibold truncate" style={{ fontSize: 'var(--text-base)' }}>3 Sum</div>
                <div className="text-gray-500 truncate" style={{ fontSize: 'var(--text-xs)' }}>
                  #15 | Medium | 3Sum
                </div>
              </div>
              <div className="flex items-center flex-shrink-0" style={{
                gap: 'calc(0.5 * var(--unit))',
                marginTop: 'calc(0.5 * var(--unit))'
              }}>
                <button className="bg-green-100 text-green-800 whitespace-nowrap" style={{
                  fontSize: 'var(--text-xs)',
                  padding: 'calc(0.25 * var(--unit)) calc(0.5 * var(--unit))',
                  borderRadius: 'calc(0.25 * var(--unit))'
                }}>
                  Mark Revised
                </button>
                <a className="text-blue-600 hover:underline whitespace-nowrap" style={{ fontSize: 'var(--text-xs)' }}>
                  View
                </a>
                <button
                  className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                  style={{
                    padding: 'calc(0.375 * var(--unit))',
                    borderRadius: '50%'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg"
                    style={{
                      width: 'calc(1.125 * var(--unit))',
                      height: 'calc(1.125 * var(--unit))'
                    }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                  </svg>
                </button>
              </div>
                      </>
          ) : (
            // <div className='absolute inset-0 flex items-center justify-center'>
              <BreakDemo scale={"true"} pack={pack} />
            // </div>
          )}
            </div>

        </div>
      </div>
    </div>
  )
}

const CartButtons = ({ pack, addToCart, cart, removeFromCart, isLoading }) => {
  const isInCart = cart.some(item => item._id === pack._id);

  const handleAddToCart = () => {
    addToCart(pack._id);
  }
  const handleRemoveFromCart = () => {
    removeFromCart(pack._id);
  }

  if (isInCart) {
    return (
      <button
        onClick={handleRemoveFromCart}
        disabled={isLoading}
        className={`font-semibold transition duration-200 ease-in-out bg-transparent text-red-500 hover:bg-red-500 hover:text-white ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{
          padding: 'calc(3 * var(--unit-xs)) calc(6 * var(--unit-xs))',
          borderRadius: 'calc(2 * var(--unit-xs))',
          border: `calc(0.5 * var(--unit-xs)) solid rgb(239 68 68)`,
          fontSize: 'calc(1.5 * var(--text-xs))'
        }}
      >
        {isLoading ? 'Removing...' : 'Remove'}
      </button>
    )
  } else {
    return (
      <button
        onClick={handleAddToCart}
        disabled={isLoading}
        className={`font-semibold transition duration-200 ease-in-out focus:outline-none bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{
          padding: 'calc(3 * var(--unit-xs)) calc(6 * var(--unit-xs))',
          borderRadius: 'calc(2 * var(--unit-xs))',
          fontSize: 'calc(1.5 * var(--text-xs))'
        }}
      >
        {isLoading ? 'Adding...' : 'Add To Cart'}
      </button>
    )
  }
}

const PricePage = () => {
  const { theme } = useTheme();
  const { cart, addToCart, removeFromCart, isLoading } = useCart();
  const navigate = useNavigate();
  const [animationPacks, setAnimationPacks] = useState([]);
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    const fetchPacks = async () => {
      setPageLoading(true);
      const packs = await getAllAnimationPacks();
      setAnimationPacks(packs);
      setPageLoading(false);
    };
    fetchPacks();
  }, []);

  return (
    <>
      <div className={`h-full flex flex-col relative items-center transition-all duration-300 overflow-x-hidden
            ${theme === 'tos' ? 'tos' : 'bg-gray-50'}`}
        style={{ padding: 'calc(10 * var(--unit-xs)) calc(4 * var(--unit-xs))' }}>
        <div className="text-center">
          <h1 className={`font-extrabold ${theme === 'tos' ? 'tos-accent tos-theme-mono' : 'text-indigo-700'}`}
            style={{
              fontSize: 'calc(3*var(--text-xs))',
              marginBottom: 'calc(4 * var(--unit-xs))'
            }}>Animation Packs Store</h1>
          <p className={`${theme === 'tos' ? 'tos-light' : 'text-gray-600'}`}
            style={{
              fontSize: 'calc(2*var(--text-xs))',
              marginBottom: 'calc(12 * var(--unit-xs))'
            }}>
            Upgrade your experience! Purchase premium animation packs to unlock special break effects and support development.
          </p>
        </div>

        {pageLoading ? (
          <div style={{ fontSize: 'calc(3*var(--text-xs))' }}>Loading animations...</div>
        ) : (
          <div className="w-full ">
            {animationPacks.map(pack => (
              <div
                key={pack._id}
                className={`w-full flex h-3/4 flex-row items-start transition-shadow duration-300
                            ${theme === 'tos' ? 'bg-tos-bg tos-border hover:tos-shadow' : 'bg-white'}`}
                style={{
                  gap: 'calc(8 * var(--unit-xs))',
                  borderRadius: 'calc(4 * var(--unit-xs))',
                  boxShadow: 'calc(2 * var(--unit-xs)) 0 calc(40 * var(--unit-xs)) calc(-20 * var(--unit-xs)) rgba(0, 0, 0, 0.1)',
                  marginBottom: 'calc(8 * var(--unit-xs))',
                  padding: 'calc(6 * var(--unit-xs))',
                  border: `calc(0.5 * var(--unit-xs)) solid rgb(229 231 235)`
                }}
              >
                <div className="flex flex-col h-full items-start text-left flex-grow">
                  <h2 className={`font-bold ${theme === 'tos' ? 'tos-accent tos-theme-mono' : 'text-indigo-600'}`}
                    style={{
                      fontSize: 'calc(3 * var(--text-xs))',
                      marginBottom: 'calc(2 * var(--unit-xs))'
                    }}>{pack.title}</h2>
                  <p className={`font-extrabold ${theme === 'tos' ? 'tos-accent' : 'text-indigo-700'}`}
                    style={{
                      fontSize: 'calc(2 * var(--text-xs))',
                      marginBottom: 'calc(6 * var(--unit-xs))'
                    }}>Rs.{pack.price}</p>
                  <CartButtons pack={pack} addToCart={addToCart} removeFromCart={removeFromCart} isLoading={isLoading} cart={cart} />
                </div>
                <AnimationCard key={pack._id} pack={pack} />
              </div>
            ))}
          </div>
        )}

      </div>
      <div className='bg-black absolute cursor-pointer transition-all duration-300'
        style={{
          borderRadius: 'calc(4 * var(--unit-xs))',
          bottom: 'calc(2.6 * var(--unit-xs))',
          right: 'calc(3 * var(--unit-xs))',
          padding: 'calc(2 * var(--unit-xs))',
          border: `calc(0.8 * var(--unit-xs)) solid black`
        }}
        onClick={() => navigate('/checkout')}>
        {cart.length > 0 && <span className='text-white content-center absolute bg-red-500'
          style={{
            fontSize: 'var(--text-xs)',
            borderRadius: 'calc(5 * var(--unit-xs))',
            bottom: 'calc(11.5 * var(--unit-xs))',
            left: 'calc(11.5 * var(--unit-xs))',
            width: 'calc(5 * var(--unit-xs))',
            height: 'calc(5 * var(--unit-xs))'
          }}></span>}
        <svg xmlns="http://www.w3.org/2000/svg"
          style={{
            height: 'calc(11.2 * var(--unit-xs))',
            width: 'calc(11.2 * var(--unit-xs))'
          }}
          viewBox="0 -960 960 960" fill="#ffffff">
          <path d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM246-720l96 200h280l110-200H246Zm-38-80h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Zm134 280h280-280Z" />
        </svg>
      </div>
    </>
  );
};

export default PricePage;