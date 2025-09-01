import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext';

const LOGO_URL = "https://res.cloudinary.com/harshitbd/image/upload/v1755760194/ReviseCoder-modified_x58b5u.png";

const getNavClasses = (theme) => {
  const base = 'w-full shrink-0 h-1/10 flex justify-between relative shadow-md transition-all duration-300';
  const themeStyles = {
    tos: 'tos border-b-2 tos-border',
    cyberpunk: 'bg-black cyberpunk-bg neon-text border-b-2 border-pink-500',
    default: 'bg-gray-300 dark:bg-gray-900'
  };
  return `${base} ${themeStyles[theme] || themeStyles.default}`;
};

const LoginButton = ({ theme, onLogin }) => {
  const base = 'rounded-lg font-semibold transition-all cursor-pointer shadow-sm';
  const themeStyles = {
    tos: 'tos-border tos-accent tos-theme-mono',
    cyberpunk: 'bg-pink-500 dark:bg-pink-400 dark:text-white',
    default: 'bg-indigo-600 text-white hover:bg-indigo-700'
  };
  const finalClasses = `${base} ${themeStyles[theme] || themeStyles.default}`;

  return (
    <button 
      className={finalClasses} 
      onClick={onLogin}
      style={{
        marginLeft: 'calc(1 * var(--unit))',
        padding: 'calc(0.5 * var(--unit)) calc(1.25 * var(--unit))',
        fontSize: 'var(--text-base)'
      }}
    >
      Sign In / Log In
    </button>
  );
};

const NavLinks = ({ theme, onNavigate }) => {
  const { username } = useAuth();
  const buttonClass = theme === 'tos' ? 'tos-accent cursor-pointer' : 'cursor-pointer focus:outline-none';
  
  return (
    <>
      <button onClick={() => onNavigate("/home")} className={buttonClass} style={{ fontSize: 'calc(1.5*var(--text-sm))' }}>Problems</button>
      <button onClick={() => onNavigate("/milestones")} className={buttonClass} style={{ fontSize: 'calc(1.5*var(--text-sm))' }}>Milestones</button>
      <button onClick={() => onNavigate("/shop")} className={buttonClass} style={{ fontSize: 'calc(1.5*var(--text-sm))' }}>Shop</button>
      <button onClick={() => onNavigate('/library')} className='rounded-lg' style={{ fontSize: 'calc(1.5*var(--text-sm))' }}>Library</button>
      <button onClick={() => onNavigate(`/user/${username}`)} className="cursor-pointer" style={{ fontSize: 'calc(1.5*var(--text-sm))' }}>Dashboard</button>
    </>
  );
};

const UserDropdown = ({ user, theme, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const themeClasses = {
    button: theme === 'tos' ? 'tos-border tos-theme-mono' : 'focus:ring-2 focus:ring-indigo-400 dark:focus:ring-pink-500 hover:bg-gray-100 dark:hover:bg-gray-700',
    avatarBorder: theme === 'tos' ? 'tos-border' : 'border-indigo-400 dark:border-pink-400',
    dropdownMenu: theme === 'tos' ? 'tos tos-border' : 'bg-white text-black dark:bg-gray-800 dark:text-white border-indigo-200 dark:border-pink-400',
    username: theme === 'tos' ? 'tos-accent' : '',
    logoutButton: theme === 'tos' ? 'tos-border tos-accent' : 'bg-red-500 hover:bg-red-600 text-white',
  };

  return (
    <div className="relative" ref={dropdownRef} style={{ marginLeft: 'calc(0.5 * var(--unit))' }}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`flex items-center cursor-pointer focus:outline-none rounded-lg transition-all ${themeClasses.button}`}
        style={{
          gap: 'calc(0.5 * var(--unit))',
          padding: 'calc(0.25 * var(--unit)) calc(0.5 * var(--unit))'
        }}
      >
        <img 
          src={user.avatarLink} 
          alt="Avatar" 
          className={`rounded-full border-2 shadow ${themeClasses.avatarBorder}`}
          style={{
            height: 'calc(3.85 * var(--unit))',
            width: 'calc(3.85 * var(--unit))'
          }}
        />
        <span className={`${theme === 'tos' ? 'tos-accent' : 'text-gray-600 dark:text-gray-300'}`} style={{ fontSize: 'var(--text-xs)' }}>▼</span>
      </button>

      {isOpen && (
        <div 
          className={`absolute right-0 rounded-2xl shadow-xl z-50 flex flex-col items-center animate-fadeIn border ${themeClasses.dropdownMenu}`}
          style={{
            marginTop: 'calc(0.5 * var(--unit))',
            width: 'calc(14 * var(--unit))',
            padding: 'calc(1 * var(--unit))'
          }}
        >
          <img 
            src={user.avatarLink} 
            alt="Avatar" 
            className={`rounded-full border-2 ${themeClasses.avatarBorder}`}
            style={{
              width: 'calc(5 * var(--unit))',
              height: 'calc(5 * var(--unit))',
              marginBottom: 'calc(0.5 * var(--unit))'
            }}
          />
          <div 
            className={`font-semibold text-center ${themeClasses.username}`}
            style={{
              fontSize: 'var(--text-lg)',
              marginBottom: 'calc(1 * var(--unit))'
            }}
          >
            {user.username}
          </div>
          <button 
            onClick={onLogout} 
            className={`w-full cursor-pointer rounded-lg font-medium transition shadow ${themeClasses.logoutButton}`}
            style={{
              padding: 'calc(0.5 * var(--unit))',
              fontSize: 'var(--text-base)'
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const { accessToken, username, avatarLink, loading, logout } = useAuth();
  const { theme } = useTheme();

  const user = { username, avatarLink };
  
  return (
    <nav 
      className={getNavClasses(theme)}
      style={{ padding: '0 calc(1.5 * var(--unit))' }}
    >
      <div className="content-center">
        <img
          title='ReviseCoder'
          src={LOGO_URL}
          alt="Logo"
          className={`object-cover cursor-pointer ${theme === 'tos' ? 'tos-accent tos-theme-mono' : ''}`}
          onClick={() => navigate("/")}
          style={{ 
            imageRendering: 'pixelated', 
            height: '80%'
          }}
        />
      </div>

      <div 
        className={`flex items-center relative ${theme === 'tos' ? 'tos-theme-mono' : ''}`}
        style={{ gap: 'calc(1.5 * var(--unit))' }}
      >
        {loading ? (
          <></>
        ) : accessToken ? (
          <>
            <NavLinks theme={theme} onNavigate={navigate} />
            <UserDropdown user={user} theme={theme} onLogout={logout} />
          </>
        ) : (
          <LoginButton theme={theme} onLogin={() => navigate('/login')} />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
