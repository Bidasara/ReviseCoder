import { Children, createContext, useContext, useState } from "react";

const ScrollContext = createContext();

export const ScrollProvider = ({ children }) => {
    // ===== UI Interaction State =====
    // `openCategory`: The category that is currently expanded to show problems.
    const [openCategory, setOpenCategory] = useState(null);
    // `elevatedCategory`: The ID of a category to be visually highlighted.
    const [elevatedCategory, setElevatedCategory] = useState(null);
    // `elevatedProblem`: The ID of a problem to be visually highlighted.
    const [elevatedProblem, setElevatedProblem] = useState(null);

    return (
        <ScrollContext.Provider value={{
            openCategory, setOpenCategory,
            elevatedCategory, setElevatedCategory,
            elevatedProblem, setElevatedProblem
        }}>
            {children}
        </ScrollContext.Provider>
    )
}

export const useScroll = () => useContext(ScrollContext);