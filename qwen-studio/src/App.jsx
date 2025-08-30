import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

export default function App() {
  const [files, setFiles] = useState({
    "main.py": 'def hello(name):\n    print(f"Hello {name}")\n\nhello("World")',
    "utils.py": ""
  });
  const [currentFile, setCurrentFile] = useState("main.py");
  const [code, setCode] = useState(files["main.py"]);
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState("");

  useEffect(() => {
    setCode(files[currentFile] || "");
  }, [currentFile, files]);

  const saveFile = () => {
    setFiles((f) => ({ ...f, [currentFile]: code }));
  };

  const runCommand = async () => {
    const allFilesContext = Object.entries(files)
      .map(([path, content]) => `--- FILE: ${path} ---\n${content}`)
      .join("\n\n");

    const prompt = `
You are Qwen3, an AI coding assistant in a web IDE.
You can:
- Edit files: @@edit:filename@@\n<new content>
- Create files: @@create:filename@@\n<content>
- Log: @@log@@\n<message>

Available files:
${allFilesContext}

User request:
${command}

Respond ONLY with @@edit@@, @@create@@, @@log@@ blocks.
`;

    setLogs("🧠 Qwen is thinking...");

    try {
      const res = await fetch("/api/qwen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });

      const data = await res.json();

      if (!data.content) {
        setLogs("❌ No response from AI");
        return;
      }

      // Parse @@edit@@, @@create@@, @@log@@
      const edits = [...data.content.matchAll(/@@edit:(.*?)@@\n([\s\S]*?)(?=@@|$)/g)].map(m => ({ path: m[1], content: m[2].trim() }));
      const creates = [...data.content.matchAll(/@@create:(.*?)@@\n([\s\S]*?)(?=@@|$)/g)].map(m => ({ path: m[1], content: m[2].trim() }));
      const logMatch = data.content.match(/@@log@@\n(.*?)(?=@@|$)/s);
      const log = logMatch ? logMatch[1].trim() : "";

      // Apply changes
      setFiles(prev => {
        const updated = { ...prev };
        edits.forEach(e => { updated[e.path] = e.content; });
        creates.forEach(c => { updated[c.path] = c.content; });
        return updated;
      });

      if (log) setLogs("📝 " + log);
      else setLogs("✅ Done!");

      // Refresh editor if current file was edited
      if (edits.some(e => e.path === currentFile)) {
        setCode(files[currentFile]);
      }
    } catch (err) {
      setLogs("❌ Error: " + err.message);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      {/* File Tree */}
      <div style={{ width: 200, background: "#1e1e1e", color: "white", padding: 10 }}>
        <h3>📁 Project</h3>
        {Object.keys(files).map((file) => (
          <div
            key={file}
            onClick={() => setCurrentFile(file)}
            style={{
              padding: "6px",
              cursor: "pointer",
              background: currentFile === file ? "#007acc" : "transparent",
              borderRadius: "4px",
              margin: "2px 0"
            }}
          >
            {file}
          </div>
        ))}
        <button
          onClick={() => {
            const name = prompt("New file name?");
            if (name) setFiles(f => ({ ...f, [name]: "" }));
          }}
          style={{ marginTop: "10px", width: "100%" }}
        >
          ➕ New File
        </button>
      </div>

      {/* Main Editor Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Editor
          height="75vh"
          language="python"
          value={code}
          onChange={(value) => setCode(value)}
          theme="vs-dark"
          options={{ minimap: { enabled: false } }}
        />

        <div style={{ padding: "10px", background: "#2d2d2d", display: "flex", gap: "10px" }}>
          <button onClick={saveFile} style={{ padding: "8px 12px" }}>💾 Save</button>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="e.g. @create:calc.py Add a calculator class"
            style={{ flex: 1, padding: "8px" }}
            onKeyPress={(e) => e.key === 'Enter' && runCommand()}
          />
          <button onClick={runCommand} style={{ padding: "8px 12px", background: "#007acc", color: "white" }}>
            🤖 Ask Qwen
          </button>
        </div>

        {logs && (
          <div style={{ padding: "10px", background: "#202020", color: "#aaa", fontSize: "14px" }}>
            {logs}
          </div>
        )}
      </div>
    </div>
  );
}
