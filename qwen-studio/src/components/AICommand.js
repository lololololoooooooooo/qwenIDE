// src/components/AICommand.js
import { useState } from 'react';

export default function AICommand({ onAsk }) {
  const [command, setCommand] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [logs, setLogs] = useState('');

  const handleSubmit = async () => {
    if (!command.trim()) return;

    setIsThinking(true);
    setLogs('🧠 Qwen is thinking...');
    setLogs(prev => prev + '\n> ' + command);

    try {
      const result = await onAsk(command);
      setLogs(prev => prev + '\n\n✅ ' + (result.logs || 'Done.'));
    } catch (err) {
      setLogs(prev => prev + '\n\n❌ ' + err.message);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="border-t border-gray-700 bg-gray-800 p-4">
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="e.g. @fix this or @create:app.js Add a button"
          className="flex-1 px-3 py-2 bg-gray-700 text-white text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isThinking}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button
          onClick={handleSubmit}
          disabled={isThinking}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded font-medium"
        >
          {isThinking ? '🤖...' : 'Ask Qwen'}
        </button>
      </div>

      {logs && (
        <div className="bg-black text-green-300 p-3 rounded text-sm font-mono h-32 overflow-y-auto">
          {logs}
        </div>
      )}
    </div>
  );
}
