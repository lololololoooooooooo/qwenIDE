// src/components/FileTree.js
import { useState } from 'react';

export default function FileTree({ files, currentFile, onCreateFile, onDeleteFile, onSelectFile }) {
  const [newFileName, setNewFileName] = useState('');

  const handleCreate = () => {
    if (newFileName && !files[newFileName]) {
      onCreateFile(newFileName);
      setNewFileName('');
    }
  };

  return (
    <div className="border-r border-gray-700 bg-gray-900 text-white w-64 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">📁 Files</h3>
      <ul className="space-y-1">
        {Object.keys(files).map((filename) => (
          <li key={filename} className="flex items-center gap-2">
            <button
              onClick={() => onSelectFile(filename)}
              className={`flex-1 text-left px-2 py-1 rounded text-sm ${
                currentFile === filename ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              {filename}
            </button>
            <button
              onClick={() => onDeleteFile(filename)}
              className="text-red-400 hover:text-red-200 text-xs"
              disabled={Object.keys(files).length <= 1}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex gap-1">
        <input
          type="text"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          placeholder="new-file.py"
          className="flex-1 px-2 py-1 text-black text-sm rounded"
          onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
        />
        <button
          onClick={handleCreate}
          className="bg-green-600 hover:bg-green-700 px-2 py-1 text-xs rounded"
        >
          +
        </button>
      </div>
    </div>
  );
}
