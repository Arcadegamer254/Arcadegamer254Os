import React, { useState } from 'react';
import { Globe, Search, ArrowLeft, ArrowRight, RotateCw, Home, AlertTriangle } from 'lucide-react';
import { getEmbedUrl } from '../../utils/url';

export function ArcadeBrowser() {
  const [url, setUrl] = useState('https://www.wikipedia.org');
  const [inputUrl, setInputUrl] = useState('https://www.wikipedia.org');
  const [loading, setLoading] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = inputUrl;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    
    const embedUrl = getEmbedUrl(finalUrl);
    const isEmbed = embedUrl !== finalUrl;
    
    // Use our proxy to bypass X-Frame-Options for external sites, unless it's a native embed
    const proxiedUrl = isEmbed ? embedUrl : `/api/proxy?url=${encodeURIComponent(embedUrl)}`;
    
    setUrl(proxiedUrl);
    setInputUrl(finalUrl);
    setIframeError(false);
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-900">
      {/* Browser Chrome */}
      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 border-b border-gray-300">
        <div className="flex space-x-1">
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600">
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
            onClick={() => {
              setLoading(true);
              setIframeError(false);
              setTimeout(() => setLoading(false), 500);
            }}
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
            onClick={() => {
              setUrl('https://www.wikipedia.org');
              setInputUrl('https://www.wikipedia.org');
              setIframeError(false);
            }}
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleNavigate} className="flex-1 flex items-center bg-white border border-gray-300 rounded-full px-4 py-1.5 shadow-sm">
          <Globe className="w-4 h-4 text-gray-400 mr-2" />
          <input 
            type="text" 
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none text-sm"
            placeholder="Search or enter web address"
          />
        </form>
      </div>

      {/* Browser Content */}
      <div className="flex-1 bg-white relative">
        {loading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse z-10" />
        )}
        
        {iframeError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Connection Refused</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              This website does not allow itself to be embedded inside other applications (X-Frame-Options: DENY).
            </p>
          </div>
        ) : (
          <>
            {/* For Electron/Tauri desktop builds, swap this <iframe> for a <webview src={url} className="..." /> */}
            <iframe 
              src={url} 
              className="w-full h-full border-none"
              title="Arcade Browser"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              onLoad={() => setLoading(false)}
              onError={() => setIframeError(true)}
            />
          </>
        )}
      </div>
    </div>
  );
}
