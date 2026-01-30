
import React, { useRef, useState } from 'react';
import { Upload, Camera, FileVideo, Image as ImageIcon, Link as LinkIcon, Type as TypeIcon, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { FileData } from '../types';

interface FileUploadProps {
  onFileSelect: (file: FileData) => void;
  disabled?: boolean;
}

type TabType = 'upload' | 'link' | 'text';

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [url, setUrl] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      onFileSelect({
        base64,
        mimeType: file.type,
        previewUrl: URL.createObjectURL(file),
        fileName: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const isPlatformLink = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') || url.includes('twitter.com') || url.includes('x.com');
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || disabled || isFetching) return;

    if (isPlatformLink(url)) {
      onFileSelect({
        mimeType: 'video/link',
        previewUrl: url,
        fileName: 'Platform Video',
        isPlatformLink: true
      });
      setUrl('');
      return;
    }

    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch the resource.');
      const blob = await response.blob();
      if (!blob.type.startsWith('image/') && !blob.type.startsWith('video/')) {
        throw new Error('The URL does not point to a valid image or video file.');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        onFileSelect({
          base64,
          mimeType: blob.type,
          previewUrl: url,
          fileName: url.split('/').pop() || 'remote-content'
        });
        setIsFetching(false);
        setUrl('');
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      console.error(err);
      setError('Unable to fetch direct file. Attempting Metadata Analysis...');
      setTimeout(() => {
        onFileSelect({
          mimeType: 'text/url',
          previewUrl: url,
          fileName: 'Metadata Analysis',
          isPlatformLink: true
        });
        setIsFetching(false);
        setUrl('');
      }, 1500);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || disabled) return;
    
    onFileSelect({
      mimeType: 'text/plain',
      previewUrl: '',
      fileName: 'Text Claim',
      textContent: textInput
    });
    setTextInput('');
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (activeTab === 'upload' && e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl mb-6 shadow-inner">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'upload' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Media</span>
        </button>
        <button
          onClick={() => setActiveTab('link')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'link' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>Paste Link</span>
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'text' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <TypeIcon className="w-4 h-4" />
          <span>Check Text</span>
        </button>
      </div>

      <div className="min-h-[280px]">
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div 
            className={`relative group h-72 w-full rounded-3xl border-2 border-dashed transition-all duration-300 ${
              dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-white'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={onDrop}
            onClick={() => !disabled && !isFetching && inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" className="hidden" accept="image/*,video/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} disabled={disabled || isFetching} />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div className="mb-4 p-4 rounded-full bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Upload Image or Video</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-xs">Drag and drop files here to detect deepfakes and verify claims.</p>
              <div className="flex space-x-3">
                <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <ImageIcon className="w-3 h-3" /> <span>JPG/PNG</span>
                </div>
                <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <FileVideo className="w-3 h-3" /> <span>MP4/MOV</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Link Tab */}
        {activeTab === 'link' && (
          <form onSubmit={handleUrlSubmit} className="h-72 flex flex-col justify-center space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="text-center mb-2">
              <div className="inline-block p-3 rounded-full bg-indigo-50 text-indigo-600 mb-3">
                <LinkIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Verify a URL</h3>
              <p className="text-sm text-slate-500">Analyze YouTube videos or direct media links.</p>
            </div>
            
            <div className="relative group">
              <input 
                type="url"
                placeholder="https://youtube.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={disabled || isFetching}
                className="w-full pl-4 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all text-slate-800 placeholder:text-slate-400 font-medium"
              />
              <button 
                type="submit"
                disabled={!url || disabled || isFetching}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:bg-slate-400 flex items-center space-x-2"
              >
                {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Analyze</span>}
              </button>
            </div>
            
            {error && (
              <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>
        )}

        {/* Text Tab */}
        {activeTab === 'text' && (
          <form onSubmit={handleTextSubmit} className="h-72 flex flex-col bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-800 mb-1">Verify a Statement</h3>
              <p className="text-sm text-slate-500">Paste a claim, quote, or news headline to fact-check it.</p>
            </div>
            <textarea 
              placeholder="e.g., 'The Eiffel Tower was originally intended for Barcelona.'"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={disabled}
              className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all resize-none text-slate-800 placeholder:text-slate-400 font-medium mb-4"
            />
            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={!textInput.trim() || disabled}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:bg-slate-400 flex items-center space-x-2"
              >
                <span>Fact Check</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
