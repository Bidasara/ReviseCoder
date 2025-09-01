import { useContext, createContext,useState } from "react";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {

    // ===== Generic Modal State =====
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalExtra, setModalExtra] = useState("");
    const [func, setFunc] = useState(""); // Stores the function to be executed by the modal
    const [inputLabel, setInputLabel] = useState("");
    const [inputId, setInputId] = useState("2");
    const [inputType, setInputType] = useState("number");
    const [inputPlaceHolder, setInputPlaceHolder] = useState("");
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(true);

    //----------------------------------------------------------------------------
    // MODAL HANDLERS
    //----------------------------------------------------------------------------

    return (
        <ModalContext.Provider value={{
            modalOpen, setModalOpen,
            modalTitle, setModalTitle,
            modalExtra, setModalExtra,
            func, setFunc,
            inputLabel, setInputLabel,
            inputId, setInputId,
            inputType, setInputType,
            inputPlaceHolder, setInputPlaceHolder,
            query, setQuery,
            suggestions, setSuggestions,
            showSuggestions, setShowSuggestions
        }}>
            {children}
        </ModalContext.Provider>
   )
}

export const useModal = () => useContext(ModalContext);