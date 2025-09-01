import React from 'react';

const GameUI = () => {
  return (
    // This container and its direct children use scalable units for padding and gaps.
    <div className="h-full w-full p-unit-lg flex flex-col gap-unit-lg">
      
      {/* SCALABLE COMPONENT */}
      <div className="bg-blue-100 p-unit-xl rounded-lg">
        <h1 className="text-unit-xl font-bold">Player Stats</h1>
        <p className="text-unit">
          This text, its heading, and the padding of this box will all scale
          proportionally with the screen size.
        </p>
      </div>

      {/* FIXED-SIZE COMPONENT */}
      <div className="bg-gray-200 p-4 rounded-lg w-64 h-32 flex-shrink-0">
        <h2 className="text-lg font-bold">Mini-Map</h2>
        <p className="text-sm">
          This mini-map panel will always be 256px wide (w-64) and 128px high (h-32). 
          Its internal text and padding are also fixed.
        </p>
      </div>

    </div>
  );
};

export default GameUI;