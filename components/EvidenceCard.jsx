import React from 'react';

const EvidenceCard = ({ data, timestamp, id }) => {
  if (!data) return null;

  const isDeepfake = data.integrityScore <= 40;
  const isSuspicious = data.integrityScore > 40 && data.integrityScore < 90;
  
  const theme = isDeepfake 
    ? { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.05)', border: 'rgba(239, 68, 68, 0.2)' }
    : isSuspicious 
      ? { color: '#facc15', bg: 'rgba(250, 204, 21, 0.05)', border: 'rgba(250, 204, 21, 0.2)' }
      : { color: '#10b981', bg: 'rgba(16, 185, 129, 0.05)', border: 'rgba(16, 185, 129, 0.2)' };

  return (
    <div 
      id={id}
      className="w-[800px] bg-[#0a0a0c] text-white p-12 font-sans relative overflow-hidden border border-white/10"
      style={{ minHeight: '1100px' }}
    >
      {/* Background forensic grid decoration */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ 
        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-start mb-12 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-1">सचAI</h1>
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-violet-400">Neural Forensics Unit — Official Report</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono uppercase opacity-40">Ref ID: SA-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          <p className="text-[10px] font-mono uppercase opacity-40">Issued: {timestamp || new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Verdict Hero */}
      <div className="relative z-10 mb-12">
        <div className="inline-block px-4 py-1 rounded-full border border-white/10 bg-white/5 mb-4">
          <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Authentication Status</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex-1">
            <h2 className="text-7xl font-black uppercase tracking-tighter mb-2" style={{ color: theme.color }}>
              {data.verdict}
            </h2>
            <p className="text-lg opacity-80 max-w-md leading-relaxed">
              {data.summary}
            </p>
          </div>
          <div className="shrink-0 w-32 h-32 rounded-full border-4 flex items-center justify-center" style={{ borderColor: theme.color, boxShadow: `0 0 40px ${theme.color}20` }}>
            <div className="text-center">
              <span className="block text-4xl font-black" style={{ color: theme.color }}>{data.integrityScore}%</span>
              <span className="text-[8px] font-bold uppercase tracking-tighter opacity-40">Integrity</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Details Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-8 mb-12">
        <div className="space-y-6">
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-4">Origin Analysis</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-bold uppercase opacity-30 mb-1">Probable Origin</p>
                <p className="text-sm font-semibold">{data.probableOrigin || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase opacity-30 mb-1">Circulation Channels</p>
                <p className="text-sm font-semibold">{data.circulationChannels?.join(', ') || 'Undetermined'}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-4">Content Intelligence</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-bold uppercase opacity-30 mb-1">Theme</p>
                <p className="text-sm font-semibold">{data.contentTheme || 'General'}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase opacity-30 mb-1">OSINT Confidence</p>
                <p className="text-sm font-semibold uppercase tracking-tighter" style={{ color: theme.color }}>{data.osintConfidence || 'Pending'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-4">Detected Anomalies</h3>
          <div className="space-y-4 max-h-[300px] overflow-hidden">
            {data.anomalies && data.anomalies.length > 0 ? data.anomalies.map((a, i) => (
              <div key={i} className="flex gap-3 items-start border-l-2 pl-3" style={{ borderLeftColor: a.severity === 'High' ? '#ef4444' : '#facc15' }}>
                <div>
                  <p className="text-[11px] font-bold leading-tight mb-1">{a.description}</p>
                  <p className="text-[8px] font-mono opacity-40">TIMESTAMP: {a.timestamp}s | SEVERITY: {a.severity}</p>
                </div>
              </div>
            )) : (
              <p className="text-[11px] opacity-40 italic">No significant anomalies detected in neural sweep.</p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Technical Analysis */}
      <div className="relative z-10 p-8 bg-white/[0.02] border border-white/5 rounded-3xl mb-12">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-4">Technically Findings</h3>
        <p className="text-sm font-light leading-relaxed text-zinc-300">
          {data.explanation}
        </p>
      </div>

      {/* Safety Recommendation */}
      <div className="relative z-10 p-6 rounded-2xl border" style={{ borderColor: theme.border, backgroundColor: theme.bg }}>
        <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: theme.color }}>System Recommendation</p>
        <p className="text-sm font-medium italic">"{data.safetyRecommendation}"</p>
      </div>

      {/* Footer / QR / Signatures */}
      <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end border-t border-white/10 pt-8">
        <div className="opacity-30">
          <p className="text-[8px] font-mono leading-tight uppercase">
            Sach-AI Neural Forensics Engine v4.2<br />
            Deep Learning Model: Gemini-Pro-Vision<br />
            © 2026 Sach-AI Protective Systems
          </p>
        </div>
        
        {/* Decorative Fake QR Area */}
        <div className="flex gap-6 items-center">
          <div className="text-right">
             <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1">Verify Authenticity</p>
             <p className="text-[7px] font-mono opacity-40 uppercase">Scan to view live blockchain log</p>
          </div>
          <div className="w-16 h-16 bg-white p-1 rounded-sm">
            <div className="w-full h-full bg-black flex items-center justify-center text-[10px] font-black text-white">QR</div>
          </div>
        </div>
      </div>

      {/* Official Forensic Seal (CSS design) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border-[20px] border-white/[0.02] rounded-full pointer-events-none flex items-center justify-center">
         <span className="text-white/[0.02] text-8xl font-black rotate-[-35deg] uppercase tracking-[0.5em]">Verified</span>
      </div>
    </div>
  );
};

export default EvidenceCard;
