import { useContext,createContext,useState } from "react";

const BreakAnimationContext = createContext();

export const BreakAnimationProvider = ({children}) =>{
    const [currBreakAnimation, setCurrBreakAnimation] = useState('')

    return (
        <BreakAnimationContext.Provider value={{ currBreakAnimation,setCurrBreakAnimation }}>
        {children}
        </BreakAnimationContext.Provider>
    );
};

export const useBreakAnimation = () => useContext(BreakAnimationContext);