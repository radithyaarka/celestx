import React from 'react';

export function CircularMeter({ score, label, customColor }) {
  const percentage = Math.round(score * 100);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score * circumference);

  // Default color logic if no customColor is provided
  const color = customColor || (
    score <= 0.15 ? '#10B981' : // Emerald
    score <= 0.50 ? '#0EA5E9' : // Sky
    score <= 0.75 ? '#F59E0B' : // Amber
    '#F43F5E'                   // Rose
  );

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-48 h-48 transform -rotate-90">
        <circle
          className="text-slate-100"
          strokeWidth="12"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="96"
          cy="96"
        />
        <circle
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx="96"
          cy="96"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-5xl font-black text-[#2D3436] tracking-tighter">
          {percentage}<span className="text-xl">%</span>
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          risk level
        </span>
      </div>
    </div>
  );
}