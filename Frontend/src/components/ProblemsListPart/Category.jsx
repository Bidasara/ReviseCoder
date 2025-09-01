import React, { useCallback } from 'react'
import { useProblemContext } from '../../contexts/ProblemContext'
import { useTheme } from '../../contexts/ThemeContext';
import Scroll from '../common/Scroll.jsx';
import Problem from './Problem.jsx'
import { useScroll } from '../../contexts/ScrollContext.jsx';
import { useModal } from '../../contexts/ModalContext.jsx';

const Category = ({ handleClick, item: category, elevate: elevatedCategory, open: openCategory }) => {
    const { currentList, deleteCategory, data } = useProblemContext();
    const { setFunc, setModalTitle, setModalExtra, setModalOpen, setInputId, setInputLabel, setInputPlaceHolder, setInputType } = useModal();
    const { elevatedProblem, setElevatedProblem } = useScroll();
    const handleAdd = () => {
        setModalTitle("Add Problem");
        setFunc("problem");
        setInputLabel("Problem Name or Number");
        setInputId("Problem");
        setInputPlaceHolder("name or number of the problem")
        setInputType("number")
        setModalExtra({ listId: currentList._id, catId: openCategory });
        setModalOpen(true);
    }
    const { theme } = useTheme()
    const handleDelete = useCallback((listId, categoryId, event) => {
        event.stopPropagation(); // Prevent the click from bubbling up to toggleCategory
        if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) return;
        deleteCategory(listId, categoryId)
            .then(() => {
                console.log(`Category ${categoryId} deleted successfully`);
            })
            .catch(err => {
                console.error(`Error deleting category ${categoryId}:`, err);
                alert(`Failed to delete category: ${err.message || 'Unknown error'}`);
            });
    }, [deleteCategory]);

    return (
        <>
            <div
                onClick={() => handleClick(category)}
                className={`cursor-pointer ${(openCategory && openCategory != "") ? "h-1/5" : "h-full"} flex justify-between items-center transition-all duration-200
            ${theme === 'cyberpunk'
                        ? `${elevatedCategory && category._id === elevatedCategory
                            ? 'bg-black bg-opacity-80  border-2 border-cyan-400 neon-text text-cyan-400'
                            : 'bg-black bg-opacity-60  border border-cyan-700 neon-text text-cyan-300 opacity-70'}
                    hover:bg-black hover:bg-opacity-80`
                        : `${elevatedCategory && category._id === elevatedCategory
                            ? 'bg-gray-50 dark:bg-gray-800  shadow-xl'
                            : 'bg-gray-200 dark:bg-gray-700/50  opacity-70'}
                        hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-700 dark:text-gray-300`
                    }`}
                style={{
                    padding: 'calc(1 * var(--unit))',
                    borderRadius: `min(calc(0.5 * var(--unit)), 8px)`
                }}
            >
                {/* delete icon */}
                <div className="flex items-center flex-1 min-w-0" style={{ gap: 'calc(0.5 * var(--unit))' }}>
                    <span onClick={(event) => handleDelete(currentList._id, category._id, event)} className="material-symbols-outlined delete-icon" style={{ fontSize: 'calc(1.8*var(--text-base))' }}>
                        delete
                    </span>

                    <span className={`truncate ${theme === 'cyberpunk' ? 'text-cyan-300 neon-text' : ''}`} style={{ fontSize: 'calc(1.3*var(--text-sm))' }}>{category.title}</span>
                    <span className={`font-medium rounded-md ${theme === 'cyberpunk' ? 'bg-black border border-cyan-400 text-cyan-400' : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'} shrink-0`} style={{
                        marginLeft: 'calc(0.5 * var(--unit))',
                        fontSize: 'var(--text-xs)',
                        padding: 'calc(0.125 * var(--unit)) calc(0.5 * var(--unit))',
                        borderRadius: `min(calc(0.25 * var(--unit)), 6px)`
                    }}
                    >
                        {category.problems.length}
                    </span>
                </div>
            </div>
            {(openCategory && openCategory != "") && (
                <>
                    <div className='h-4/5'>
                        <Scroll
                            items={data.lists?.find(list => list._id === currentList._id)?.categories?.find(cat => cat._id === openCategory)?.problems}
                            renderItem={Problem}
                            height={"h-2/5"}
                            heightForProblem={"h-10/12"}
                            elevatedProblem={elevatedProblem}
                            setElevatedProblem={setElevatedProblem}
                        />
                        <button onClick={handleAdd} className='w-full cursor-pointer h-2/12 text-black bg-amber-300' style={{ fontSize: 'var(--text-base)', borderRadius: `min(calc(0.75 * var(--unit)), 12px)` }}>

                            Add New Problem
                        </button>
                    </div>
                </>
            )}
        </>
    )

}

export default Category
