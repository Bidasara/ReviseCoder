import { useState, useEffect,useRef } from 'react';

const BreakAnimation = ({
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
    width: `calc(${frameWidth} * var(--unit-xs) * 1.5  * ${scale})`,
    height: `calc(${frameHeight} * var(--unit-xs) * 1.5 * ${scale})`,
    backgroundImage: `url(${spriteSheet})`,
    backgroundPosition: `0px calc(-${currentFrame * frameHeight} * var(--unit-xs) * 1.5 * ${scale})`,
    backgroundSize: `calc(${frameWidth} * var(--unit-xs) * 1.5 * ${scale}) calc(${frameHeight * frameCount} * var(--unit-xs) * 1.5 * ${scale})`,
    imageRendering: 'pixelated',
    position: 'absolute',
    bottom: 0,
    left: 0,
  };


  return <div className={className} style={style} />;
};

// Usage example component
const BreakDemo = ({ pack }) => {
    const { sprite, frameWidth, frameHeight, frames, fps } = pack.pack.break || {};
    if (!sprite) return null;
    const parentRef = useRef(null);
    return (
        <div style={{borderRadius: 'calc(1 * var(--unit))', width: '100%', height: '100%' }}>
            <BreakAnimation
                delay={pack.pack.break.delay}
                spriteSheet={sprite}
                frameWidth={frameWidth}
                frameHeight={frameHeight}
                frameCount={frames}
                fps={fps}
                parentRef={parentRef}
            />
        </div>
    );
};


export default BreakDemo;