import React, { useState, useRef, useEffect } from 'react';

export function Terminal() {
  const [history, setHistory] = useState<{ type: 'input' | 'output', text: string }[]>([
    { type: 'output', text: 'Welcome to Arcadegamer254 OS Terminal' },
    { type: 'output', text: 'Type "help" for a list of available commands.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim();
    setInput('');
    setHistory(prev => [...prev, { type: 'input', text: `[arcadegamer254@os ~]$ ${cmd}` }]);

    if (cmd === 'clear') {
      setHistory([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/system/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
      const data = await res.json();
      setHistory(prev => [...prev, { type: 'output', text: data.output || '' }]);
    } catch (err: any) {
      setHistory(prev => [...prev, { type: 'output', text: `Error: ${err.message}` }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-green-400 font-mono text-sm p-4 overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
        {history.map((line, i) => (
          <div key={i} className={`whitespace-pre-wrap ${line.type === 'input' ? 'text-white font-bold' : 'text-gray-300'}`}>
            {line.text}
          </div>
        ))}
        {loading && <div className="text-gray-500">Executing...</div>}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleCommand} className="flex items-center mt-2">
        <span className="text-white font-bold mr-2">[arcadegamer254@os ~]$</span>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none text-green-400"
          autoFocus
          disabled={loading}
          spellCheck={false}
          autoComplete="off"
        />
      </form>
    </div>
  );
}
