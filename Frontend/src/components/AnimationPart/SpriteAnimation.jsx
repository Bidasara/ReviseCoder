import { useState, useEffect } from 'react';

const SpriteAnimation = ({
  spriteSheet,
  frameWidth,
  frameHeight,
  frameCount,
  fps = 12,
  loop = true,
  className = '',
  onComplete,
  scale = 1,
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);

  // This effect resets the animation if the sprite itself changes
  useEffect(() => {
    setCurrentFrame(0);
  }, [spriteSheet, frameCount]);

  // This is the main animation loop effect
  useEffect(() => {
    // Don't start the animation if there are no frames to animate
    if (frameCount <= 1) return;

    const intervalId = setInterval(() => {
      // We use the direct value of currentFrame, not the updater function
      const nextFrame = (currentFrame + 1) % frameCount;

      // 1. First, update the child's state. This is a clean, single action.
      setCurrentFrame(nextFrame);

      // 2. THEN, as a separate step, check if the animation just finished.
      //    We check if the *new* frame is 0 and the animation isn't set to loop.
      if (nextFrame === 0 && !loop) {
        // Since this check is now outside of the state updater, it is safe to call onComplete.
        if (onComplete) {
          onComplete();
        }
      }
    }, 1000 / fps);

    // Cleanup: Stop the interval if the component unmounts or props change
    return () => clearInterval(intervalId);

    // We depend on `currentFrame` now to run the interval on each new frame
  }, [currentFrame, frameCount, fps, loop, onComplete, spriteSheet]);


  const style = {
    width: `calc(${frameWidth} * var(--unit-xs) * 0.35  * ${scale})`,
    height: `calc(${frameHeight} * var(--unit-xs) * 0.35 * ${scale})`,
    backgroundImage: `url(${spriteSheet})`,
    backgroundPosition: `0px calc(-${currentFrame * frameHeight} * var(--unit-xs) * 0.35 * ${scale})`,
    backgroundSize: `calc(${frameWidth} * var(--unit-xs) * 0.35 * ${scale}) calc(${frameHeight * frameCount} * var(--unit-xs) * 0.35 * ${scale})`,
    imageRendering: 'pixelated',
    position: 'absolute',
    bottom: 0,
    left: 0,
  };


  return <div className={className} style={style} />;
};

import { useSpriteAnimation } from '../../contexts/SpriteAnimationContext.jsx';

const SpriteDemo = ({ move = null, pack = null,height, scale: scaleTo, loop = true, backTo }) => {
  const { currentAnimation, setCurrentAnimation, currCharacter, setCurrCharacter, backToIdle } = useSpriteAnimation();

  const characterChosen = (pack != null && pack.length === 1) ? pack[0].title : currCharacter;
  const moveChosen = move || currentAnimation;
  // Get the current animation data from the animations object
  const { sprite, frameWidth, frameHeight, frames, fps } = pack?.filter(p => p.title === characterChosen)[0]?.pack?.[moveChosen] || {};
  if (!sprite) {
    console.warn(`No sprite found for character "${characterChosen}" and move "${moveChosen}"`);
    return null; // If no sprite is found, return null
  }
  // Get character properties with defaults
  let scale = pack?.filter(p => p.title === characterChosen)[0].scale || 1;
  if (scaleTo) {
    scale = scaleTo;
  }

  const allCharacters = pack?.map(p => p.title);

  return (
    <div className='flex flex-col justify-between h-full' style={{ gap: 'calc(1 * var(--unit))', padding: `calc(0.75 * var(--unit)) calc(0.5 * var(--unit))` }}>

      <div className={`relative ${height ? height:"h-8/12"}`}>
        {sprite && (
          <SpriteAnimation
            spriteSheet={sprite}
            frameWidth={frameWidth}
            frameHeight={frameHeight}
            frameCount={frames}
            fps={fps}
            scale={scale}
            className=""
            onComplete={loop ? () => { } : (backTo || backToIdle)}
            loop={loop}
          />
        )}
      </div>
      {/* Character Selection Buttons */}
      {(pack != null && pack.length > 1) && (
        <div className='flex flex-wrap justify-center' style={{ gap: 'calc(0.5 * var(--unit))', padding: 'calc(0.5 * var(--unit)) 0' }}>
          {allCharacters?.map(chars => (
            <button
              className={`rounded-lg transition-all duration-200 hover:scale-105 ${currCharacter === chars
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              style={{
                padding: 'calc(0.5 * var(--unit)) calc(0.7 * var(--unit))',
                fontSize: 'calc(1.5*var(--text-sm))',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              key={chars}
              onClick={() => {
                setCurrCharacter(chars);
                setCurrentAnimation('idle');
              }}
            >
              {chars}
            </button>

          ))}
        </div>
      )}
    </div>
  )
};

export default SpriteDemo;