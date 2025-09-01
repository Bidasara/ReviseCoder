import { memo } from 'react';
import BreakDemo from '../AnimationPart/BreakAnimations.jsx';

const ReviseProblemItem = ({
    handleClick,
    item: prob,
    onMarkRevised,
    onOpenNotes,
    isAnimating,
    isHiding,
    currentPack,
    scale
}) => {

    if (!currentPack) {
        return <div style={{ fontSize: 'var(--text-base)' }}>Loading animations...</div>;
    }

    return (
        <div
            onClick={() => handleClick(prob)}
            className={`bg-white z-50 shadow-md border border-indigo-200 transition-all duration-300 hover:border-indigo-400 flex flex-nowrap items-center justify-between overflow-hidden`}
            style={{
                height: `calc(${currentPack.pack.break.frameHeight * 1.43} * var(--unit-xs))`,
                opacity: isHiding ? 0 : 1,
                padding: 'calc(1 * var(--unit))',
                borderRadius: `calc(1 * var(--unit))`
            }}
        >
            {isAnimating ? (
                <BreakDemo scale={6} pack={currentPack} />
            ) : (
                <>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate" style={{ fontSize: 'calc(1.3*var(--text-xs))' }} title={prob.title}>
                            {prob.title || 'Untitled Problem'}
                        </p>
                        <p className="text-gray-500 truncate" style={{ fontSize: 'calc(1.3*var(--text-xs))' }}>
                            #{prob.num} | {prob.difficulty}
                        </p>
                    </div>
                    <div className="flex items-center flex-shrink-0" style={{ gap: 'calc(0.5 * var(--unit))', marginTop: 'calc(0.5 * var(--unit))' }}>
                        <button
                            disabled={isAnimating}
                            onClick={() => onMarkRevised(prob.problemId)}
                            className={`rounded bg-green-100 text-green-800 whitespace-nowrap ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{
                                fontSize: 'calc(1.2*var(--text-xs))',
                                padding: 'calc(0.25 * var(--unit)) calc(0.5 * var(--unit))',
                                borderRadius: `calc(0.25 * var(--unit))`
                            }}
                        >
                            Mark Revised
                        </button>
                        {prob.link && (
                            <a href={prob.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline whitespace-nowrap" style={{ fontSize: 'calc(1.3*var(--text-xs))' }}>
                                View
                            </a>
                        )}
                        <button onClick={() => onOpenNotes(prob)} className="rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30" style={{ padding: 'calc(0.375 * var(--unit))' }} title="View/Edit Notes">
                            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 'calc(1.125 * var(--unit))', height: 'calc(1.125 * var(--unit))' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                            </svg>
                        </button>
                    </div>
                </>
            )}
        </div>
    );

};

export default memo(ReviseProblemItem);
