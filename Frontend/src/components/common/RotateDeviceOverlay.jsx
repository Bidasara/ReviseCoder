import React, { useState, useEffect } from 'react';

const RotateDeviceOverlay = () => {
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const handleOrientationChange = () => {
      // Check if it's a mobile device (e.g., screen width < 768px)
      const isMobile = window.innerWidth < 768;
      
      // Check if the orientation is portrait
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;

      // Show the overlay only if it's a mobile device in portrait mode
      setShowOverlay(isMobile && isPortrait);
    };

    // Run the check on initial load
    handleOrientationChange();

    // Add event listener for resize/orientation changes
    window.addEventListener('resize', handleOrientationChange);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  if (!showOverlay) {
    return null; // Don't render anything if the overlay shouldn't be shown
  }

  return (
    <div className="rotate-overlay">
      <div className="rotate-overlay-content">
        {/* Simple SVG for a rotate icon */}
        <svg
          className="rotate-overlay-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p>Please rotate your device for the best experience.</p>
      </div>
    </div>
  );
};

export default RotateDeviceOverlay;