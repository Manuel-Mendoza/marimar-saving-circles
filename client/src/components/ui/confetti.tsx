import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

interface ConfettiProps {
  width?: number;
  height?: number;
  recycle?: boolean;
  numberOfPieces?: number;
  run?: boolean;
}

export const Confetti: React.FC<ConfettiProps> = ({
  width = 400,
  height = 300,
  recycle = false,
  numberOfPieces = 50,
  run = true
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <ReactConfetti
        width={width}
        height={height}
        recycle={recycle}
        numberOfPieces={run ? numberOfPieces : 0}
        run={run}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
    </div>
  );
};
