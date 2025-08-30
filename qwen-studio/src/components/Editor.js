import Editor from '@monaco-editor/react';
+ import * as monaco from 'monaco-editor';

export default function CodeEditor({ value, onChange, language = "python" }) {
  const handleEditorChange = (newValue) => {
    onChange(newValue);
  };

+ const setupAIAssistance = (editor) => {
+   // Register AI-powered autocomplete
+   monaco.languages.registerCompletionItemProvider(language, {
+     provideCompletionItems: async (model, position) => {
+       const textUntilPosition = model.getValueInRange({
+         startLineNumber: 1,
+         startColumn: 1,
+         endLineNumber: position.lineNumber,
+         endColumn: position.column
+       });
+       
+       // Only trigger for meaningful context
+       if (textUntilPosition.trim().length < 3) return { suggestions: [] };
+       
+       try {
+         const response = await fetch('/.netlify/functions/qwen-proxy', {
+           method: 'POST',
+           headers: { 'Content-Type': 'application/json' },
+           body: JSON.stringify({ 
+             message: `Complete this Python code:\n\n${textUntilPosition}\n\nProvide ONLY the completion text without explanation.` 
+           })
+         });
+         
+         const data = await response.json();
+         const completion = data.content.trim();
+         
+         return {
+           suggestions: [
+             {
+               label: `🤖 AI: ${completion.substring(0, 20)}...`,
+               kind: monaco.languages.CompletionItemKind.Snippet,
+               insertText: completion,
+               range: {
+                 startLineNumber: position.lineNumber,
+                 endLineNumber: position.lineNumber,
+                 startColumn: position.column,
+                 endColumn: position.column
+               }
+             }
+           ]
+         };
+       } catch (error) {
+         return { suggestions: [] };
+       }
+     }
+   });
+   
+   // AI-powered error explanation
+   editor.onMouseDown(e => {
+     if (e.event.rightButton || !e.target || e.target.type !== monaco.editor.MouseTargetType.GUTTER_ERROR) return;
+     
+     const decorations = editor.deltaDecorations([], []);
+     const errorRange = e.target.range;
+     const errorText = editor.getModel().getValueInRange(errorRange);
+     
+     // Show loading indicator
+     const decorationId = editor.deltaDecorations([
+       {
+         range: errorRange,
+         options: {
+           inlineClassName: 'ai-error-highlight',
+           afterContentClassName: 'ai-error-loading',
+           isWholeLine: true
+         }
+       }
+     ], []);
+     
+     // Fetch AI explanation
+     fetch('/.netlify/functions/qwen-proxy', {
+       method: 'POST',
+       headers: { 'Content-Type': 'application/json' },
+       body: JSON.stringify({ 
+         message: `Explain this Python error and how to fix it:\n\n${errorText}\n\nKeep explanation concise (max 2 sentences).` 
+       })
+     })
+     .then(res => res.json())
+     .then(data => {
+       // Replace loading with explanation
+       editor.deltaDecorations(decorationId, [
+         {
+           range: errorRange,
+           options: {
+             hoverMessage: [{ value: `💡 AI Explanation: ${data.content}` }],
+             inlineClassName: 'ai-error-highlight',
+             glyphMarginClassName: 'ai-error-glyph',
+             isWholeLine: true
+           }
+         }
+       ]);
+     });
+   });
+ };

  return (
    <div className="flex-1 flex flex-col">
      <Editor
        height="100%"
        width="100%"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={handleEditorChange}
+       onMount={setupAIAssistance}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
+         quickSuggestions: true,
+         suggestOnTriggerCharacters: true,
+         acceptSuggestionOnEnter: 'smart'
        }}
      />
    </div>
  );
}
