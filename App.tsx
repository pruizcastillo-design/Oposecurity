import React, { useState } from 'react';
import { Confidence, Question, AppPhase, TestStats } from './types';
import ConfidenceSelector from './components/ConfidenceSelector';
import ResultsDashboard from './components/ResultsDashboard';
const OPTIONS = ['A', 'B', 'C', 'D'];

const App: React.FC = () => {
  const [phase, setPhase] = useState<AppPhase>('SETUP');
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [errorDivisor, setErrorDivisor] = useState<number>(4); 
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAbortModal, setShowAbortModal] = useState(false);

  const startTest = () => {
    const initialQuestions: Question[] = Array.from({ length: numQuestions }, (_, i) => ({
      id: i + 1,
      confidence: Confidence.NONE,
      initialSelections: [],
      finalSelection: null,
      correctAnswer: null,
    }));
    setQuestions(initialQuestions);
    setPhase('TESTING');
    setCurrentIndex(0);
    setShowAbortModal(false);
  };

  const handleAbortClick = () => setShowAbortModal(true);
  const confirmRestart = () => {
    setPhase('SETUP');
    setQuestions([]);
    setCurrentIndex(0);
    setShowAbortModal(false);
  };
  const continueTest = () => setShowAbortModal(false);

  const handleInitialSelection = (option: string) => {
    const q = questions[currentIndex];
    if (q.confidence === Confidence.NONE) return; 

    let newSelections = [...q.initialSelections];
    if (q.confidence === Confidence.GREEN) {
      newSelections = [option];
    } else if (q.confidence === Confidence.YELLOW) {
      if (newSelections.includes(option)) {
        newSelections = newSelections.filter(o => o !== option);
      } else if (newSelections.length < 2) {
        newSelections.push(option);
      }
    } else return;
    const updated = [...questions];
    updated[currentIndex].initialSelections = newSelections;
    setQuestions(updated);
  };

  const handleConfidenceChange = (c: Confidence) => {
    const updated = [...questions];
    updated[currentIndex].confidence = c;
    updated[currentIndex].initialSelections = []; 
    setQuestions(updated);
  };

  const nextQuestion = () => {
    if (isNextDisabled) return;
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setPhase('REFINEMENT');
      setCurrentIndex(0);
    }
  };

  const handleFinalSelection = (option: string | null) => {
    const updated = [...questions];
    updated[currentIndex].finalSelection = option;
    setQuestions(updated);
  };

  const finishRefinement = () => {
    const finalized = questions.map(q => ({
      ...q,
      finalSelection: q.confidence === Confidence.GREEN ? q.initialSelections[0] : q.finalSelection
    }));
    setQuestions(finalized);
    setPhase('CORRECTION');
    setCurrentIndex(0);
  };

  const handleCorrectAnswer = (option: string) => {
    const updated = [...questions];
    updated[currentIndex].correctAnswer = option;
    setQuestions(updated);
  };

  const calculateResults = (): TestStats => {
    let correct = 0, incorrect = 0, blank = 0, greenCorrectCount = 0;
    let greenTotal = 0, greenPreciseCorrect = 0, yellowTotal = 0, yellowPreciseCorrect = 0, redTotal = 0, redPreciseCorrect = 0;

    questions.forEach(q => {
      const isCorrect = q.finalSelection === q.correctAnswer && q.finalSelection !== null;
      const isBlank = q.finalSelection === null;
      if (isBlank) blank++; else if (isCorrect) correct++; else incorrect++;
      if (q.confidence === Confidence.GREEN && isCorrect) greenCorrectCount++;
      if (q.confidence === Confidence.GREEN) { greenTotal++; if (isCorrect) greenPreciseCorrect++; }
      else if (q.confidence === Confidence.YELLOW) { if (!isBlank) { yellowTotal++; if (isCorrect) yellowPreciseCorrect++; } }
      else if (q.confidence === Confidence.RED) { if (!isBlank) { redTotal++; if (isCorrect) redPreciseCorrect++; } }
    });

    const netScore = ((correct - (incorrect / errorDivisor)) * 10) / (questions.length || 1);
    const autofiabilidad = (greenCorrectCount / (questions.length || 1)) * 100;
    return {
      totalQuestions: questions.length, correct, incorrect, blank, netScore: Math.max(0, netScore), autofiabilidad,
      greenAccuracy: greenTotal > 0 ? (greenPreciseCorrect / greenTotal) * 100 : 0,
      yellowAccuracy: yellowTotal > 0 ? (yellowPreciseCorrect / yellowTotal) * 100 : 0,
      redAccuracy: redTotal > 0 ? (redPreciseCorrect / redTotal) * 100 : 0,
    };
  };

  const currentQ = questions[currentIndex];
  let isNextDisabled = true;
  if (currentQ) {
    if (currentQ.confidence === Confidence.GREEN) {
      isNextDisabled = currentQ.initialSelections.length !== 1;
    } else if (currentQ.confidence === Confidence.YELLOW) {
      isNextDisabled = currentQ.initialSelections.length !== 2;
    } else if (currentQ.confidence === Confidence.RED) {
      isNextDisabled = false; 
    } else {
      isNextDisabled = true; 
    }
  }

  // Cálculo de preguntas contestadas para la fase de refinamiento
  const answeredInRefinement = questions.filter(q => 
    q.confidence === Confidence.GREEN || q.finalSelection !== null
  ).length;

  return (
    <div className="h-[100dvh] relative flex flex-col max-w-xl mx-auto overflow-hidden font-sans selection:bg-orange-100">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1200" 
          className="w-full h-full object-cover opacity-60" 
          alt="Library background"
        />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-xl"></div>
      </div>

      <header className="relative z-10 p-2.5 flex justify-between items-center bg-white/60 border-b border-white/50 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-[0_3px_0_0_#9a3412]">
             <span className="text-white font-black text-lg italic leading-none">S</span>
          </div>
          <h1 className="text-lg font-black tracking-tighter text-orange-700 italic uppercase leading-none">OpoSecurity</h1>
        </div>
        {phase !== 'SETUP' && phase !== 'RESULTS' && (
          <button 
            onClick={handleAbortClick}
            className="text-[10px] font-black text-red-600 uppercase tracking-widest px-4 py-1.5 rounded-xl bg-white border-b-[3px] border-red-200 active:translate-y-0.5 active:border-b-0 transition-all shadow-sm"
          >
            Abortar
          </button>
        )}
      </header>

      <main className="relative z-10 flex-1 flex flex-col px-3 pt-2 pb-10 overflow-hidden">
        
        {phase === 'SETUP' && (
          <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-stone-100 text-center animate-in fade-in zoom-in-95 duration-500 my-auto mx-1 border-b-[8px] border-b-orange-100/50">
            <div className="mb-4 inline-flex p-4 bg-blue-50/50 rounded-[1.5rem] shadow-inner relative">
               <span className="text-4xl">🎯</span>
            </div>
            <h2 className="text-2xl font-black text-stone-800 mb-6 italic uppercase tracking-tighter">Preparación Test</h2>
            
            <div className="space-y-4 max-w-xs mx-auto text-left">
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Total de Preguntas</label>
                <input 
                  type="number" 
                  value={numQuestions} 
                  onChange={(e) => setNumQuestions(Math.max(1, Number(e.target.value)))}
                  className="w-full px-5 py-3 rounded-xl border-[2px] border-blue-500 bg-white focus:ring-4 focus:ring-blue-100 outline-none font-black text-stone-700 text-xl shadow-inner text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Divisor de Fallos</label>
                <input 
                  type="number" 
                  value={errorDivisor} 
                  onChange={(e) => setErrorDivisor(Math.max(1, Number(e.target.value)))}
                  className="w-full px-5 py-3 rounded-xl border-[2px] border-blue-500 bg-white focus:ring-4 focus:ring-blue-100 outline-none font-black text-stone-700 text-xl shadow-inner text-center"
                />
              </div>
              <button 
                onClick={startTest}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-black py-4 rounded-xl shadow-[0_8px_0_0_#9a3412] active:translate-y-1.5 active:shadow-none transition-all flex items-center justify-center gap-3 mt-4 text-lg uppercase tracking-widest"
              >
                Comenzar <span className="text-2xl">→</span>
              </button>
            </div>
          </div>
        )}

        {phase === 'TESTING' && (
          <div className="flex flex-col h-full overflow-hidden">
            <ConfidenceSelector selected={questions[currentIndex]?.confidence} onSelect={handleConfidenceChange} />
            
            <div className="bg-white p-3.5 rounded-[2rem] shadow-xl border border-white flex-1 flex flex-col overflow-hidden border-b-[6px] border-b-stone-100">
              <div className="flex flex-col items-center mb-2 shrink-0">
                <div className="bg-blue-600 text-white px-6 py-1.5 rounded-xl text-xl font-black italic border-b-[4px] border-blue-800 shadow-md">
                  Pregunta {questions[currentIndex].id} / {questions.length}
                </div>
                {questions[currentIndex].confidence === Confidence.NONE && (
                  <div className="mt-2 text-stone-400 text-[10px] font-black uppercase italic tracking-widest">
                    Selecciona un nivel para contestar
                  </div>
                )}
                {questions[currentIndex].confidence === Confidence.YELLOW && (
                  <div className="mt-2 p-2 bg-amber-400 text-white rounded-xl text-center w-full shadow-[0_3px_0_0_#92400e]">
                    <p className="text-[14px] font-black uppercase italic tracking-tight leading-none">⚠️ Marca 2 opciones obligatorias</p>
                  </div>
                )}
                {questions[currentIndex].confidence === Confidence.GREEN && (
                  <div className="mt-2 text-green-600 text-[10px] font-black uppercase italic tracking-widest">
                    Marca 1 opción segura
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-center gap-1.5 overflow-hidden py-1">
                {questions[currentIndex].confidence !== Confidence.RED && questions[currentIndex].confidence !== Confidence.NONE ? (
                  OPTIONS.map(opt => (
                    <button
                      key={opt} onClick={() => handleInitialSelection(opt)}
                      className={`py-2.5 rounded-xl border-2 font-black text-lg transition-all flex items-center gap-4 px-4 ${
                        questions[currentIndex].initialSelections.includes(opt)
                          ? 'bg-blue-600 text-white border-blue-800 shadow-[0_5px_0_0_#1e3a8a] -translate-y-1'
                          : 'bg-stone-50 text-stone-500 border-stone-200 border-b-[4px] shadow-sm active:translate-y-1 active:border-b-0'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xl shrink-0 ${questions[currentIndex].initialSelections.includes(opt) ? 'border-white/40 bg-white/20' : 'border-stone-200 bg-white shadow-inner'}`}>{opt}</span>
                      <span className="uppercase tracking-tight leading-none">Opción {opt}</span>
                    </button>
                  ))
                ) : questions[currentIndex].confidence === Confidence.RED ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-stone-50 rounded-[1.5rem] border-4 border-dashed border-stone-300">
                     <p className="text-stone-400 font-black uppercase text-base tracking-widest italic mb-2 leading-none">Nivel 1: Nula</p>
                     <p className="text-stone-300 text-xs font-bold italic leading-tight">En este nivel no se realiza ningún marcaje inicial.</p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-stone-50/50 rounded-[1.5rem] border-4 border-dashed border-stone-200 opacity-60">
                     <p className="text-stone-300 font-black uppercase text-xs tracking-[0.2em] italic leading-tight">Elige nivel de confianza arriba</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 mt-4 mb-2 shrink-0">
              <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} className="flex-1 py-3 rounded-xl font-black text-[10px] bg-white text-stone-400 uppercase border-b-[6px] border-stone-200 active:translate-y-0.5 active:border-b-0 shadow-md">Atrás</button>
              <button 
                onClick={nextQuestion} 
                disabled={isNextDisabled}
                className={`flex-[2.5] py-3 rounded-xl font-black text-xl uppercase transition-all tracking-widest leading-none ${
                  isNextDisabled 
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed opacity-50 border-b-4 border-stone-300' 
                  : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-[0_6px_0_0_#9a3412] active:translate-y-1 active:shadow-none'
                }`}
              >
                {currentIndex === questions.length - 1 ? 'REFINAR' : 'SIGUIENTE'}
              </button>
            </div>
          </div>
        )}

        {/* REFINEMENT PHASE */}
        {phase === 'REFINEMENT' && (
          <div className="flex flex-col h-full overflow-hidden">
             <div className="bg-stone-900 text-white p-2.5 rounded-xl mb-3 text-center shadow-lg border-b-[4px] border-black shrink-0">
                <h2 className="text-[11px] font-black italic uppercase tracking-[0.1em]">Fase 2: Consolidación</h2>
             </div>
             <div className="bg-white p-4 rounded-[2rem] shadow-xl border border-white flex-1 flex flex-col overflow-hidden border-b-[8px] border-b-orange-100/30">
                <div className="flex flex-col items-center mb-3 text-center shrink-0">
                   <div className="bg-orange-600 text-white px-8 py-1.5 rounded-xl text-xl font-black italic border-b-[5px] border-orange-800 shadow-md">
                     Pregunta {questions[currentIndex].id} / {questions.length}
                   </div>
                </div>
                <div className="flex-1 flex flex-col justify-center gap-2 overflow-hidden py-1">
                   {questions[currentIndex].confidence === Confidence.GREEN ? (
                      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-green-50/70 rounded-[2rem] border-4 border-green-200 border-dashed animate-in zoom-in duration-300">
                         <span className="text-5xl mb-4">🛡️</span>
                         <p className="text-green-800 font-black text-lg uppercase italic mb-3 leading-none">Asegurada</p>
                         <p className="text-green-600 font-black text-4xl bg-white px-10 py-5 rounded-[1.5rem] shadow-xl border-4 border-green-100 leading-none">MARCA: {questions[currentIndex].initialSelections[0]}</p>
                      </div>
                   ) : (
                      <>
                        {OPTIONS.map(opt => (
                          <button key={opt} onClick={() => handleFinalSelection(opt)} className={`py-2.5 rounded-xl border-2 font-black text-lg transition-all flex items-center gap-4 px-4 ${questions[currentIndex].finalSelection === opt ? 'bg-orange-600 text-white border-orange-800 shadow-[0_5px_0_0_#7c2d12] -translate-y-1' : questions[currentIndex].initialSelections.includes(opt) ? 'bg-amber-100 text-amber-800 border-amber-300 border-b-[5px] -translate-y-0.5 shadow-sm' : 'bg-stone-50 text-stone-400 border-stone-200 border-b-[5px] active:translate-y-1 active:border-b-0 shadow-sm'}`}>
                             <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xl shrink-0 ${questions[currentIndex].finalSelection === opt ? 'border-white/40 bg-white/20' : 'border-stone-200 bg-white'}`}>{opt}</span>
                             <span className="uppercase leading-none">Marcar {opt}</span>
                          </button>
                        ))}
                        <button onClick={() => handleFinalSelection(null)} className={`w-full py-3 mt-1 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] border-2 transition-all shadow-md ${questions[currentIndex].finalSelection === null ? 'bg-stone-800 text-white border-stone-900 border-b-[6px]' : 'bg-white text-stone-300 border-stone-200 border-b-[6px]'}`}>En Blanco</button>
                      </>
                   )}
                </div>

                {/* CONTADOR DE PROGRESO EN REFINAMIENTO */}
                <div className="mt-4 px-4 py-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl border border-orange-200 text-center shadow-inner shrink-0">
                  <p className="text-orange-800 font-black text-xs uppercase tracking-widest italic">
                    Respuestas contestadas: <span className="text-orange-600 text-lg">{answeredInRefinement}</span> <span className="text-orange-300">/</span> <span className="text-orange-400">{questions.length}</span>
                  </p>
                </div>
             </div>
             <div className="flex gap-3 mt-4 mb-2 shrink-0">
               <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} className="flex-1 py-3 rounded-xl font-black text-[10px] bg-white text-stone-400 uppercase border-b-[6px] border-stone-200 active:translate-y-0.5 active:border-b-0 shadow-md">Atrás</button>
               {currentIndex === questions.length - 1 ? (
                 <button onClick={finishRefinement} className="flex-[2.5] bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-black text-xl uppercase shadow-[0_6px_0_0_#9a3412] active:translate-y-1 active:shadow-none transition-all tracking-widest leading-none">TERMINAR</button>
               ) : (
                 <button onClick={() => setCurrentIndex(currentIndex + 1)} className="flex-[2.5] bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-black text-xl uppercase shadow-[0_6px_0_0_#9a3412] active:translate-y-1 active:shadow-none transition-all tracking-widest leading-none">SIGUIENTE</button>
               )}
             </div>
          </div>
        )}

        {phase === 'CORRECTION' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="bg-green-700 text-white p-2.5 rounded-xl mb-3 text-center shadow-lg border-b-[4px] border-green-900 shrink-0">
                <h2 className="text-[11px] font-black italic uppercase tracking-[0.1em]">Fase 3: Corrección</h2>
            </div>
            <div className="bg-white p-4 rounded-[2rem] shadow-xl border border-white flex-1 flex flex-col overflow-hidden border-b-[8px] border-b-green-100/30">
               <div className="flex flex-col items-center mb-3 text-center shrink-0">
                  <div className="bg-green-600 text-white px-8 py-1.5 rounded-xl text-xl font-black italic border-b-[5px] border-green-800 shadow-md">
                    Pregunta {questions[currentIndex].id} / {questions.length}
                  </div>
                  <div className="mt-2 text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none">Tu marca: <span className="text-orange-600 font-black">{questions[currentIndex].finalSelection || 'BLANCO'}</span></div>
               </div>
               <div className="flex-1 flex flex-col justify-center gap-2 overflow-hidden py-1">
                  {OPTIONS.map(opt => (
                     <button key={opt} onClick={() => handleCorrectAnswer(opt)} className={`py-2.5 rounded-xl border-2 font-black text-lg transition-all flex items-center gap-4 px-4 ${questions[currentIndex].correctAnswer === opt ? 'bg-green-600 text-white border-green-800 shadow-[0_5px_0_0_#14532d] -translate-y-1' : 'bg-stone-50 text-stone-500 border-stone-200 border-b-[6px] active:translate-y-1 active:border-b-0 shadow-sm'}`}>
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xl shrink-0 ${questions[currentIndex].correctAnswer === opt ? 'border-white/40 bg-white/20' : 'border-stone-200 bg-white shadow-inner'}`}>{opt}</span>
                        <span className="uppercase leading-none">Correcta {opt}</span>
                     </button>
                  ))}
               </div>
            </div>
            <div className="flex gap-3 mt-4 mb-2 shrink-0">
               <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} className="flex-1 py-3 rounded-xl font-black text-[10px] bg-white text-stone-400 uppercase border-b-[6px] border-stone-200 active:translate-y-0.5 active:border-b-0 shadow-md">Atrás</button>
               {currentIndex === questions.length - 1 ? (
                 <button onClick={() => setPhase('RESULTS')} className="flex-[2.5] bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-black text-xl uppercase shadow-[0_6px_0_0_#9a3412] active:translate-y-1 active:shadow-none transition-all tracking-widest leading-none">VER RESULTADOS</button>
               ) : (
                 <button onClick={() => setCurrentIndex(currentIndex + 1)} className="flex-[2.5] bg-stone-900 text-white py-3 rounded-xl font-black text-xl uppercase shadow-[0_8px_0_0_#000] active:translate-y-1 active:shadow-none transition-all tracking-widest leading-none">SIGUIENTE</button>
               )}
            </div>
          </div>
        )}

        {phase === 'RESULTS' && (
           <div className="h-full overflow-y-auto pr-1">
             <ResultsDashboard stats={calculateResults()} questions={questions} onReset={() => setPhase('SETUP')} />
           </div>
        )}

        {showAbortModal && (
          <div className="fixed inset-0 z-[100] bg-stone-900/85 backdrop-blur-lg flex items-center justify-center p-8 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-10 shadow-2xl text-center border-[6px] border-white animate-in zoom-in-95 duration-300">
              <div className="text-5xl mb-6">🚪</div>
              <h3 className="text-2xl font-black text-stone-800 mb-2 italic uppercase tracking-tighter">¿Cerrar Test?</h3>
              <p className="text-stone-500 text-xs font-bold mb-10 leading-relaxed uppercase tracking-widest">Perderás todos los datos del análisis actual.</p>
              <div className="space-y-4">
                <button onClick={confirmRestart} className="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-[0_6px_0_0_#7f1d1d] active:translate-y-1 active:shadow-none uppercase text-xs tracking-widest">SÍ, REINICIAR</button>
                <button onClick={continueTest} className="w-full bg-stone-100 text-stone-600 font-black py-4 rounded-xl border-b-[6px] border-stone-200 active:translate-y-1 active:border-b-0 uppercase text-xs tracking-widest">CANCELAR</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
