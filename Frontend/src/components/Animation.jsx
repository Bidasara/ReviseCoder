import React, { useEffect, useState, useCallback } from 'react'; // Import useState and useCallback
import SpriteDemo from './AnimationPart/SpriteAnimation';
import { useSpriteAnimation } from '../contexts/SpriteAnimationContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../api';
import { getAccessToken } from '../authToken';

const Animation = () => {
  // Use useState to manage animationPacks as component state
  const [animationPacks, setAnimationPacks] = useState(null); // Initialize with null, or an empty array []
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error messages

  const { loop, setCurrCharacter } = useSpriteAnimation();
  const { theme } = useTheme();

  // Use useCallback to memoize the data fetching function
  const fetchAnimationData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const storedUserAnimations = localStorage.getItem('userAnimations');
      const storedPacks = localStorage.getItem('animationPacks');

      // If both are found in localStorage, use them and exit the function early.
      if (storedUserAnimations && storedPacks) {
        const parsedUserAnimations = JSON.parse(storedUserAnimations);
        const parsedPacks = JSON.parse(storedPacks);

        setAnimationPacks([...parsedUserAnimations, ...parsedPacks]);
        if (parsedPacks && parsedPacks.length > 0) {
          setCurrCharacter(parsedPacks[0].title);
        }
        const allAnimations = [...parsedUserAnimations, ...parsedPacks];
        localStorage.setItem('allAnimations', JSON.stringify(allAnimations));
        setLoading(false);
        return; // Exit the function here
      }

      // If localStorage is empty, proceed to fetch data from the API
      const response1 = await api.get('/animation/anim', {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      const userAnimations = response1.data.data;
      if (userAnimations != [] && userAnimations != undefined)
        localStorage.setItem('userAnimations', JSON.stringify(userAnimations));

      const response2 = await api.get('/animation/allAnim', {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      const generalAnimations = response2.data.data;
      localStorage.setItem('animationPacks', JSON.stringify(generalAnimations));

      // Set the character title after fetching
      if (generalAnimations && generalAnimations.length > 0) {
        setCurrCharacter(generalAnimations[0].title);
      }
      if (userAnimations != [] && userAnimations != undefined) {
        localStorage.setItem('allAnimations', JSON.stringify([...userAnimations, ...generalAnimations]));
        setAnimationPacks([...userAnimations, ...generalAnimations]);
      }
      else {
        localStorage.setItem('allAnimations', JSON.stringify(generalAnimations));
        setAnimationPacks(generalAnimations);
      }

    } catch (err) {
      console.error("Error fetching animation packs:", err);
      setError("Failed to load animations. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [setCurrCharacter]); // Dependency: setCurrCharacter from context

  // useEffect to call the data fetching function on component mount
  useEffect(() => {
    fetchAnimationData();
  }, [fetchAnimationData]);

  // A self-contained component for a "cool and quirky" glitching text animation.
  const GlitchyLoader = () => {
    return (
      <>
        <style>
          {`
          .glitch-loader {
            position: relative;
            font-size: 22px;
            font-family: monospace;
            letter-spacing: 0.15em;
            font-weight: 700;
            /* The main text color is inherited from the parent */
          }

          /* The ::before and ::after pseudo-elements are our glitch layers */
          .glitch-loader::before,
          .glitch-loader::after {
            content: attr(data-text); /* Copy the text from the data-text attribute */
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: transparent;
          }

          /* First glitch layer: cyan, shifts left */
          .glitch-loader::before {
            left: 3px;
            text-shadow: -2px 0 #00ffff; /* Neon Cyan */
            animation: glitch-top 2s infinite linear alternate-reverse;
          }

          /* Second glitch layer: magenta, shifts right */
          .glitch-loader::after {
            left: -3px;
            text-shadow: -2px 0 #ff00ff; /* Neon Magenta */
            animation: glitch-bottom 1.5s infinite linear alternate-reverse;
          }

          /* Keyframes for the top glitch layer */
          @keyframes glitch-top {
            0%, 10%, 25%, 40%, 55%, 70%, 85%, 100% {
              clip-path: inset(0 0 0 0);
            }
            5% { clip-path: inset(10px 0 85% 0); }
            15% { clip-path: inset(90% 0 5px 0); }
            30% { clip-path: inset(40% 0 40% 0); }
            45% { clip-path: inset(20% 0 70% 0); }
            60% { clip-path: inset(80% 0 10% 0); }
            75% { clip-path: inset(50% 0 30% 0); }
            90% { clip-path: inset(15% 0 80% 0); }
          }
          
          /* Keyframes for the bottom glitch layer */
          @keyframes glitch-bottom {
            0%, 12%, 27%, 42%, 57%, 72%, 87%, 100% {
              clip-path: inset(0 0 0 0);
            }
            7% { clip-path: inset(80% 0 10px 0); }
            19% { clip-path: inset(20px 0 70% 0); }
            33% { clip-path: inset(45% 0 45% 0); }
            51% { clip-path: inset(90% 0 5px 0); }
            68% { clip-path: inset(30% 0 60% 0); }
            81% { clip-path: inset(75% 0 15% 0); }
            95% { clip-path: inset(10px 0 85% 0); }
          }
        `}
        </style>
        <div
          className="glitch-loader"
          data-text="LOADING..." /* The text is also placed here for the pseudo-elements */
        >
          LOADING...
        </div>
      </>
    );
  };
  // --- Render based on loading/error states ---
  if (loading) {
    return (
      <div className={`w-1/4 h-full rounded-xl shadow-lg flex items-center justify-center
    ${theme === 'tos' ? 'tos tos-border text-gray-800' :
          theme === 'cyberpunk' ? 'cyberpunk-bg neon-text border-2 border-cyan-400' :
            'bg-gray-300 dark:bg-gray-800 text-gray-900'
        }`} style={{ margin: 'calc(0.5 * var(--unit))', padding: 'calc(1 * var(--unit))' }}>
        <GlitchyLoader />
      </div>
    );
  }


  // If found an error during fetching animations
  if (error) {
    return (
      <div className={`w-1/4 h-full rounded-xl shadow-lg flex items-center justify-center text-red-500
      ${theme === 'tos' ? 'tos tos-border' : theme === 'cyberpunk' ? 'cyberpunk-bg neon-text border-2 border-cyan-400' : 'bg-gray-300 dark:bg-gray-800'}`} style={{ margin: 'calc(0.5 * var(--unit))', padding: 'calc(1 * var(--unit))' }}>
        <p style={{ fontSize: 'var(--text-base)' }}>{error}</p>
      </div>
    );
  }


  // If no animation packs are found after loading
  if (!animationPacks || animationPacks.length === 0) {
    return (
      <div className={`w-1/4 h-full rounded-xl shadow-lg flex items-center justify-center
      ${theme === 'tos' ? 'tos tos-border' : theme === 'cyberpunk' ? 'cyberpunk-bg neon-text border-2 border-cyan-400' : 'bg-gray-300 dark:bg-gray-800'}`} style={{ margin: 'calc(0.5 * var(--unit))', padding: 'calc(1 * var(--unit))' }}>
        <p style={{ fontSize: 'var(--text-base)' }}>No animations available.</p>
      </div>
    );
  }


  // Render SpriteDemo only when animationPacks is loaded and not empty
  return (
    <div className={`h-full w-1/4 rounded-xl transition-all duration-300
    ${theme === 'tos' ? 'tos tos-border' : theme === 'cyberpunk' ? 'cyberpunk-bg neon-text border-2 border-cyan-400' : 'bg-gray-300 dark:bg-gray-800'} ${loop ? 'z-1' : 'z-50'}`}>
      <SpriteDemo loop={loop} pack={animationPacks} />
    </div>
  );

};

export default React.memo(Animation);