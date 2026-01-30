
import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  ExternalLink, 
  Fingerprint,
  Search,
  Globe,
  Youtube,
  ChevronDown,
  ChevronUp,
  Clock,
  Quote,
  Type
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { VerificationResult, Claim } from '../types';

interface AnalysisResultsProps {
  result: VerificationResult;
  filePreview: string;
  mimeType: string;
  textContent?: string;
}

const ClaimItem: React.FC<{ claim: Claim }> = ({ claim }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusIcon = (status: Claim['status']) => {
    switch (status) {
      case 'Correct': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'Wrong': return <XCircle className="w-4 h-4 text-rose-500" />;
      default: return <HelpCircle className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusBg = (status: Claim['status']) => {
    switch (status) {
      case 'Correct': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Wrong': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-slate-300 transition-all shadow-sm">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className={`p-1.5 rounded-lg border ${getStatusBg(claim.status)}`}>
            {getStatusIcon(claim.status)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-800 truncate pr-4">
              {claim.statement}
            </h4>
            <div className="flex items-center space-x-3 mt-1">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${getStatusBg(claim.status)}`}>
                {claim.status}
              </span>
              {claim.timestamp !== 'N/A' && (
                <div className="flex items-center text-[10px] text-slate-400 font-medium space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{claim.timestamp}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Original Content</label>
              <div className="flex items-start space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <Quote className="w-4 h-4 text-slate-300 mt-0.5" />
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  {claim.originalSentence}
                </p>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Verification Detail</label>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {claim.explanation}
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${claim.confidence}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 min-w-[30px]">{claim.confidence}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, filePreview, mimeType, textContent }) => {
  const isImage = mimeType.startsWith('image/');
  const isText = mimeType === 'text/plain';
  const isYoutube = filePreview?.includes('youtube.com') || filePreview?.includes('youtu.be');
  const aiScore = result.aiDetection.likelihood;
  
  const chartData = [
    { name: 'AI Gen', score: aiScore },
    { name: 'Human', score: 100 - aiScore }
  ];

  const getYoutubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('v=')) videoId = url.split('v=')[1]?.split('&')[0];
    else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Left Column: Visuals & AI Score */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner flex items-center justify-center mb-6 relative">
            {isText ? (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 p-8 flex flex-col items-center justify-center text-center">
                <Quote className="w-8 h-8 text-white/20 mb-4 absolute top-4 left-4" />
                <p className="text-white text-lg md:text-xl font-medium line-clamp-5 leading-relaxed font-serif italic">
                  "{textContent}"
                </p>
                <div className="mt-4 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
                   <Type className="w-3 h-3" />
                   <span>Text Analysis</span>
                </div>
              </div>
            ) : isYoutube ? (
              <iframe 
                className="w-full h-full"
                src={getYoutubeEmbedUrl(filePreview)}
                title="YouTube Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : isImage ? (
              <img src={filePreview} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <video src={filePreview} controls className="w-full h-full object-contain" />
            )}
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-800 tracking-tight">
                  {isText ? 'Authenticity / Bias' : 'Authenticity Baseline'}
                </span>
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${
                aiScore > 70 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {aiScore > 70 ? 'Likely AI / Fake' : aiScore > 30 ? 'Suspicious' : 'Authentic'}
              </span>
            </div>

            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: -20, right: 30, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                  <Bar dataKey="score" radius={[0, 10, 10, 0]} barSize={14}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? (aiScore > 50 ? '#f43f5e' : '#6366f1') : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Reasoning</h5>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {result.aiDetection.reasoning}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {result.aiDetection.indicators.map((ind, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Fact-Checking */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                <Search className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-800 tracking-tight">Verified Claims & Context</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {result.claims.length} Findings
            </span>
          </div>

          <div className="space-y-3">
            {result.claims.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <HelpCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No claims detected</p>
              </div>
            ) : (
              result.claims.map((claim) => (
                <ClaimItem key={claim.id} claim={claim} />
              ))
            )}
          </div>
        </div>

        {/* Citations Grid */}
        {result.groundingSources.length > 0 && (
          <div className="bg-slate-900 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-slate-200 tracking-tight">Knowledge Grounding</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.groundingSources.map((source, i) => (
                <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-500 transition-all group">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-[10px] font-bold text-slate-200 truncate mb-0.5">{source.title}</p>
                    <p className="text-[9px] text-slate-500 truncate font-mono tracking-tighter">{source.uri}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;
