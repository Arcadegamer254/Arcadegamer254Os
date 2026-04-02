import React, { useState, useEffect } from 'react';
import { Wifi, Volume2, Cpu, HardDrive } from 'lucide-react';

export function Settings() {
  const [activeTab, setActiveTab] = useState('network');
  
  // Network State
  const [networks, setNetworks] = useState<any[]>([]);
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [netMsg, setNetMsg] = useState('');

  // Audio State
  const [volume, setVolume] = useState(50);
  const [muted, setMuted] = useState(false);

  // System State
  const [sysInfo, setSysInfo] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'network') fetchNetworks();
    if (activeTab === 'audio') fetchAudio();
    if (activeTab === 'system') fetchSystemInfo();
  }, [activeTab]);

  const fetchNetworks = async () => {
    try {
      const res = await fetch('/api/system/wifi');
      const data = await res.json();
      if (data.networks) setNetworks(data.networks);
    } catch (e) { console.error(e); }
  };

  const connectWifi = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    setNetMsg('Connecting...');
    try {
      const res = await fetch('/api/system/wifi/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ssid, password })
      });
      const data = await res.json();
      if (data.error) setNetMsg(`Error: ${data.error}`);
      else setNetMsg('Connected successfully!');
    } catch (e: any) {
      setNetMsg(`Error: ${e.message}`);
    }
    setConnecting(false);
  };

  const fetchAudio = async () => {
    try {
      const res = await fetch('/api/system/audio');
      const data = await res.json();
      if (data.volume !== undefined) {
        setVolume(data.volume);
        setMuted(data.muted);
      }
    } catch (e) { console.error(e); }
  };

  const updateVolume = async (val: number) => {
    setVolume(val);
    try {
      await fetch('/api/system/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume: val })
      });
    } catch (e) { console.error(e); }
  };

  const fetchSystemInfo = async () => {
    try {
      const res = await fetch('/api/system/info');
      const data = await res.json();
      setSysInfo(data);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 p-4 space-y-2">
        <button 
          onClick={() => setActiveTab('network')}
          className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${activeTab === 'network' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
        >
          <Wifi className="w-5 h-5" />
          <span>Network</span>
        </button>
        <button 
          onClick={() => setActiveTab('audio')}
          className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${activeTab === 'audio' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
        >
          <Volume2 className="w-5 h-5" />
          <span>Audio</span>
        </button>
        <button 
          onClick={() => setActiveTab('system')}
          className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${activeTab === 'system' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
        >
          <Cpu className="w-5 h-5" />
          <span>System Info</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 bg-gray-950 overflow-y-auto">
        {activeTab === 'network' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Wi-Fi Settings</h2>
            
            <form onSubmit={connectWifi} className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-8">
              <h3 className="text-lg font-semibold mb-4">Connect to Network</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">SSID</label>
                  <input 
                    type="text" 
                    value={ssid} 
                    onChange={e => setSsid(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Network Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Leave blank if open"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={connecting}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {connecting ? 'Connecting...' : 'Connect'}
                </button>
                {netMsg && <p className="text-sm text-gray-400 mt-2">{netMsg}</p>}
              </div>
            </form>

            <h3 className="text-lg font-semibold mb-4">Available Networks</h3>
            <div className="space-y-2">
              {networks.length === 0 ? <p className="text-gray-500">Scanning networks...</p> : networks.map((net, i) => (
                <div key={i} onClick={() => setSsid(net.ssid)} className="flex items-center justify-between bg-gray-900 p-4 rounded-lg border border-gray-800 cursor-pointer hover:border-gray-600 transition-colors">
                  <div>
                    <div className="font-medium">{net.ssid}</div>
                    <div className="text-xs text-gray-500">{net.security}</div>
                  </div>
                  <Wifi className={`w-5 h-5 ${net.signal > 70 ? 'text-green-400' : 'text-yellow-400'}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Audio Settings</h2>
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">Master Volume</span>
                <span className="text-gray-400">{volume}% {muted && '(Muted)'}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={volume}
                onChange={(e) => updateVolume(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">System Information</h2>
            {sysInfo ? (
              <div className="space-y-4">
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex items-start space-x-4">
                  <Cpu className="w-8 h-8 text-blue-500 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Processor</h3>
                    <p className="text-lg font-medium">{sysInfo.cpu}</p>
                  </div>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex items-start space-x-4">
                  <HardDrive className="w-8 h-8 text-green-500 mt-1" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Memory</h3>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{sysInfo.memTotal - sysInfo.memFree} MB Used</span>
                      <span>{sysInfo.memTotal} MB Total</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${((sysInfo.memTotal - sysInfo.memFree) / sysInfo.memTotal) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loading system info...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
