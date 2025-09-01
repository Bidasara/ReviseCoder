import { useState, useRef, useEffect } from 'react';

// --- Imports ---
// Hooks
import { useProblemContext } from '../contexts/ProblemContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useModal } from '../contexts/ModalContext.jsx';

// Components
import Scrollbar from './ProblemsListPart/Scrollbar.jsx';
import Dropdown from './ProblemsListPart/Dropdown.jsx';
import ReviseList from './ReviseList.jsx';

const Dolist = () => {
    // --- Contexts ---
    const { currentList, data } = useProblemContext();
    const { setModalTitle, setFunc, setInputLabel, setInputId, setInputPlaceHolder, setInputType, setModalExtra, setModalOpen } = useModal();
    const { theme } = useTheme();

    // --- State ---
    const [viewMode, setViewMode] = useState('lists'); // 'lists' or 'toRevise'

    // --- Refs ---
    const parentRef = useRef(null);

    // --- Callbacks (Memoized) ---
    const handleAdd = () => {
        setModalTitle("Add Category");
        setFunc("category");
        setInputLabel("Category Title");
        setInputId("Category");
        setInputPlaceHolder("name of your category")
        setInputType("text")
        setModalExtra(currentList._id);
        setModalOpen(true);
    }

    const [workingCatAdd, setWorkingCatAdd] = useState(true);
    useEffect(() => {
        try {
            const userData = localStorage.getItem("userData");
            if (!userData) {
                setWorkingCatAdd(false);
                return;
            }

            const parsedData = JSON.parse(userData);
            console.log(parsedData.lists)
            if (parsedData.lists.length == 0)
                setWorkingCatAdd(false);
            else
                setWorkingCatAdd(true);
        } catch (error) {
            console.error(error);
            setWorkingCatAdd(false)
        }
    }, [data])

    // --- Render ---
    return (
        <div className={`w-2/4 h-full rounded-xl shadow-lg transition-all duration-300 min-w-0 max-w-3/6 z-10
${theme === 'tos' ? 'tos tos-border' : theme === 'cyberpunk' ? 'cyberpunk-bg neon-text border-2 border-cyan-400' : 'bg-white dark:bg-gray-800'}`} style={{ padding: 'calc(1 * var(--unit))', gap: 'calc(0.5 * var(--unit))', display: 'flex', flexDirection: 'column' }}>
            {/* Tabs */}
            <div className="h-1/12 flex" style={{ gap: 'calc(0.5 * var(--unit))' }}>
                <button onClick={() => setViewMode('lists')} className={`rounded-xl ${viewMode === 'lists' ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`} style={{ padding: 'calc(0.5 * var(--unit)) calc(1 * var(--unit))', fontSize: 'calc(1.2*var(--text-base))' }}>Lists</button>
                <button onClick={() => setViewMode('toRevise')} className={`rounded-xl ${viewMode === 'toRevise' ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`} style={{ padding: 'calc(0.5 * var(--unit)) calc(1 * var(--unit))', fontSize: 'calc(1.2*var(--text-base))' }}>To Revise</button>
            </div>

            {/* Content Container */}
            <div ref={parentRef} className="h-11/12 min-h-0 overflow-hidden w-full">
                {viewMode === 'lists' && (
                    <div className="h-full flex flex-col">
                        <div className="h-1/7"><Scrollbar /></div>
                        <div className="h-5/7"><Dropdown /></div>
                        <button
                            title="Please Choose or Add a list first"
                            disabled={!workingCatAdd}
                            onClick={handleAdd}
                            className='w-full h-1/7 text-black disabled:hidden bg-amber-300'
                            style={{ fontSize: 'var(--text-base)', borderRadius: `min(calc(0.75 * var(--unit)), 12px)` }}
                        >
                            Add New Category
                        </button>
                    </div>
                )}

                {viewMode === 'toRevise' && (
                    <ReviseList
                        parentRef={parentRef}
                        viewMode={viewMode}
                    />
                )}
            </div>
        </div>
    );

};

export default Dolist;