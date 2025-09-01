import React from 'react';
import api from '../api';
import { useNotification } from '../contexts/NotificationContext';

const getStatusIcon = (status) => {
    switch (status) {
        case 'completed':
            return '✅';
        case 'in-progress':
            return '⏳';
        case 'locked':
            return '🔒';
        default:
            return '⭐';
    }
};

const MilestoneCard = ({ title, description, rewardText, status,onClaim }) => {
    
    const {showNotification}= useNotification();
    let rewardT = "Get ";

    if (rewardText.rewardPixels > 0)
        rewardT += `${rewardText.rewardPixels} Pixels`
    if (rewardText.rewardAnimation)
        rewardT += 'exclusive Animation '
    return (
        <div className={`milestone-card flex justify-between ${status}`}>
            <div className='flex items-center'>
            <div className="milestone-icon" style={{ fontSize: 'var(--text-2xl)', marginRight: 'calc(1 * var(--unit))' }}>
                {getStatusIcon(status)}
            </div>
            <div className="milestone-content">
                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'calc(0.5 * var(--unit))' }}>{title}</h3>
                <p style={{ fontSize: 'var(--text-base)', marginBottom: 'calc(0.5 * var(--unit))' }}>{description}</p>
                <div className="milestone-reward" style={{ fontSize: 'var(--text-sm)' }}>
                    <span role="img" aria-label="reward">🎁</span> {rewardT}
                </div>
            </div>
            </div>
            {!status?(
                <div className='bg-gray-600 rounded-2xl text-pretty text-shadow-lg' style={{ 
                    padding: 'calc(0.75 * var(--unit)) calc(1 * var(--unit))', 
                    fontSize: 'var(--text-lg)' 
                }}>Claimed</div>
            ):(
            <button onClick={()=>onClaim(rewardText._id)} className='bg-yellow-500 hover:font-bold rounded-2xl text-pretty text-shadow-lg transition-all' style={{ 
                padding: 'calc(0.75 * var(--unit)) calc(1 * var(--unit))', 
                fontSize: 'var(--text-lg)' 
            }}>Claim</button>
            )}
        </div>
    );
};

export default MilestoneCard;
