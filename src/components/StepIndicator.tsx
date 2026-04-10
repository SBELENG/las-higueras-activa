'use client';

import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export default function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 w-full mt-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => (
        <React.Fragment key={i}>
          <div 
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= currentStep ? 'bg-[#2ECC71]' : 'bg-white/10'
            }`}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
