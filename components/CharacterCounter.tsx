import React from 'react';

interface CharacterCounterProps {
  count: number;
  maxLength: number;
}

const CharacterCounter: React.FC<CharacterCounterProps> = ({ count, maxLength }) => {
  const warningThreshold = maxLength * 0.8;

  const colorClass =
    count > maxLength
      ? 'text-red-500'
      : count > warningThreshold
      ? 'text-yellow-400'
      : 'text-gray-500';

  return (
    <span className={`text-xs font-mono transition-colors ${colorClass}`}>
      {count}/{maxLength}
    </span>
  );
};

export default CharacterCounter;
