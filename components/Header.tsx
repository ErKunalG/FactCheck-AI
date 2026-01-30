
import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            FactCheck AI
          </span>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">How it works</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">Authenticity Specs</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">API Documentation</a>
        </nav>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-slate-500 hover:text-indigo-600 transition">
            <Info className="w-5 h-5" />
          </button>
          <button className="hidden sm:block px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-full hover:bg-slate-800 transition shadow-sm">
            Sign In
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
