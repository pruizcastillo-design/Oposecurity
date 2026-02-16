
import React from 'react';
import { Confidence } from '../types';

interface ConfidenceSelectorProps {
  selected: Confidence;
  onSelect: (c: Confidence) => void;
}

const ConfidenceSelector: React.FC<ConfidenceSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex gap-2 justify-center mb-3 px-1 shrink-0 w-full overflow-visible">
      {/* NIVEL 1 */}
      <button
        onClick={() => onSelect(Confidence.RED)}
        className={`py-3 px-1 rounded-2xl flex-1 border-2 transition-all flex flex-col items-center justify-center gap-1.5 min-w-0 ${
          selected === Confidence.RED 
            ? 'bg-red-500 text-white border-red-700 shadow-[0_6px_0_0_#7f1d1d] -translate-y-1' 
            : 'bg-white border-stone-200 border-b-[6px] opacity-100 active:translate-y-1 active:border-b-0 shadow-sm'
        }`}
      >
        <div className={`w-5 h-5 rounded-full border-2 shrink-0 ${selected === Confidence.RED ? 'bg-white' : 'bg-red-500'} shadow-sm`}></div>
        <div className="text-center w-full">
           <p className={`text-[8px] font-black uppercase tracking-tight leading-none mb-0.5 ${selected === Confidence.RED ? 'text-red-100' : 'text-red-700'}`}>Nivel 1</p>
           <p className={`text-[12px] font-black uppercase italic leading-none ${selected === Confidence.RED ? 'text-white' : 'text-red-600'}`}>Desconozco</p>
        </div>
      </button>

      {/* NIVEL 2 */}
      <button
        onClick={() => onSelect(Confidence.YELLOW)}
        className={`py-3 px-1 rounded-2xl flex-1 border-2 transition-all flex flex-col items-center justify-center gap-1.5 min-w-0 ${
          selected === Confidence.YELLOW 
            ? 'bg-amber-400 text-white border-amber-600 shadow-[0_6px_0_0_#92400e] -translate-y-1' 
            : 'bg-white border-stone-200 border-b-[6px] opacity-100 active:translate-y-1 active:border-b-0 shadow-sm'
        }`}
      >
        <div className={`w-5 h-5 rounded-full border-2 shrink-0 ${selected === Confidence.YELLOW ? 'bg-white' : 'bg-amber-400'} shadow-sm`}></div>
        <div className="text-center w-full">
           <p className={`text-[8px] font-black uppercase tracking-tight leading-none mb-0.5 ${selected === Confidence.YELLOW ? 'text-amber-100' : 'text-amber-700'}`}>Nivel 2</p>
           <p className={`text-[12px] font-black uppercase italic leading-none ${selected === Confidence.YELLOW ? 'text-white' : 'text-amber-600'}`}>Dudas entre 2</p>
        </div>
      </button>

      {/* NIVEL 3 */}
      <button
        onClick={() => onSelect(Confidence.GREEN)}
        className={`py-3 px-1 rounded-2xl flex-1 border-2 transition-all flex flex-col items-center justify-center gap-1.5 min-w-0 ${
          selected === Confidence.GREEN 
            ? 'bg-green-600 text-white border-green-800 shadow-[0_6px_0_0_#14532d] -translate-y-1' 
            : 'bg-white border-stone-200 border-b-[6px] opacity-100 active:translate-y-1 active:border-b-0 shadow-sm'
        }`}
      >
        <div className={`w-5 h-5 rounded-full border-2 shrink-0 ${selected === Confidence.GREEN ? 'bg-white' : 'bg-green-600'} shadow-sm`}></div>
        <div className="text-center w-full">
           <p className={`text-[8px] font-black uppercase tracking-tight leading-none mb-0.5 ${selected === Confidence.GREEN ? 'text-green-100' : 'text-green-800'}`}>Nivel 3</p>
           <p className={`text-[12px] font-black uppercase italic leading-none ${selected === Confidence.GREEN ? 'text-white' : 'text-green-700'}`}>Seguro</p>
        </div>
      </button>
    </div>
  );
};

export default ConfidenceSelector;
