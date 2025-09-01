import { useContext, createContext,useState } from "react";
import { useAuth } from "./AuthContext";
import api from "../api";

const NoteModalContext = createContext();

export const NoteModalProvider = ({ children }) => {
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [noteModalContent, setNoteModalContent] = useState({});
    const {accessToken } = useAuth();
    /**
   * Updates the notes for a specific problem.
   * @param {string} listId 
   * @param {string} categoryId 
   * @param {string} problemId 
   * @param {string} updatedNotes 
   */
    const updateNotes = async ( problemId, updatedNotes) => {
        try {
            await api.patch('/data/updateNotes',
                { probId: problemId, notes: updatedNotes },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )
            setNoteModalOpen(false);
        } catch (err) {
            console.error("Error updating notes:", err);
        }
    };
    return (
        <NoteModalContext.Provider value={{
            noteModalOpen,
            setNoteModalOpen,
            noteModalContent,
            setNoteModalContent,
            updateNotes
        }}>
            {children}
        </NoteModalContext.Provider>
    )

}

export const useNoteModal = () => useContext(NoteModalContext);