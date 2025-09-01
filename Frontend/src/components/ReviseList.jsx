import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { useSpriteAnimation } from '../contexts/SpriteAnimationContext.jsx';
import { useReviseData } from '../hooks/useReviseData.js';
import { useProblemContext } from '../contexts/ProblemContext.jsx';
import Scroll from './common/Scroll.jsx';
import ReviseProblemItem from './ProblemsListPart/ReviseProblemItem.jsx'
import { useNoteModal } from '../contexts/NoteModalContext.jsx';
import { useModal } from '../contexts/ModalContext.jsx';
import api from '../api.js';

const ReviseList = ({ viewMode, parentRef }) => {
    const { currCharacter, triggerAttack } = useSpriteAnimation();
    const [currentPack, setCurrentPack] = useState(null);
    const [animatingProblemId, setAnimatingProblemId] = useState(null);
    const [hidingProblemId, setHidingProblemId] = useState(null);
    const { reviseData, refetch } = useReviseData(viewMode);
    const [scale, setScale] = useState(5);
    const { updateProblemRevisedStatus } = useProblemContext();
    const { setNoteModalContent, setNoteModalOpen } = useNoteModal();
    const { setModalOpen, setModalTitle, setFunc, setInputLabel, setInputId, setInputPlaceHolder, setInputType, setModalExtra } = useModal();
    //add useCallback here
    const getCurrentCharacterPack = useCallback(() => {
        try {
            const allAnimations = localStorage.getItem('allAnimations');
            if (!allAnimations || currCharacter == null) return null;
            const animations = JSON.parse(allAnimations);
            return animations.find(anim => anim.title === currCharacter) || animations[0];
        } catch (error) {
            console.error('Error getting current character pack:', error);
            return null;
        }
    }, [currCharacter]);

    const handleOpenNotes = async (problem) => {
        try {
            const freshReviseData = await refetch();
            const updatedProblem = freshReviseData
                .find(p => p.problemId === problem.problemId);

            if (!updatedProblem) {
                console.error("Updated problem not found after refetch.");
                return;
            }
            setNoteModalContent({
                problemId: updatedProblem.problemId,
                initialText: updatedProblem.notes,
                update: true,
            });

            // Open the modal only after all the data is ready
            setNoteModalOpen(true)
        } catch (error) {
            console.error('Error fetching revise data:', error);
        }
    }
    const handleMarkRevised = useCallback(async (problemId) => {
        if (animatingProblemId)
            return;
        setAnimatingProblemId(problemId);
        triggerAttack();
        const anim = currentPack;
        const delay = anim.pack.break.frames / anim.pack.break.fps;

        await new Promise(resolve => setTimeout(resolve, delay * 1000 - 100));

        setHidingProblemId(problemId);
        await updateProblemRevisedStatus(problemId);
        refetch()
        setAnimatingProblemId(null);

    }, [updateProblemRevisedStatus, currentPack, triggerAttack, refetch]);

    const scaleFactor = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scale-factor'));
    useEffect(() => {
        if (currentPack && parentRef.current) {
            const parentHeight = parentRef.current.getBoundingClientRect().height;
            setScale(6);
        }
    }, [currentPack, parentRef]);

    // Animation-related state
    useEffect(() => {
        setCurrentPack(getCurrentCharacterPack());
    }, [currCharacter, getCurrentCharacterPack])

    if (!currentPack) {
        return <div className="text-center" style={{ padding: 'calc(1 * var(--unit))', fontSize: 'var(--text-base)' }}>Loading Animations...</div>;
    }

    const handleAdd = () => {
        setModalTitle("Add Problem");
        setFunc("problem");
        setInputLabel("Problem Name or Number");
        setInputId("Problem");
        setInputPlaceHolder("name or number of the problem")
        setInputType("number")
        setModalOpen(true);
        setModalExtra(null);
    }

    return (
        <div className="h-full flex flex-col min-h-0 relative">

            <div className="relative h-full min-h-0 overflow-y-auto" style={{ paddingRight: 'calc(0.5 * var(--unit))' }}>
                <Scroll
                    items={reviseData}
                    width={currentPack.pack.break.frameWidth * 1.5}

                    renderItem={({ item, handleClick }) => (
                        <ReviseProblemItem
                            handleClick={handleClick}
                            key={item._id}
                            item={item}
                            onMarkRevised={handleMarkRevised}
                            onOpenNotes={handleOpenNotes}
                            isAnimating={animatingProblemId === item.problemId}
                            isHiding={hidingProblemId === item.problemId}
                            currentPack={currentPack}
                            scale={scale}
                        />
                    )}
                />
            </div>
            <button
                className='group bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 absolute flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50'
                style={{
                    width: 'calc(3 * var(--unit))',
                    height: 'calc(3 * var(--unit))',
                    bottom: 'calc(1 * var(--unit))',
                    right: 'calc(1 * var(--unit))'
                }}
                onClick={handleAdd}
            >
                <svg
                    className="transition-transform duration-200 group-hover:rotate-90"
                    style={{
                        width: 'calc(1.5 * var(--unit))',
                        height: 'calc(1.5 * var(--unit))'
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                    />
                </svg>
            </button>

        </div>
    )

}

export default ReviseList
