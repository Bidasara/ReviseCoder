import React, { useEffect, useRef, useState } from 'react';
import { useProblemContext } from '../../contexts/ProblemContext';
import Input from './Input';
import { useModal } from '../../contexts/ModalContext';

const Modal = ({size="md"}) => {
  const modalRef = useRef();
  const {inputLabel, inputId, inputPlaceHolder, modalExtra, func,query,setQuery,suggestions,setSuggestions,showSuggestions,setShowSuggestions,setModalOpen,modalOpen,modalTitle,setModalExtra} = useModal();
  const { addProblem,addCategory,problems,addEmptyList } = useProblemContext();

  let currFunc = addCategory;
  if (func === 'problem')
    currFunc = addProblem;
  else if (func === 'list')
    currFunc = addEmptyList;
  
  useEffect(() => {
    if (func!=='problem'){
      setSuggestions([]);
      setShowSuggestions(false)
      return;
    } 
    if(problems==[])
      return;
    if (query.length == 0 || query === "" || !showSuggestions)
      setSuggestions([]);
    setSuggestions(
      problems?.filter(
        p => p.title.toLowerCase().includes(query?.toLowerCase()) || String(p.num).includes(query)
      ).slice(0, 5)
    )
    setQuery(query);
  }, [query, problems, showSuggestions]);

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape'){
        setModalOpen(false);
        setQuery("")
        setShowSuggestions(false);
      } 
    };

    if (modalOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => {
        document.removeEventListener('keydown', handleEsc);
      };
    }
  }, [modalOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setModalOpen(false);
        setQuery("")
        setShowSuggestions(false);
      }
    };

    if (modalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [modalOpen]);

  if (!modalOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 backdrop-blur-md transition-opacity" style={{ padding: 'calc(1 * var(--unit))' }}>
    <div
      ref={modalRef}
      className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all animate-fadeIn"
      style={{ maxWidth: 'calc(30 * var(--unit))' }}
    >
      <div className="border-b border-gray-200 dark:border-gray-700" style={{ padding: 'calc(1.5 * var(--unit)) calc(1.5 * var(--unit)) calc(1 * var(--unit))' }}>
        <h3 className="font-medium text-gray-900 dark:text-white" style={{ fontSize: 'calc(1.125 * var(--text-base))' }}>{modalTitle}</h3>
      </div>

      <div style={{ padding: 'calc(1.5 * var(--unit))' }}>
        <Input
          label={inputLabel}
          id={inputId}
          type="text"
          placeholder={inputPlaceHolder}
          value={query}
          onChange={(e) => {
            setShowSuggestions(true);
            setQuery(e.target.value);
          }} 
          onKeyDown = {(e) => {
            if (e.key === 'Enter') {
              console.log("1");
              currFunc(e.target.value,modalExtra)
              setQuery("")
              setModalOpen(false)
              setModalExtra(null);
              setShowSuggestions(false);
            }
          }}
          extra={modalExtra}
        />
        {showSuggestions && (
          <ul className='absolute bg-white border rounded shadow z-50'>
            {suggestions.map(s => (
              <li
                key={s._id}
                className="cursor-pointer hover:bg-indigo-100"
                style={{ padding: 'calc(0.25 * var(--unit)) calc(0.5 * var(--unit))', fontSize: 'var(--text-sm)' }}
                onClick={() => {
                  setShowSuggestions(false);
                  setQuery(String(s.num))
                }
                }
              >
                {s.num}.  {s.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-b-lg flex justify-end" style={{ padding: 'calc(1 * var(--unit)) calc(1.5 * var(--unit))', gap: 'calc(0.75 * var(--unit))' }}>
        <button
          type="button"
          className="font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm 
                   hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors
                   dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          style={{ padding: 'calc(0.5 * var(--unit)) calc(1 * var(--unit))', fontSize: 'var(--text-sm)' }}
          onClick={()=>{
            setModalOpen(false);
            setQuery("");
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          className="font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm 
                   hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors
                   active:bg-indigo-800 active:transform active:scale-95
                   dark:bg-indigo-700 dark:hover:bg-indigo-600"
          style={{ padding: 'calc(0.5 * var(--unit)) calc(1 * var(--unit))', fontSize: 'var(--text-sm)' }}
          onClick={() => {
            currFunc(query,modalExtra)
            setQuery("")
            setModalExtra(null);
            setModalOpen(false)
          }}
        >
          Add
        </button>
      </div>
    </div>
  </div>
);

};

export default Modal;
