import { createContext, useState, useContext, useEffect } from 'react';
import NotificationPortal from '../components/common/Notification';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const showNotification = (message, type = 'success') => {
    // Step 1: Set the notification content
    setNotification({ message, type });
    // Step 2: Make it visible after a slight delay to allow the DOM to update
    setTimeout(() => setIsVisible(true), 100); 

    // Step 3: Start the hide process after 3 seconds
    setTimeout(() => {
      setIsVisible(false);
      // Step 4: After the transition finishes (500ms), clear the notification content
      setTimeout(() => setNotification(null), 500); 
    }, 3000); 
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <NotificationPortal 
          notification={notification} 
          isVisible={isVisible}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);