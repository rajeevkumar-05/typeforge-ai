import React from 'react';
import { TypingEngine } from '../components/typing/TypingEngine';

const TypingTest: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-8">
      <TypingEngine />
    </div>
  );
};

export default TypingTest;
