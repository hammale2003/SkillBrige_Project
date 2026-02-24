import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface LogEntry {
  text: string;
  done: boolean;
}

interface Props {
  logs: LogEntry[];
}

export default function ProcessingLog({ logs }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (logs.length === 0) return null;

  return (
    <div className="bg-[#0f1117] rounded-xl border border-border p-4 mb-6 font-mono text-xs animate-fade-in max-h-48 overflow-y-auto">
      <div className="text-muted-foreground mb-2 text-[10px] uppercase tracking-widest">Console SkillBridge</div>
      {logs.map((entry, i) => (
        <div key={i} className="flex items-start gap-2 mb-1.5">
          {entry.done
            ? <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
            : <Loader2 className="w-3 h-3 text-blue-400 animate-spin mt-0.5 flex-shrink-0" />
          }
          <span className={entry.done ? 'text-green-300' : 'text-blue-300'}>{entry.text}</span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
