import { createContext, useContext, useState, useEffect } from 'react';

// Local Imports
import api from "../api";
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext.jsx';
import { useModal } from './ModalContext.jsx';
import { useScroll } from './ScrollContext.jsx';
import { useNoteModal } from './NoteModalContext.jsx';

//==============================================================================
// CONTEXT CREATION
//==============================================================================

// Create the context to hold problem-related data and functions
const ProblemContext = createContext();

//==============================================================================
// PROVIDER COMPONENT
//==============================================================================

export const ProblemProvider = ({ children }) => {
  //----------------------------------------------------------------------------
  // HOOKS
  //----------------------------------------------------------------------------

  // External hooks for authentication and notifications
  const { accessToken } = useAuth();
  const { showNotification } = useNotification();
  const { setModalOpen, query, setQuery } = useModal();
  const { openCategory, setOpenCategory, setElevatedCategory, setElevatedProblem } = useScroll();
  const { setNoteModalContent, setNoteModalOpen } = useNoteModal();

  //----------------------------------------------------------------------------
  // STATE MANAGEMENT
  //----------------------------------------------------------------------------

  // ===== Core Data State =====
  // `data`: Main object holding the user's lists, categories, and problems.
  const [data, setData] = useState({ lists: [] });
  // `problems`: A flat list of all possible problems (e.g., from LeetCode).
  const [problems, setProblems] = useState([]);
  // `recomList`: Pre-made lists from the backend that users can add.
  const [recomList, setRecomList] = useState([]);

  // ===== Current Selection State =====
  // `currentList`: The list the user is currently viewing.
  const [currentList, setCurrentList] = useState(data?.lists[0] || {});

  // ===== Statistics State =====
  const [totalSolved, setTotalSolved] = useState(0);
  const [totalRevised, setTotalRevised] = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);
  const [pixels, setPixels] = useState(0);

  //----------------------------------------------------------------------------
  // DATA FETCHING & INITIALIZATION (EFFECTS)
  //----------------------------------------------------------------------------

  // Effect to fetch the list of ALL possible problems (from cache or API)
  useEffect(() => {
    console.log("fetchAllProblems")
    const fetchAllProblems = async () => {
      const cachedProblems = localStorage.getItem("allProblems");
      if (cachedProblems) {
        try {
          setProblems(JSON.parse(cachedProblems));
          setTotalProblems(JSON.parse(cachedProblems).length);
        } catch (err) {
          console.error("Error parsing cached 'allProblems' data", err);
        }
      } else {
        try {
          const response = await api.get('/data/allProblems');
          console.log(response)
          const fetchedProblems = response.data.data.problems;
          const total = response.data?.data?.totalProblems;
          setProblems(fetchedProblems);
          setTotalProblems(total);
          localStorage.setItem("allProblems", JSON.stringify(fetchedProblems));
          localStorage.setItem("TotsProbs", JSON.stringify(total));
        } catch (error) {
          console.error("Error fetching all problems from API", error);
          setProblems([]);
        }
      }
    };
    fetchAllProblems();
  }, [accessToken]);

  // Effect to fetch recommended lists (from cache or API)
  useEffect(() => {
    const fetchRecomLists = async () => {
      const cachedRecomLists = localStorage.getItem("recomLists");
      if (cachedRecomLists) {
        try {
          setRecomList(JSON.parse(cachedRecomLists));
        } catch (err) {
          console.error("Error parsing cached 'recomLists' data", err);
        }
      } else {
        try {
          const response = await api.get('/data/recomLists');
          const fetchedLists = response.data.data;
          setRecomList(fetchedLists);
          localStorage.setItem("recomLists", JSON.stringify(fetchedLists));
        } catch (error) {
          console.error("Error fetching recommended lists from API", error);
          setRecomList([]);
        }
      }
    };
    fetchRecomLists();
  }, [accessToken]);

  // Effect to fetch user-specific data when the access token changes (e.g., on login)
  useEffect(() => {
    const fetchUserData = async () => {
      // First, try to load user data from localStorage for a faster experience
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setData(parsedData);
          setCurrentList(parsedData.lists[0] || {});
          setPixels(JSON.parse(localStorage.getItem("Pixels")) || 0);
          setTotalProblems(JSON.parse(localStorage.getItem("TotsProbs")) || 0);
          return; // Exit if cached data is loaded successfully
        } catch (err) {
          console.error("Error parsing cached 'userData'", err);
        }
      }

      // If no cached data, fetch from the API
      try {
        const response = await api.get('/data/getAllLists', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const fetchedData = response.data?.data;
        setData(fetchedData);
        setCurrentList(fetchedData.lists[0] || {});
        setPixels(fetchedData.pixels || 0);
        setTotalProblems(fetchedData.totalProblems || 0);

        // Cache the fetched data
        localStorage.setItem("userData", JSON.stringify(fetchedData));
        localStorage.setItem("Pixels", JSON.stringify(fetchedData.pixels || 0));
        localStorage.setItem("TotsProbs", JSON.stringify(fetchedData.totalProblems || 0));
      } catch (error) {
        console.error("Error fetching user data from API", error);
        resetData(); // Reset state on error
      }
    };

    if (accessToken) {
      fetchUserData();
    } else {
      resetData();
    }
  }, [accessToken]);

  // Effect to persist the currently open category for a specific list
  useEffect(() => {
    if (!currentList?._id) return;

    const listId = currentList._id;
    const isValidOpenCategory = currentList.categories.some(cat => cat._id === openCategory);

    if (isValidOpenCategory) {
      // If the open category is valid for the current list, do nothing.
    } else {
      // Otherwise, try to load the last known open category for this list from localStorage.
      const lastOpenCategory = localStorage.getItem(`openCategory_${listId}`);
      if (currentList.categories.some(cat => cat._id === lastOpenCategory)) {
        setOpenCategory(lastOpenCategory);
      }
    }
  }, [currentList?._id, currentList?.categories]);


  //----------------------------------------------------------------------------
  // HELPER & UTILITY FUNCTIONS
  //----------------------------------------------------------------------------

  /**
   * Resets all user-related state and clears relevant localStorage items.
   * Typically called on logout or auth error.
   */
  const resetData = () => {
    setData({ lists: [] });
    setCurrentList({});
    setElevatedCategory(null);
    setOpenCategory(null);
    setTotalSolved(0);
    setTotalProblems(0);
    localStorage.clear();
  };

  /**
   * Fetches the total counts of solved and revised problems from the backend.
   */
  const getTotalSolved = async () => {
    try {
      const response = await api.get('/data/solvedAndRevised');
      const temp = response.data.data
      setTotalSolved(temp.solved + temp.revised + temp.mastered);
      setTotalRevised(temp.revised + temp.mastered);
      console.log(response)
    } catch (err) {
      console.error("Error fetching solved/revised counts:", err);
    }
  };


  //----------------------------------------------------------------------------
  // API/CRUD FUNCTIONS - LISTS
  //----------------------------------------------------------------------------

  /**
   * Adds a new, empty list for the user.
   * @param {string} title - The title for the new list.
   */
  const addEmptyList = async (title) => {
    try {
      const response = await api.post('/data/addList', { title });
      const newList = response?.data?.data?.list;
      const updatedData = { ...data, lists: [...data.lists, newList] };

      setData(updatedData);
      setCurrentList(newList);
      setElevatedCategory(null);
      localStorage.setItem("userData", JSON.stringify(updatedData));
    } catch (error) {
      console.error("Error adding empty list:", error);
    }
  };

  /**
   * Adds a pre-made recommended list to the user's collection.
   * @param {string} listId - The _id of the recommended list to add.
   */
  const addToList = async (listId) => {
    const listToAdd = recomList.find(list => list._id === listId);
    if (!listToAdd) return console.error("Recommended list not found");
    if (data?.lists?.find(list => list.title === listToAdd.title)) {
      return showNotification("A list with this name already exists", "error");
    }

    try {
      const response = await api.post('/data/addRecomList', { listId }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const createdList = response.data.data.list;
      const updatedData = { ...data, lists: [...data.lists, createdList] };

      setData(updatedData);
      setCurrentList(createdList);
      setOpenCategory(null);
      setElevatedCategory(null);
      localStorage.setItem("userData", JSON.stringify(updatedData));
      showNotification("Successfully added recommended list", "success");
    } catch (error) {
      showNotification("Error adding list to database", "error");
      console.error("Error adding recommended list:", error);
    }
  };

  /**
   * Deletes a user's list.
   * @param {string} listId - The _id of the list to delete.
   */
  const deleteList = async (listId) => {
    try {
      await api.delete('/data/deleteList', {
        data: { listId },
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const updatedLists = data.lists.filter(list => list._id !== listId);
      const updatedData = { ...data, lists: updatedLists };

      setData(updatedData);
      // If the deleted list was the current one, switch to the first available list
      if (currentList._id === listId) {
        setCurrentList(updatedLists[0] || {});
      }
      localStorage.setItem("userData", JSON.stringify(updatedData));
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  //----------------------------------------------------------------------------
  // API/CRUD FUNCTIONS - CATEGORIES
  //----------------------------------------------------------------------------

  /**
   * Adds a new category to a specified list.
   * @param {string} listId - The _id of the list to add the category to.
   */
  const addCategory = async (query, listId) => {
    setModalOpen(false);
    try {
      const response = await api.patch('/data/addCategory',
        { listId: listId, title: query },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const newCategory = {
        _id: response.data.data,
        title: query,
        problems: []
      };

      const updatedData = {
        ...data,
        lists: data.lists.map(list =>
          list._id === listId
            ? { ...list, categories: [...list.categories, newCategory] }
            : list
        )
      };

      setData(updatedData);
      setOpenCategory(newCategory._id);
      localStorage.setItem("userData", JSON.stringify(updatedData));
    } catch (err) {
      console.error("Error adding category:", err);
    }
  };

  /**
   * Deletes a category from a specified list.
   * @param {string} listId - The _id of the list containing the category.
   * @param {string} categoryId - The _id of the category to delete.
   */
  const deleteCategory = async (listId, categoryId) => {
    try {
      await api.delete('/data/deleteCategory', {
        data: { listId, categoryId },
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const updatedData = {
        ...data,
        lists: data.lists.map(list =>
          list._id === listId
            ? { ...list, categories: list.categories.filter(cat => cat._id !== categoryId) }
            : list
        )
      };

      setData(updatedData);
      setOpenCategory(null);
      localStorage.setItem("userData", JSON.stringify(updatedData));
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  };

  //----------------------------------------------------------------------------
  // API/CRUD FUNCTIONS - PROBLEMS
  //----------------------------------------------------------------------------

  /**
   * Adds a problem to a category by its number.
   * @param {object} data - Contains listId and catId.
   */
  const addProblem = async (query, ids) => {
    const probNum = parseInt(query);

    if (ids) {
      const { listId, catId } = ids;
      const category = currentList.categories.find(cat => cat._id === catId);

      // Prevent adding a duplicate problem to the same category
      if (category?.problems.some(p => p.problemId.num === probNum)) {
        showNotification('This problem already exists in the current category.', 'error');
        setNoteModalOpen(false); // Close the modal on error
        return;
      }

      try {
        const response = await api.patch('/data/addProblem', { listId, catId, probNum });
        const { prob, p_id, status } = response.data.data;

        const newProblem = {
          _id: p_id,
          status: status,
          notes: "",
          problemId: { ...prob }
        };

        const updatedData = {
          ...data,
          lists: data.lists.map(list =>
            list._id === listId
              ? {
                ...list,
                categories: list.categories.map(cat =>
                  cat._id === catId
                    ? { ...cat, problems: [...cat.problems, newProblem] }
                    : cat
                )
              }
              : list
          )
        };

        setData(updatedData);
        setElevatedProblem(newProblem._id);
        localStorage.setItem("userData", JSON.stringify(updatedData));
        showNotification(`Problem number ${probNum} added successfully`, 'success');
        return true; // Exit the function after success
      } catch (err) {
        console.error("Error adding problem:", err);
        // You can add an error notification here if needed
      } finally {
        // This block will always execute, regardless of success or failure
        setModalOpen(false);
      }
    } else {
      try {
        const response = await api.get(`/data/hint?probNum=${query}`);
        setNoteModalContent({
          probNum: query,
          initialText: "",
          hints: response.data.data
        });
        setNoteModalOpen(true);
      } catch (error) {
        console.error("Error fetching hint:", error);
      }
    }
  };

  /**
   * Deletes a problem from a category.
   * @param {string} listId - The list ID.
   * @param {string} categoryId - The category ID.
   * @param {string} problemId - The problem's unique ID in the user's list.
   */
  const deleteProblem = async (listId, categoryId, problemId) => {
    await api.delete('/data/deleteProblem', {
      data: { listId, categoryId, problemId },
    });

    const updatedData = {
      ...data,
      lists: data.lists.map(list =>
        list._id === listId ? {
          ...list,
          categories: list.categories.map(cat =>
            cat._id === categoryId ? {
              ...cat,
              problems: cat.problems.filter(p => p._id !== problemId)
            } : cat
          )
        } : list
      )
    };

    setData(updatedData);
    localStorage.setItem("userData", JSON.stringify(updatedData));
  };

  /**
   * Marks a problem as solved, submits notes, and handles revision scheduling.
   * @param {string} listId
   * @param {string} categoryId
   * @param {string} problemId
   * @param {string} note - The notes for the problem.
   * @param {boolean} addToRevise - Whether to add to the revision queue.
   */
  const updateProblemStatus = async (listId, categoryId, problemId, note, level, probNum) => {
    try {
      const response = await api.patch('/data/submit',
        { listId, catId: categoryId, probId: problemId, notes: note, levelOfRevision: level, probNum },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const newPixels = response.data?.data;
      setPixels(newPixels);
      localStorage.setItem("Pixels", JSON.stringify(newPixels));
      if (listId) {
        const updatedData = {
          ...data,
          lists: data.lists.map(list =>
            list._id === listId ? {
              ...list,
              categories: list.categories.map(cat =>
                cat._id === categoryId ? {
                  ...cat,
                  problems: cat.problems.map(p =>
                    p.problemId._id === problemId ? {
                      ...p,
                      notes: note,
                      status: 'solved',
                    } : p
                  )
                } : cat
              )
            } : list
          )
        };

        setData(updatedData);
        localStorage.setItem("userData", JSON.stringify(updatedData));
      }
      showNotification(response.data.message, "success")
    } catch (err) {
      showNotification(err.response.data.message, "error")
      console.error("Error updating problem status:", err);
    }
  };

  /**
   * Marks a problem in the revision queue as revised.
   * @param {string} listId 
   * @param {string} titleCategory - The title of the category.
   * @param {string} probId 
   */
  const updateProblemRevisedStatus = async (probId) => {
    try {
      const response = await api.patch('/data/markRevised',
        { probId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      console.log(response, "Mark Revised Response")

      const newPixels = response.data?.data?.pixels;
      setPixels(newPixels);
      localStorage.setItem("Pixels", JSON.stringify(newPixels));
      const updatedData = response.data?.data?.result;
      setData(updatedData);
      localStorage.setItem("userData", JSON.stringify(updatedData));
    } catch (error) {
      console.error("Error updating problem revised status:", error);
    }
  };

  //----------------------------------------------------------------------------
  // CONTEXT VALUE
  //----------------------------------------------------------------------------

  // Bundle all state and functions into a single value object for the provider.
  const value = {
    // State
    data,
    setData,
    currentList,
    setCurrentList,
    recomList,
    problems,
    setProblems,

    // Statistics
    totalSolved,
    setTotalSolved,
    totalProblems,
    setTotalProblems,
    totalRevised,
    setTotalRevised,
    pixels,
    setPixels,

    // Functions
    resetData,
    getTotalSolved,
    deleteList,
    deleteCategory,
    deleteProblem,
    updateProblemStatus,
    updateProblemRevisedStatus,
    addCategory,
    addProblem,
    addToList,
    addEmptyList,
  };

  //----------------------------------------------------------------------------
  // RENDER
  //----------------------------------------------------------------------------

  return (
    <ProblemContext.Provider value={value}>
      {children}
    </ProblemContext.Provider>
  );
};

//==============================================================================
// CUSTOM HOOK
//==============================================================================

/**
 * Custom hook to easily consume the ProblemContext.
 * Throws an error if used outside of a ProblemProvider.
 */
export const useProblemContext = () => {
  const context = useContext(ProblemContext);
  if (context === undefined) {
    throw new Error('useProblemContext must be used within a ProblemProvider');
  }
  return context;
};