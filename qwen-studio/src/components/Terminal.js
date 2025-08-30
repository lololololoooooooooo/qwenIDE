import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export default function TerminalPanel() {
  const terminalRef = useRef(null);
  const terminalInstance = useRef(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Create terminal
    const term = new Terminal({
      fontSize: 14,
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff'
      }
    });
    
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    
    // Basic shell simulation
    term.writeln('Welcome to QwenStudio Terminal');
    term.writeln('Type "help" for available commands');
    term.prompt = () => {
      term.write('\r\n$ ');
    };
    
    term.prompt();
    
    term.onData(e => {
      switch (e) {
        case '\u0003': // Ctrl+C
          term.write('^C');
          term.prompt();
          break;
        case '\r': // Enter
          term.write('\r\n');
          handleCommand(term);
          break;
        default:
          if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E) || e >= '\u00a0') {
            term.write(e);
          }
      }
    });
    
    terminalInstance.current = term;
    
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    
    resizeObserver.observe(terminalRef.current.parentElement);
    
    return () => {
      resizeObserver.disconnect();
      term.dispose();
    };
  }, []);

  const handleCommand = (term) => {
    const command = term._core.buffer.xterm.buffer.active.getLine(
      term._core.buffer.xterm.buffer.active.cursorY
    ).translateToString().trim();
    
    // Simple command handling
    const cmd = command.split(' ')[0];
    switch (cmd) {
      case 'clear':
        term.clear();
        break;
      case 'ls':
        term.writeln(Object.keys(files).join('  '));
        break;
      case 'help':
        term.writeln('Available commands: ls, clear, help');
        break;
      default:
        if (command) term.writeln(`Command not found: ${cmd}`);
    }
    
    term.prompt();
  };

  return (
    <div className="h-full bg-black" style={{ height: '30%' }}>
      <div ref={terminalRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
