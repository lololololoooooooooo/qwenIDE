import { useState, useEffect } from 'react';

export default function GitPanel({ files, currentFile }) {
  const [stagedFiles, setStagedFiles] = useState([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [gitStatus, setGitStatus] = useState('No changes');

  // Simulate git status
  useEffect(() => {
    // In a real app, this would check actual file diffs
    const modified = Object.keys(files).filter(file => 
      files[file] !== localStorage.getItem(`git:${file}`) || !localStorage.getItem(`git:${file}`)
    );
    
    setGitStatus(modified.length > 0 
      ? `${modified.length} file${modified.length > 1 ? 's' : ''} modified` 
      : 'Working tree clean');
  }, [files]);

  const stageFile = (file) => {
    if (!stagedFiles.includes(file)) {
      setStagedFiles([...stagedFiles, file]);
      // In real app: save current version for diff
      localStorage.setItem(`git:${file}:staged`, files[file]);
    }
  };

  const unstageFile = (file) => {
    setStagedFiles(stagedFiles.filter(f => f !== file));
  };

  const commit = () => {
    if (!commitMessage.trim() || stagedFiles.length === 0) return;
    
    // Save current state as "committed"
    stagedFiles.forEach(file => {
      localStorage.setItem(`git:${file}`, files[file]);
    });
    
    setStagedFiles([]);
    setCommitMessage('');
    setGitStatus('Working tree clean');
  };

  return (
    <div className="border-t border-gray-700 bg-gray-800 p-4 h-48">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Source Control</h3>
        <span className="text-xs bg-gray-700 px-2 py-1 rounded">{gitStatus}</span>
      </div>
      
      <div className="flex h-full">
        <div className="w-1/2 pr-2">
          <h4 className="text-sm font-medium mb-2 flex justify-between">
            Changes
            <span className="bg-blue-900 text-blue-200 text-xs px-1.5 rounded">
              {Object.keys(files).filter(file => 
                files[file] !== localStorage.getItem(`git:${file}`) || !localStorage.getItem(`git:${file}`)
              ).length}
            </span>
          </h4>
          <ul className="text-sm overflow-y-auto h-28">
            {Object.keys(files).map(file => {
              const isModified = files[file] !== localStorage.getItem(`git:${file}`) || !localStorage.getItem(`git:${file}`);
              if (!isModified) return null;
              
              return (
                <li key={file} className="flex items-center p-1 hover:bg-gray-700 rounded">
                  <input 
                    type="checkbox" 
                    checked={stagedFiles.includes(file)}
                    onChange={() => stagedFiles.includes(file) ? unstageFile(file) : stageFile(file)}
                    className="mr-2"
                  />
                  <span className="text-yellow-400">M</span>
                  <span className="ml-1">{file}</span>
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="w-1/2 pl-2 border-l border-gray-700">
          <h4 className="text-sm font-medium mb-2 flex justify-between">
            Staged Changes
            <span className="bg-green-900 text-green-200 text-xs px-1.5 rounded">
              {stagedFiles.length}
            </span>
          </h4>
          <ul className="text-sm overflow-y-auto h-16 mb-2">
            {stagedFiles.map(file => (
              <li key={file} className="flex items-center p-1 hover:bg-gray-700 rounded">
                <span className="text-green-400">A</span>
                <span className="ml-1">{file}</span>
              </li>
            ))}
          </ul>
          
          <textarea
            value={commitMessage}
            onChange={e => setCommitMessage(e.target.value)}
            placeholder="Commit message"
            className="w-full bg-gray-700 text-white p-2 text-sm rounded mb-2 h-16"
          />
          
          <button
            onClick={commit}
            disabled={!commitMessage.trim() || stagedFiles.length === 0}
            className={`w-full py-1 text-sm rounded ${
              commitMessage.trim() && stagedFiles.length > 0
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            Commit {stagedFiles.length > 0 && `(${stagedFiles.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
