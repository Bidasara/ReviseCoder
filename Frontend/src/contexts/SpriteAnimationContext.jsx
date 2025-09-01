import { useContext, createContext, useEffect, useState } from "react";

const SpriteAnimationContext = createContext();

export const SpriteAnimationProvider = ({ children }) => {
    const [currentAnimation, setCurrentAnimation] = useState('idle')
    const [loop, setLoop] = useState(true);
    const [currCharacter, setCurrCharacter] = useState(() => {
        return localStorage.getItem('currCharacter') || '';
    });
    const [userAnimations,setUserAnimations] = useState([]);
    const triggerAttack = () => {
        setCurrentAnimation('attack');
        setLoop(false);
        return;
    }

    const backToIdle = () => {
        setCurrentAnimation('idle');
        setLoop(true);
        return;
    }

    return (
        <SpriteAnimationContext.Provider value={{ currentAnimation, setCurrentAnimation, loop, setLoop, triggerAttack, currCharacter, setCurrCharacter, backToIdle, userAnimations,setUserAnimations }}>
            {children}
        </SpriteAnimationContext.Provider>
    );
};

export const useSpriteAnimation = () => useContext(SpriteAnimationContext);