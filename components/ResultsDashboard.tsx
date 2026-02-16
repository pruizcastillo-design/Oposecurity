
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, PieChart, Pie, Sector } from 'recharts';
import { TestStats, Question, Confidence } from '../types';

interface ResultsDashboardProps { 
  stats: TestStats; 
  questions: Question[]; 
  onReset: () => void;
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} style={{ fontWeight: 900, fontSize: '13px' }}>{payload.name}</text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 5} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ stats, questions, onReset }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const confidenceData = [
    { name: 'N3', value: parseFloat(stats.greenAccuracy.toFixed(1)) },
    { name: 'N2', value: parseFloat(stats.yellowAccuracy.toFixed(1)) },
    { name: 'N1', value: parseFloat(stats.redAccuracy.toFixed(1)) },
  ];

  const pieData = [
    { name: 'Aciertos', value: stats.correct, color: '#16a34a' },
    { name: 'Fallos', value: stats.incorrect, color: '#dc2626' },
    { name: 'Blancos', value: stats.blank, color: '#a8a29e' },
  ];

  const blankPercentage = (stats.blank / stats.totalQuestions) * 100;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Resumen Principal 3D */}
      <div className="bg-white p-7 rounded-[3rem] shadow-xl border border-white border-b-8 border-b-orange-50">
        <h2 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-3 italic uppercase tracking-tighter">
          <span className="w-2 h-7 bg-orange-500 rounded-full"></span> Análisis Estratégico
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-[2.2rem] text-white text-center shadow-[0_8px_0_0_#9a3412]">
            <p className="text-[10px] font-black uppercase mb-1 opacity-90 tracking-widest leading-none">Nota Final</p>
            <p className="text-5xl font-black leading-none">{stats.netScore.toFixed(2)}</p>
          </div>
          <div className="p-6 bg-blue-50 rounded-[2.2rem] border-2 border-blue-200 text-center flex flex-col justify-center shadow-[0_8px_0_0_#1e3a8a]">
            <p className="text-blue-700 text-[10px] font-black uppercase mb-1 tracking-widest leading-none">Auto-Confianza</p>
            <p className="text-4xl font-black text-blue-900 leading-none">{stats.autofiabilidad.toFixed(1)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="p-2.5 bg-green-50 rounded-2xl border-b-[6px] border-green-200 text-center shadow-sm flex flex-col justify-center min-h-[90px]">
             <p className="text-[7.5px] font-black text-green-700 uppercase mb-1.5 leading-tight tracking-tight h-6 flex items-center justify-center">Efectividad Seguras</p>
             <p className="text-2xl font-black text-green-600 leading-none">{stats.greenAccuracy.toFixed(0)}%</p>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-2xl border-b-[6px] border-amber-200 text-center shadow-sm flex flex-col justify-center min-h-[90px]">
             <p className="text-[7.5px] font-black text-amber-700 uppercase mb-1.5 leading-tight tracking-tight h-6 flex items-center justify-center">Efectividad Dudas entre 2</p>
             <p className="text-2xl font-black text-amber-600 leading-none">{stats.yellowAccuracy.toFixed(0)}%</p>
          </div>
          <div className="p-2.5 bg-stone-100 rounded-2xl border-b-[6px] border-stone-200 text-center shadow-sm flex flex-col justify-center min-h-[90px]">
             <p className="text-[7.5px] font-black text-stone-700 uppercase mb-1.5 leading-tight tracking-tight h-6 flex items-center justify-center">No Contestadas</p>
             <p className="text-2xl font-black text-stone-600 leading-none">{blankPercentage.toFixed(0)}%</p>
          </div>
        </div>

        <button 
          onClick={onReset}
          className="w-full mt-4 py-4.5 bg-stone-900 text-white font-black rounded-2xl shadow-[0_6px_0_0_#000] active:translate-y-1 active:shadow-none uppercase text-xs tracking-[0.25em] transition-all"
        >
          Nuevo Examen
        </button>
      </div>

      {/* Gráficos Visuales */}
      <div className="grid grid-cols-1 gap-7">
        <div className="bg-white p-7 rounded-[3rem] shadow-xl border border-white h-72 border-b-8 border-b-stone-50">
           <h3 className="text-[10px] font-black text-stone-400 uppercase italic mb-6 text-center tracking-[0.2em]">Rendimiento por Escala</h3>
           <ResponsiveContainer width="100%" height="85%">
              <BarChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a8a29e', fontSize: 11, fontWeight: 900}} />
                <YAxis unit="%" domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#a8a29e', fontSize: 11, fontWeight: 700}} />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={40}>
                  {confidenceData.map((e, i) => (<Cell key={i} fill={i === 0 ? '#16a34a' : i === 1 ? '#f59e0b' : '#dc2626'} />))}
                </Bar>
              </BarChart>
           </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-7 rounded-[3rem] shadow-xl border border-white h-72 border-b-8 border-b-stone-50">
           <h3 className="text-[10px] font-black text-stone-400 uppercase italic mb-2 text-center tracking-[0.2em]">Distribución Definitiva</h3>
           <ResponsiveContainer width="100%" height="95%">
              <PieChart>
                <Pie activeIndex={activeIndex} activeShape={renderActiveShape} data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={8} dataKey="value" onMouseEnter={(_, i) => setActiveIndex(i)}>
                  {pieData.map((e, i) => (<Cell key={i} fill={e.color} stroke="none" />))}
                </Pie>
              </PieChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* Mapa Táctico Mejorado */}
      <div className="bg-white p-7 rounded-[3rem] shadow-xl border border-white mb-10 border-b-8 border-b-stone-50">
        <h3 className="text-xs font-black text-stone-400 uppercase italic mb-6 tracking-[0.2em]">Relación de Fallos y Confianza</h3>
        <div className="grid grid-cols-5 gap-3">
          {questions.map((q) => (
            <button 
              key={q.id} 
              onClick={() => setSelectedQuestion(selectedQuestion?.id === q.id ? null : q)} 
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all relative ${
                q.finalSelection === null 
                ? 'bg-stone-50 border-stone-200 border-b-4' 
                : q.finalSelection === q.correctAnswer 
                  ? 'bg-green-50 border-green-300 border-b-4' 
                  : 'bg-red-50 border-red-300 border-b-4'
              } ${selectedQuestion?.id === q.id ? 'translate-y-[-5px] ring-4 ring-orange-200 z-10 shadow-lg' : ''} ${
                q.confidence === Confidence.YELLOW ? 'ring-2 ring-amber-100 ring-offset-1' : ''
              }`}
            >
              <span className="text-[10px] font-black">{q.id}</span>
              <span className={`text-[15px] font-black mt-0.5 ${
                q.confidence === Confidence.GREEN ? 'text-green-600' : 
                q.confidence === Confidence.YELLOW ? 'text-amber-500' : 'text-red-500'
              }`}>
                {q.confidence === Confidence.GREEN ? '●' : q.confidence === Confidence.YELLOW ? '◑' : '○'}
              </span>
              {q.confidence === Confidence.YELLOW && (
                <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-amber-400 rounded-full translate-x-1/3 -translate-y-1/3 shadow-sm"></div>
              )}
            </button>
          ))}
        </div>

        {selectedQuestion && (
          <div className="mt-8 p-7 bg-stone-900 text-white rounded-[2.5rem] animate-in slide-in-from-bottom duration-300 relative shadow-2xl border-b-8 border-black">
             <button onClick={() => setSelectedQuestion(null)} className="absolute top-6 right-6 text-stone-500 hover:text-white transition-colors text-xl">✕</button>
             <h4 className="font-black italic text-2xl uppercase mb-6 tracking-tighter">Pregunta {selectedQuestion.id} / {questions.length}</h4>
             
             <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                   <p className="text-stone-500 uppercase font-bold mb-1 tracking-widest leading-none">Nivel Confianza</p>
                   <p className={`font-black uppercase italic text-lg ${
                     selectedQuestion.confidence === Confidence.GREEN ? 'text-green-400' : 
                     selectedQuestion.confidence === Confidence.YELLOW ? 'text-amber-400' : 'text-red-400'
                   }`}>{selectedQuestion.confidence}</p>
                </div>
                
                <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                   <p className="text-stone-500 uppercase font-bold mb-1 tracking-widest leading-none">Tu Marca Final</p>
                   <p className={`font-black uppercase italic text-lg ${selectedQuestion.finalSelection === selectedQuestion.correctAnswer ? 'text-green-400' : 'text-red-400'}`}>{selectedQuestion.finalSelection || 'BLANCO'}</p>
                </div>

                {/* NUEVA SECCIÓN PARA DUDAS INICIALES */}
                {selectedQuestion.confidence === Confidence.YELLOW && (
                  <div className="col-span-2 bg-amber-950/40 p-5 rounded-2xl border border-amber-500/20">
                    <p className="text-amber-500 uppercase font-black mb-2 tracking-[0.2em] leading-none text-[9px]">Opciones Consideradas</p>
                    <div className="flex gap-4">
                      {selectedQuestion.initialSelections.map(opt => (
                        <div key={opt} className={`flex-1 py-2 rounded-xl text-center font-black text-xl border-2 ${
                          opt === selectedQuestion.correctAnswer 
                          ? 'bg-green-500/20 border-green-500 text-green-400' 
                          : 'bg-white/5 border-white/10 text-stone-400'
                        }`}>
                          {opt}
                        </div>
                      ))}
                    </div>
                    {selectedQuestion.initialSelections.includes(selectedQuestion.correctAnswer || '') ? (
                      <p className="text-green-500/70 text-[10px] font-bold italic mt-3 text-center">✨ ¡La correcta estaba entre tus dudas!</p>
                    ) : (
                      <p className="text-red-400/70 text-[10px] font-bold italic mt-3 text-center">❌ Ninguna de tus dudas era la correcta.</p>
                    )}
                  </div>
                )}

                <div className="col-span-2 p-5 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl text-center font-black text-lg uppercase tracking-[0.3em] shadow-[0_6px_0_0_#9a3412] mt-2">
                  OFICIAL: {selectedQuestion.correctAnswer}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDashboard;
