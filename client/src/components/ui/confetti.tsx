import React, { useEffect, useState, useRef } from 'react';
import ReactConfetti from 'react-confetti';

interface ConfettiProps {
  duration?: number;
  intensity?: 'low' | 'medium' | 'high' | 'extreme';
}

export const Confetti: React.FC<ConfettiProps> = ({
  duration = 6000,
  intensity = 'high'
}) => {
  const [isClient, setIsClient] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isRunning, setIsRunning] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);

    // Get window dimensions
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Auto-stop after duration
    timeoutRef.current = setTimeout(() => {
      setIsRunning(false);
    }, duration);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [duration]);

  // Configuration based on intensity
  const getConfettiConfig = () => {
    switch (intensity) {
      case 'low':
        return {
          numberOfPieces: 100,
          gravity: 0.15,
          wind: 0.01,
          recycle: false,
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
        };
      case 'medium':
        return {
          numberOfPieces: 200,
          gravity: 0.12,
          wind: 0.02,
          recycle: false,
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
        };
      case 'high':
        return {
          numberOfPieces: 300,
          gravity: 0.1,
          wind: 0.03,
          recycle: true,
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9']
        };
      case 'extreme':
        return {
          numberOfPieces: 500,
          gravity: 0.08,
          wind: 0.05,
          recycle: true,
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F1948A', '#82E0AA', '#F8C471']
        };
      default:
        return {
          numberOfPieces: 300,
          gravity: 0.1,
          wind: 0.03,
          recycle: true,
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
        };
    }
  };

  const config = getConfettiConfig();

  if (!isClient || !isRunning) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Multiple confetti sources for more spectacular effect */}
      <ReactConfetti
        width={dimensions.width}
        height={dimensions.height}
        numberOfPieces={config.numberOfPieces}
        gravity={config.gravity}
        wind={config.wind}
        recycle={config.recycle}
        colors={config.colors}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50
        }}
      />

      {/* Secondary confetti from center */}
      <ReactConfetti
        width={dimensions.width}
        height={dimensions.height}
        numberOfPieces={Math.floor(config.numberOfPieces * 0.6)}
        gravity={config.gravity * 1.2}
        wind={-config.wind * 0.8}
        recycle={config.recycle}
        colors={config.colors}
        initialVelocityX={50}
        initialVelocityY={50}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 51
        }}
      />


    </div>
  );
};
