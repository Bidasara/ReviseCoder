import { useState, useEffect, useCallback } from 'react';
import { useProblemContext } from '../../contexts/ProblemContext';
import { useTheme } from '../../contexts/ThemeContext';
import Checkbox from '../common/Checkbox';
import { useNoteModal } from '../../contexts/NoteModalContext';
import { useScroll } from '../../contexts/ScrollContext';
import api from '../../api';

const Problem = ({ item: problem, elevate: elevatedProblem }) => {
    const { deleteProblem, currentList } = useProblemContext();
    const { openCategory } = useScroll();
    const { setNoteModalContent, setNoteModalOpen } = useNoteModal();
    const { theme } = useTheme();
    const [checked, setChecked] = useState(problem.status !== 'unsolved');
    const [revised, setRevised] = useState(problem.revised === true);

    useEffect(() => {
        setChecked(problem.status !== 'unsolved');
    }, [problem.status, problem.notes]);

    //Functions
    const handleChange = async (e, listId, categoryId, problemId, initialText) => {
        if (checked) return;
        try {
            console.log(problemId)
            const response = await api.get(`/data/hint?probId=${problemId}`);
            setNoteModalContent({ problemId, initialText, listId, categoryId, hints: response.data.data });
            setNoteModalOpen(true);
        } catch (error) {
            console.error("Error fetching hint:", error);
        }
    };

    const handleDelete = useCallback((listId, categoryId, problemId, event) => {
        // Prevent the click from bubbling up to the category toggle
        event.stopPropagation();

        if (window.confirm('Are you sure you want to delete this problem? This action cannot be undone.')) {
            deleteProblem(listId, categoryId, problemId)
                .then(() => {
                    console.log(`Problem ${problemId}, in category ${categoryId}, in list ${listId} deleted successfully`);
                })
                .catch(err => {
                    console.error(`Error deleting problem ${problemId}:`, err);
                    // You could add a toast notification here
                    alert(`Failed to delete problem: ${err.message || 'Unknown error'}`);
                });
        }
    }, [deleteProblem]);

    //Maps
    const getDifficultyStyles = (difficulty) => {
        const base = "text-xs font-medium px-2.5 py-0.5 rounded-md";
        if (theme === 'cyberpunk') {
            switch (difficulty.toLowerCase()) {
                case 'easy':
                    return `${base} bg-black border border-green-400 text-green-400 neon-text`;
                case 'medium':
                    return `${base} bg-black border border-yellow-400 text-yellow-300 neon-text`;
                case 'hard':
                    return `${base} bg-black border border-pink-500 text-pink-400 neon-text`;
                default:
                    return `${base} bg-black border border-cyan-400 text-cyan-300 neon-text`;
            }
        }
        switch (difficulty.toLowerCase()) {
            case 'easy':
                return `${base} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`;
            case 'medium':
                return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`;
            case 'hard':
                return `${base} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`;
            default:
                return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
        }
    };

    return (
        <div
            className={`group transition-all duration-300 h-full mx-auto
        ${problem._id != elevatedProblem
                    ? (theme === 'cyberpunk' ? 'pointer-events-none opacity-40 blur-[0.5px] bg-black bg-opacity-60 neon-text' : 'pointer-events-none opacity-40 blur-[0.5px] bg-gray-100 dark:bg-gray-800/50')
                    : 'opacity-100 blur-0'}
        ${checked ? (theme === 'cyberpunk' ? 'bg-black bg-opacity-90 border-pink-500 neon-text' : 'bg-green-50 dark:bg-green-900/20') : (theme === 'cyberpunk' ? 'bg-black bg-opacity-80 border-cyan-400 neon-text' : 'bg-white dark:bg-gray-800')}
        ${problem._id === elevatedProblem
                    ? `w-11/12 scale-105 shadow-xl z-10 ring-2 ${theme === 'cyberpunk' ? 'ring-pink-500' : 'ring-indigo-200 dark:ring-indigo-700'}`
                    : 'w-10/12 scale-100'}
        border flex justify-between items-center transition-all duration-200
        hover:border-indigo-200 dark:border-gray-700 dark:hover:border-indigo-700
        ${theme === 'cyberpunk' ? 'cyberpunk-bg neon-text border-2' : ''}`}
            style={{
                marginBottom: 'calc(0.5 * var(--unit))',
                padding: 'calc(1 * var(--unit))',
                borderRadius: `var(--unit)`,
            }}
        >
            <div className='flex items-center flex-1 min-w-0' style={{ gap: 'calc(0.75 * var(--unit))' }}>
                <Checkbox
                    id={`problem-${problem._id}`}
                    checked={checked}
                    onChange={(e) => handleChange(e, currentList._id, openCategory, problem.problemId._id, problem.notes)}
                />
                <div className="min-w-0 flex-1">
                    <div className={`font-medium truncate ${checked
                        ? (theme === 'cyberpunk' ? 'text-pink-400 neon-text' : 'text-gray-500 line-through dark:text-gray-400')
                        : (theme === 'cyberpunk' ? 'text-cyan-400 neon-text' : 'text-gray-800 dark:text-gray-200')}`} style={{ fontSize: 'var(--text-sm)' }}>
                        {problem.problemId.num}. {problem.problemId.title}
                    </div>
                    <div className="flex items-center" style={{ marginTop: 'calc(0.25 * var(--unit))', gap: 'calc(0.5 * var(--unit))' }}>
                        <span className={`${theme === 'cyberpunk' ? (() => {
                            switch (problem.problemId.difficulty.toLowerCase()) {
                                case 'easy': return 'bg-black border border-green-400 text-green-400 neon-text';
                                case 'medium': return 'bg-black border border-yellow-400 text-yellow-300 neon-text';
                                case 'hard': return 'bg-black border border-pink-500 text-pink-400 neon-text';
                                default: return 'bg-black border border-cyan-400 text-cyan-300 neon-text';
                            }
                        })() : (() => {
                            switch (problem.problemId.difficulty.toLowerCase()) {
                                case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
                                case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
                                case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
                                default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
                            }
                        })()}`} style={{
                            fontSize: 'var(--text-xs)',
                            padding: 'calc(0.125 * var(--unit)) calc(0.625 * var(--unit))',
                            borderRadius: `min(calc(0.25 * var(--unit)), 6px)`
                        }}
                        >
                            {problem.problemId.difficulty}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center" style={{ gap: 'calc(0.5 * var(--unit))' }}>
                <div
                    className={`rounded transition-colors border ${problem.status === 'revising' ? (theme === 'cyberpunk' ? 'bg-pink-700 text-pink-200 border-pink-400 neon-text' : 'bg-blue-200 text-blue-800 border-blue-400 dark:bg-blue-900/40 dark:text-blue-200') : (theme === 'cyberpunk' ? 'bg-black text-cyan-400 border-cyan-400 neon-text' : 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700/40 dark:text-gray-300')}`}
                    style={{ fontSize: 'var(--text-xs)', padding: 'calc(0.25 * var(--unit)) calc(0.5 * var(--unit))' }}
                >
                    {problem.status}
                </div>
                <span onClick={(event) => handleDelete(currentList._id, openCategory, problem._id, event)} className="material-symbols-outlined delete-icon" style={{ fontSize: 'calc(1.5*var(--text-base))' }}>
                    delete
                </span>
            </div>
        </div>
    );

};

export default Problem;