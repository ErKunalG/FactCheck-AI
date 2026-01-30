
import React, { useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import AnalysisResults from './components/AnalysisResults';
import { VerificationResult, AppState, FileData } from './types';
import { analyzeContent } from './geminiService';
import { Loader2, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('IDLE');
  const [file, setFile] = useState<FileData | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (fileData: FileData) => {
    setFile(fileData);
    setState('ANALYZING');
    setError(null);
    
    try {
      const verification = await analyzeContent(fileData);
      setResult(verification);
      setState('COMPLETED');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setState('ERROR');
    }
  };

  const reset = () => {
    setState('IDLE');
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="relative min-h-screen">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 -right-20 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {state === 'IDLE' && (
          <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
              Trust Nothing. <span className="text-indigo-600">Verify Everything.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-12">
              FactCheck AI uses Gemini 3.0 to verify claims, detect deepfakes, and validate sources across images, videos, and text in real-time.
            </p>
            <FileUpload onFileSelect={handleFileSelect} />
          </div>
        )}

        {state === 'ANALYZING' && (
          <div className="flex flex-col items-center justify-center py-24 space-y-8 animate-in fade-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin relative z-10" />
            </div>
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-slate-800">Processing Content...</h2>
              <div className="flex flex-col space-y-2 text-slate-500 font-medium">
                <span className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Scanning for anomalies...</span>
                </span>
                <span className="flex items-center justify-center space-x-2 opacity-60">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse delay-150"></span>
                  <span>Cross-referencing claims with Google Search...</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {state === 'COMPLETED' && result && file && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Analysis Result</h2>
                <p className="text-slate-500">Found {result.claims.length} claims and {result.groundingSources.length} verified sources.</p>
              </div>
              <button 
                onClick={reset}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Verify Another</span>
              </button>
            </div>
            
            <AnalysisResults 
              result={result} 
              filePreview={file.previewUrl} 
              mimeType={file.mimeType} 
              textContent={file.textContent}
            />
          </div>
        )}

        {state === 'ERROR' && (
          <div className="max-w-xl mx-auto py-12 text-center bg-white rounded-3xl p-8 border border-rose-200 shadow-xl shadow-rose-50 animate-in zoom-in duration-300">
            <div className="inline-block p-4 rounded-full bg-rose-50 text-rose-500 mb-6">
              <ShieldAlert className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Analysis Failed</h2>
            <p className="text-slate-600 mb-8">{error || "Something went wrong during the analysis."}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={reset}
                className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition"
              >
                Try Again
              </button>
              <button className="w-full sm:w-auto px-8 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition">
                Report Issue
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-slate-200 py-12 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition">Terms</a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition">Contact</a>
          </div>
          <p className="text-sm text-slate-400">
            &copy; 2024 FactCheck AI. Leveraging Gemini 3.0 Flash for content integrity.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
