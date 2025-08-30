import { useState } from 'react';
import FileTree from './components/FileTree';
import CodeEditor from './components/Editor';
import AICommand from './components/AICommand';

export default function App() {
  const [files, setFiles] = useState({
    'main.py': 'def hello(name):\n    print(f"Hello {name}")\n\nhello("World")',
    'utils.py': ''
  });
  const [currentFile, setCurrentFile] = useState('main.py');
  const [code, setCode] = useState(files['main.py']);
  const [logs, setLogs] = useState('');

  const saveCurrent = () => {
    setFiles(prev => ({ ...prev, [currentFile]: code }));
    setLogs('💾 Saved ' + currentFile);
  };

  const createFile = (name) => {
    if (!files[name]) {
      setFiles(prev => ({ ...prev, [name]: '' }));
      setCurrentFile(name);
      setCode('');
    }
  };

  const deleteFile = (name) => {
    if (Object.keys(files).length > 1) {
      setFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[name];
        return newFiles;
      });
      if (currentFile === name) {
        const first = Object.keys(files)[0];
        setCurrentFile(first);
        setCode(files[first]);
      }
    }
  };

  const askAI = async (message) => {
    const allFilesContext = Object.entries(files)
      .map(([path, content]) => `--- FILE: ${path} ---\n${content}`)
      .join('\n\n');

    const prompt = `
You are Qwen3, an AI coding assistant.
Use this format:
@@edit:filename@@\n<new content>
@@create:filename@@\n<content>
@@log@@\n<message>

Available files:
${allFilesContext}

User request:
${message}

Respond ONLY with @@edit@@ / @@create@@ / @@log@@.
`;

    try {
      setLogs(prev => prev + '\n\n🧠 Processing AI response...');
      const res = await fetch('/.netlify/functions/qwen-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      const content = data.content;

      const edits = [...content.matchAll(/@@edit:(.*?)@@\n([\s\S]*?)(?=@@|$)/g)].map(m => ({ 
        path: m[1], 
        content: m[2].trim() 
      }));
      const creates = [...content.matchAll(/@@create:(.*?)@@\n([\s\S]*?)(?=@@|$)/g)].map(m => ({ 
        path: m[1], 
        content: m[2].trim() 
      }));
      const logMatch = content.match(/@@log@@\n(.*?)(?=@@|$)/s);
      const log = logMatch ? logMatch[1].trim() : '✅ Done.';

      // Update files state immutably
      setFiles(prev => {
        const newFiles = { ...prev };
        edits.forEach(e => { newFiles[e.path] = e.content; });
        creates.forEach(c => { newFiles[c.path] = c.content; });
        return newFiles;
      });

      // Update editor if current file was edited
      const currentFileEdit = edits.find(e => e.path === currentFile);
      if (currentFileEdit) {
        setCode(currentFileEdit.content);
      }

      setLogs(prev => prev + '\n\n' + log);
      return { logs: log };
    } catch (err) {
      const errorMsg = `❌ AI request failed: ${err.message}`;
      setLogs(prev => prev + '\n\n' + errorMsg);
      throw new Error(errorMsg);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <FileTree
        files={files}
        currentFile={currentFile}
        onCreateFile={createFile}
        onDeleteFile={deleteFile}
        onSelectFile={(file) => {
          setCurrentFile(file);
          setCode(files[file]);
        }}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CodeEditor value={code} onChange={setCode} />
        <AICommand onAsk={askAI} logs={logs} setLogs={setLogs} />
      </div>
    </div>
  );
}
