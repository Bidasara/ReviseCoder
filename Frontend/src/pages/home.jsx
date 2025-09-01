import { use, useEffect } from 'react';

// Contexts & Hooks
import { useTheme } from '../contexts/ThemeContext';
import { useProblemContext } from '../contexts/ProblemContext';
import { useNotification } from '../contexts/NotificationContext.jsx';
import { useModal } from '../contexts/ModalContext.jsx';
import { useNoteModal } from '../contexts/NoteModalContext.jsx';

// Components
import Animation from '../components/Animation';
import Dolist from '../components/Dolist';
import Options from '../components/Options';
import NoteModal from '../components/common/Notes.jsx';
import Modal from '../components/common/Modal.jsx';

import { useSpriteAnimation } from '../contexts/SpriteAnimationContext.jsx';

//==============================================================================
// Main Home Component (Wrapper)
//==============================================================================

/**
 * A simple wrapper component that renders the main content.
 * This structure is useful for separating concerns, especially if a Context Provider
 * were needed at this level.
 */
function Home() {
  return <HomeContent />;
}

//==============================================================================
// Home Content Component
//==============================================================================

function HomeContent() {
  //----------------------------------------------------------------------------
  // HOOKS
  //----------------------------------------------------------------------------

  // Destructure all necessary values from custom hooks
  const { theme, toggleTheme } = useTheme();

  // The useNotification hook is called but `showNotification` is not used in this component.
  // It's kept here in case it's needed for future development.
  const { showNotification } = useNotification();

  //----------------------------------------------------------------------------
  // RENDER LOGIC
  //----------------------------------------------------------------------------

  // Define dynamic CSS classes for cleaner JSX
  const containerClasses = `
    h-9/10 w-full flex flex-col flex-1 
    transition-colors duration-300 
    min-h-0 overflow-x-hidden relative
    ${theme === 'light' ? 'bg-gray-100' :
      theme === 'dark' ? 'bg-gray-900' :
        theme === 'tos' ? 'bg-blue-950' :
          'bg-black cyberpunk-bg'
    }
  `;

  // bottom-4 
  const themeToggleClasses = `
    absolute z-100 
    rounded-full cursor-pointer transition-all
    ${theme === 'light' ? 'bg-white text-gray-900' :
      theme === 'dark' ? 'bg-gray-800 dark:text-amber-400' :
        'bg-black text-pink-400 border-2 border-cyan-400 neon-text'
    }
  `;

  //----------------------------------------------------------------------------
  // RENDER
  //----------------------------------------------------------------------------

  return (
    <div className={containerClasses}>
      <div className='flex flex-1 w-full min-h-0'
        style={{ padding: 'var(--unit)', gap: 'var(--unit)' }}
      >
        <Animation />
        <Dolist />
        <Options />

        <NoteModal />
        <Modal />
      </div>

      {/* Theme Toggle Button */}
      {/* <button
        className={themeToggleClasses}
        onClick={toggleTheme}
        style={{
          bottom: 'var(--unit-sm)',
          right: 'var(--unit-sm)',
          width: 'calc(2*var(--unit-xl))',
          height: 'calc(2*var(--unit-xl))',
          fontSize: 'calc(1.8*var(--text-base))',
          boxShadow: `0 calc(0.25 * var(--unit)) calc(0.5 * var(--unit)) rgba(0, 0, 0, 0.3)`,
          filter: 'hover:drop-shadow(0 calc(0.5 * var(--unit)) calc(1 * var(--unit)) rgba(0, 0, 0, 0.4))'
        }}
      >
        {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '✦'}
      </button> */}
    </div>
  );
}

export default Home;