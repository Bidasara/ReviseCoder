import React, { useRef, useEffect, useState, useMemo } from 'react';
import ReactDOM from 'react-dom';

// Custom Hooks
import { useTheme } from '../../contexts/ThemeContext';
import { useProblemContext } from '../../contexts/ProblemContext';
import { useNoteModal } from '../../contexts/NoteModalContext';
import { useReviseData } from '../../hooks/useReviseData';
import { useNotification } from '../../contexts/NotificationContext';

//==============================================================================
// Note Modal Component
//==============================================================================
const NoteModal = () => {
  //----------------------------------------------------------------------------
  // HOOKS
  //----------------------------------------------------------------------------
  const textareaRef = useRef(null); // Ref for the textarea
  const { theme } = useTheme();
  const { updateProblemStatus } = useProblemContext();
  const { noteModalContent, noteModalOpen, setNoteModalOpen, updateNotes } = useNoteModal();
  const [ hints, setHints ] = useState([]);
  const [noteText, setNoteText] = useState('');
  const { refetch } = useReviseData("lists");

  //----------------------------------------------------------------------------
  // EFFECTS
  //----------------------------------------------------------------------------

  // Effect to initialize the text and hints when the modal opens
  useEffect(() => {
    if (noteModalOpen) {
      // Set the initial text from the context data
      const initialText = noteModalContent?.initialText || '- ';
      setNoteText(initialText);

      // Safely parse hints from a comma-separated string
      const hintData = noteModalContent?.hints || '';
      setHints(hintData ? hintData.split(',') : []);

      // Focus and position cursor at the end
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(
            textareaRef.current.value.length,
            textareaRef.current.value.length
          );
        }
      }, 100);
    }
  }, [noteModalOpen, noteModalContent]);

  //----------------------------------------------------------------------------
  // EVENT HANDLERS & LOGIC
  //----------------------------------------------------------------------------
  const { listId, categoryId, problemId, update, probNum } = useMemo(
    () => noteModalContent || {},
    [noteModalContent]
  );

  // Closes the modal if the user clicks on the backdrop overlay
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setNoteModalOpen(false);
    }
  };

  // Handles Enter key for automatic bullet points
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      const textarea = textareaRef.current;
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = noteText.substring(0, cursorPosition);
      const textAfterCursor = noteText.substring(cursorPosition);

      // Add new line with bullet point
      const newText = textBeforeCursor + '\n- ' + textAfterCursor;
      setNoteText(newText);

      // Position cursor after the new bullet point
      setTimeout(() => {
        const newCursorPosition = cursorPosition + 3; // +3 for '\n- '
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    }
  };

  // Handle text change
  const handleTextChange = (e) => {
    setNoteText(e.target.value);
  };

  // Appends a hint to the notes area
  const handleAddHint = (e, hint) => {
    e.preventDefault();

    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = noteText.substring(0, cursorPosition);
      const textAfterCursor = noteText.substring(cursorPosition);

      // Insert hint at cursor position with new bullet point
      const newText = textBeforeCursor + hint.trim() + '\n- ' + textAfterCursor;
      setNoteText(newText);

      // Position cursor after the new bullet point
      setTimeout(() => {
        const newCursorPosition = cursorPosition + hint.trim().length + 3;
        textarea.focus();
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    }
  };
  const {showNotification} = useNotification();

  // Handler for submitting notes for an existing problem
  const handleUpdateNote = async () => {
    if (refetch) {
      try {
        await updateNotes(problemId, noteText);
        refetch();
        showNotification("Updated","success")
      } catch (error) {
        showNotification(error.response.data.message || "Failed to update note", "error");
        console.error("Failed to update note:", error);
      }
    }
  };

  // Submit handler for different priority levels
  const handleSubmit = (level) => {
    console.log(categoryId);
    updateProblemStatus(listId, categoryId, problemId, noteText, level,probNum);
    setNoteModalOpen(false);
  };

  //----------------------------------------------------------------------------
  // THEME STYLES
  //----------------------------------------------------------------------------

  const themeStyles = {
    cyberpunk: {
      backdrop: 'bg-gradient-to-br from-purple-900/90 via-black/95 to-pink-900/90',
      modal: 'bg-gradient-to-br from-gray-900 via-black to-gray-900 border-pink-500 shadow-2xl shadow-pink-500/50',
      title: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.7)]',
      textarea: 'bg-gray-900/80 text-green-400 border-cyan-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 shadow-inner shadow-cyan-500/20 placeholder-green-400/50',
      hint: 'bg-gradient-to-r from-pink-500/20 to-cyan-500/20 border border-pink-400/50 text-pink-300 hover:from-pink-500/40 hover:to-cyan-500/40 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-400/30',
      primaryButton: 'bg-gradient-to-r from-cyan-500 to-pink-500 text-black font-bold border-2 border-transparent hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/50 transform hover:scale-105',
      secondaryButton: 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-2 border-pink-400/50 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-400/50 transform hover:scale-105',
      accent: 'text-pink-300 animate-pulse drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]'
    },
    default: {
      backdrop: 'bg-gradient-to-br from-slate-500/30 via-gray-600/40 to-slate-700/50',
      modal: 'bg-white border-gray-300 shadow-2xl shadow-gray-500/30',
      title: 'text-gray-800 drop-shadow-sm',
      textarea: 'bg-gray-50 text-gray-800 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-inner placeholder-gray-400',
      hint: 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-800 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 hover:shadow-md transform hover:scale-105',
      primaryButton: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105',
      secondaryButton: 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-lg hover:shadow-xl transform hover:scale-105',
      accent: 'text-gray-500'
    }
  };

  const currentTheme = themeStyles[theme] || themeStyles.default;

  //----------------------------------------------------------------------------
  // RENDER LOGIC
  //----------------------------------------------------------------------------

  if (!noteModalOpen) return null; // Render nothing if the modal is not open

return ReactDOM.createPortal(
  <div 
    className={`absolute w-full h-full z-50 flex items-center justify-center backdrop-blur-md transition-all duration-500 ease-out ${currentTheme.backdrop}`} 
    onClick={handleBackdropClick}
  >
    <div className={`relative w-full mx-auto rounded-2xl border-2 flex flex-col transition-all duration-500 ease-out transform ${currentTheme.modal}`} style={{ maxWidth: 'calc(40 * var(--unit))', maxHeight: '90vh', padding: 'calc(2 * var(--unit))' }}>
      
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 'calc(1.5 * var(--unit))' }}>
        <h2 className={`font-bold ${currentTheme.title}`} style={{ fontSize: 'calc(2 * var(--text-base))' }}>
          📝 Notes
        </h2>
        <button 
          onClick={() => setNoteModalOpen(false)}
          className="text-gray-400 hover:text-red-500 transition-colors duration-200 hover:rotate-90 transform"
          style={{ fontSize: 'calc(1.5 * var(--text-base))' }}
        >
          ✕
        </button>
      </div>

      {/* Hints Section */}
      {hints.length > 0 && (
        <div style={{ marginBottom: 'calc(1.5 * var(--unit))' }}>
          <h3 className={`font-semibold opacity-80 ${theme === 'cyberpunk' ? 'text-cyan-300' : 'text-gray-600'}`} style={{ fontSize: 'var(--text-sm)', marginBottom: 'calc(0.75 * var(--unit))' }}>
            💡 Quick Hints (Click to add):
          </h3>
          <div className="flex flex-wrap bg-black/10 rounded-lg overflow-y-auto" style={{ gap: 'calc(0.5 * var(--unit))', maxHeight: 'calc(8 * var(--unit))', padding: 'calc(0.5 * var(--unit))' }}>
            {hints.map((hint, index) => (
              <button
                key={index}
                onClick={(e) => handleAddHint(e, hint)}
                className={`rounded-full font-medium transition-all duration-200 cursor-pointer ${currentTheme.hint}`}
                style={{ padding: 'calc(0.25 * var(--unit)) calc(0.75 * var(--unit))', fontSize: 'var(--text-xs)' }}
              >
                {hint.trim()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Textarea Section */}
      <div className="flex-1" style={{ marginBottom: 'calc(1.5 * var(--unit))' }}>
        <textarea
          ref={textareaRef}
          value={noteText}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          className={`w-full rounded-xl font-mono border-2 overflow-y-auto resize-none transition-all duration-300 ${currentTheme.textarea}`}
          style={{ 
            height: 'calc(16 * var(--unit))',
            padding: 'calc(1 * var(--unit))',
            fontSize: 'var(--text-base)',
            minHeight: 'calc(12 * var(--unit))',
            lineHeight: '1.6'
          }}
          placeholder="Start typing your notes here..."
        />
        <div className={`opacity-60 ${theme === 'cyberpunk' ? 'text-cyan-300' : 'text-gray-500'}`} style={{ fontSize: 'var(--text-xs)', marginTop: 'calc(0.5 * var(--unit))' }}>
          ⌨️ <strong>Tip:</strong> Press Enter to create a new bullet point automatically
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-row justify-end" style={{ gap: 'calc(0.75 * var(--unit))' }}>
        {update ? (
          <button 
            className={`rounded-xl font-semibold transition-all duration-300 ${currentTheme.primaryButton}`}
            style={{ padding: 'calc(0.75 * var(--unit)) calc(1.5 * var(--unit))', fontSize: 'var(--text-base)' }}
            onClick={handleUpdateNote}
          >
            💾 Update Note
          </button>
        ) : (
          <>
            <span className={`self-center font-medium mb-2 sm:mb-0 ${theme === 'cyberpunk' ? 'text-cyan-300' : 'text-gray-600'}`} style={{ fontSize: 'var(--text-base)' }}>
              📌 Mark as:
            </span>
            <div className="flex flex-row" style={{ gap: 'calc(0.5 * var(--unit))' }}>
              <button 
                className={`rounded-lg font-semibold transition-all duration-300 ${currentTheme.primaryButton}`}
                style={{ padding: 'calc(0.5 * var(--unit)) calc(1 * var(--unit))', fontSize: 'var(--text-sm)' }}
                onClick={() => handleSubmit(0)}
              >
                🔥 High Priority
              </button>
              <button 
                className={`rounded-lg font-semibold transition-all duration-300 ${currentTheme.primaryButton}`}
                style={{ padding: 'calc(0.5 * var(--unit)) calc(1 * var(--unit))', fontSize: 'var(--text-sm)' }}
                onClick={() => handleSubmit(1)}
              >
                ⚡ Priority  
              </button>
              <button 
                className={`rounded-lg font-semibold transition-all duration-300 ${currentTheme.secondaryButton}`}
                style={{ padding: 'calc(0.5 * var(--unit)) calc(1 * var(--unit))', fontSize: 'var(--text-sm)' }}
                onClick={() => handleSubmit(2)}
              >
                📝 No Priority
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Cyberpunk Theme Accent */}
      {theme === 'cyberpunk' && (
        <div className={`absolute top-4 right-4 font-bold tracking-widest ${currentTheme.accent}`} style={{ fontSize: 'var(--text-xs)' }}>
          ⚡ NEURAL LINK ⚡
        </div>
      )}
    </div>
  </div>,
  document.getElementById('modal-root')
);

};

export default React.memo(NoteModal);
