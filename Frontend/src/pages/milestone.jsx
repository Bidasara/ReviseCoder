// src/components/MilestonesPage.jsx

import React, { useState, useEffect } from 'react';
import MilestoneCard from '../components/MilestoneCard';
import { useProblemContext } from '../contexts/ProblemContext';
import api from '../api';
import { useNotification } from '../contexts/NotificationContext';


const MilestonesPage = () => {
    const { showNotification } = useNotification();
    const handleClaim = async (milestoneId) => {
        try {
            // This is the same API call from MilestoneCard
            await api.patch(`/user/markMilestoneDone/${milestoneId}`);
            
            // On success, re-fetch the user's progress. This will update state and localStorage.
            await getMilestonesDone();
            
            showNotification("Milestone Claimed!", "success");

        } catch (error) {
            console.error(error);
            showNotification(error.response?.data?.data || 'Already Done or Can\'t Claim at the moment', 'error');
        }
    };
    const getMilestones = async () => {
        const data = localStorage.getItem('milestones');
        if (data) {
            const parsedData = JSON.parse(data);
            setMilestones(parsedData);
        } else {
            try {
                const response = await api.get("/user/getAllMilestones", { withCredentials: true });
                localStorage.setItem('milestones', JSON.stringify(response.data.data));
                setMilestones(response.data.data);
                return;
            } catch (err) {
                console.error("Error getting all milestones", err);
            }
        }
    }
    const getMilestonesDone = async () => {
            try {
                const response = await api.get("/user/getMilestonesDone", { withCredentials: true });
                localStorage.setItem('milestonesDone', JSON.stringify(response.data.data.milestones));
                setMilestonesDone(response.data.data.milestones);
                localStorage.setItem('pixels',response.data.data.pixels);
                setPixels(response.data.data.pixels);
                return;
            } catch (err) {
                console.error("Error getting all done milestones", err);
            }
    }
    useEffect(() => {
        getMilestones();
        getMilestonesDone()
    }, [])
    
    //   const [pixels, setPixels] = useState(1250);
    const [milestones, setMilestones] = useState([]);
    const { pixels,setPixels } = useProblemContext();
    const [milestonesDone, setMilestonesDone] = useState(localStorage.getItem('milestonesDone') || []);

    // In a real app, you would have functions here to handle claiming rewards
    // which would update the state and make an API call.

    return (
        <div className="milestones-page flex flex-col items-end overflow-y-auto" style={{padding:'calc(1 * var(--unit))'}}>
            <div className="pixel-counter sticky z-30" style={{ top: 'calc(2 * var(--unit-xs))' }}>
                <span role="img" aria-label="pixel-coin" style={{ fontSize: 'calc(1.5*var(--text-sm))' }}>{pixels}💠</span>
            </div>
            <header className="milestones-header w-full">
                <h1 style={{ fontSize: 'var(--text-2xl)', padding: 'calc(1 * var(--unit))' }}>Milestones</h1>
            </header>

            <main className="flex flex-col w-full" style={{ gap: 'calc(0.75 * var(--unit))' }}>
                {milestones.map((milestone) => (
                    !milestonesDone?.includes(milestone._id)? (
                        <MilestoneCard
                            key={milestone._id}
                            title={milestone.title}
                            description={milestone.condition}
                            rewardText={milestone}
                            status={true}
                            onClaim={handleClaim}
                        />
                    ):null
                ))}
                {milestones.map((milestone) => (
                    milestonesDone.includes(milestone._id) ? (
                        <MilestoneCard
                            key={milestone._id}
                            title={milestone.title}
                            description={milestone.condition}
                            rewardText={milestone}
                            status={false}
                        />
                    ):null
                ))}
            </main>
        </div>
    );
};

export default MilestonesPage;
