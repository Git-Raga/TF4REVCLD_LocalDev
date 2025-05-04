import React, { useEffect, useRef, useState } from 'react';

/**
 * Adds animation effects to task form components
 * @param {Object} props
 * @param {boolean} props.isAnimating - Whether animation should be triggered
 * @param {React.ReactNode} props.children - Child components to wrap with animation
 * @param {string} props.animationType - Type of animation to apply
 * @returns {React.ReactElement} Animated component
 */
const AnimatedContainer = ({ isAnimating, children, animationType = 'panelRotate' }) => {
  // State to control animation class
  const [animationClass, setAnimationClass] = useState('');
  
  // Track previous animation state
  const prevIsAnimatingRef = useRef(isAnimating);
  
  // Add stylesheet to document head once
  useEffect(() => {
    // Define animation styles
    const animationStyles = `
      @keyframes shrinkExpand {
        0% { transform: scale(1); }
        50% { transform: scale(0.3); }
        100% { transform: scale(1); }
      }

      @keyframes rotate360 {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes pulse {
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(0.9); }
        100% { opacity: 1; transform: scale(1); }
      }

      @keyframes flashyBounce {
        0% { transform: translateY(0) scale(1); background-color: transparent; }
        15% { transform: translateY(-20px) scale(0.95); background-color: rgba(59, 130, 246, 0.15); }
        30% { transform: translateY(0) scale(1.05); background-color: rgba(59, 130, 246, 0.1); }
        45% { transform: translateY(-15px) scale(0.97); background-color: rgba(59, 130, 246, 0.12); }
        60% { transform: translateY(0) scale(1.03); background-color: rgba(59, 130, 246, 0.08); }
        75% { transform: translateY(-8px) scale(0.99); background-color: rgba(59, 130, 246, 0.06); }
        90% { transform: translateY(0) scale(1.01); background-color: rgba(59, 130, 246, 0.03); }
        100% { transform: translateY(0) scale(1); background-color: transparent; }
      }

      @keyframes panelRotate {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(90deg); }
        50% { transform: rotate(180deg); }
        75% { transform: rotate(270deg); }
        100% { transform: rotate(360deg); }
      }

      .animate-shrink-expand {
        animation: shrinkExpand 1.5s ease-in-out;
      }

      .animate-rotate {
        animation: rotate360 3s ease-in-out;
      }

      .animate-pulse-custom {
        animation: pulse 2.5s ease-in-out;
      }
      
      .animate-flashy-bounce {
        animation: flashyBounce 3s ease-in-out;
        position: relative;
        z-index: 1;
      }

    .animate-panel-rotate {
  animation: panelRotate 1.5s linear infinite !important;
  position: relative;
  z-index: 1;
  transform-origin: center center;
}
    `;

    // Check if style element already exists
    const existingStyle = document.getElementById('animation-styles');
    if (!existingStyle) {
      const styleElement = document.createElement('style');
      styleElement.id = 'animation-styles';
      styleElement.innerHTML = animationStyles;
      document.head.appendChild(styleElement);
      
      // Cleanup when component unmounts
      return () => {
        const styleToRemove = document.getElementById('animation-styles');
        if (styleToRemove) {
          document.head.removeChild(styleToRemove);
        }
      };
    }
  }, []);
// Apply animation when isAnimating changes
useEffect(() => {
  // Map animation type to CSS class
  let className = '';
  switch (animationType) {
    case 'shrinkExpand':
      className = 'animate-shrink-expand';
      break;
    case 'rotate':
      className = 'animate-rotate';
      break;
    case 'pulse':
      className = 'animate-pulse-custom';
      break;
    case 'flashyBounce':
      className = 'animate-flashy-bounce';
      break;
    case 'panelRotate':
      className = 'animate-panel-rotate';
      break;
    default:
      className = 'animate-panel-rotate';
  }
  
  // Apply or remove animation based on isAnimating state
  if (isAnimating) {
    console.log("Animation started: " + animationType);
    setAnimationClass(className);
  } else {
    console.log("Animation stopped");
    setAnimationClass('');
  }
}, [isAnimating, animationType]);
  
  // Return the wrapped children with animation class
  return (
    <div className={animationClass}>
      {children}
    </div>
  );
};

export default AnimatedContainer;