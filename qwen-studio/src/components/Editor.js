// src/components/Editor.js
import Editor from '@monaco-editor/react';

export default function CodeEditor({ value, onChange, language = "python" }) {
  const handleEditorChange = (newValue) => {
    onChange(newValue);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Editor
        height="100%"
        width="100%"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
