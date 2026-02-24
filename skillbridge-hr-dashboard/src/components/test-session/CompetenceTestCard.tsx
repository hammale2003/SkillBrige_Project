import { CheckCircle } from 'lucide-react';

interface Props {
  question: string;
  options: string[];
  correctAnswer: string;   // "A" | "B" | "C" | "D"
  selectedOption: string;  // "" if none selected
  onSelect: (opt: string) => void;
  competenceId: string;
  competenceName: string;
  onNext?: () => void;
  isLast: boolean;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

/** Render a question string that may contain ```lang ... ``` fenced code blocks. */
function QuestionContent({ text }: { text: string }) {
  const parts = text.split(/(```[\w]*\n[\s\S]*?```)/g);
  return (
    <>
      {parts.map((part, i) => {
        const codeMatch = part.match(/^```([\w]*)\n([\s\S]*?)```$/);
        if (codeMatch) {
          const lang = codeMatch[1] || 'code';
          const code = codeMatch[2];
          return (
            <div key={i} className="my-3">
              <div className="flex items-center gap-2 bg-[#1e1e2e] rounded-t-lg px-3 py-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{lang}</span>
              </div>
              <pre className="bg-[#1e1e2e] rounded-b-lg p-4 overflow-x-auto text-[13px] font-mono text-[#cdd6f4] leading-relaxed whitespace-pre">
                {code.trimEnd()}
              </pre>
            </div>
          );
        }
        return (
          <span key={i} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      })}
    </>
  );
}

export default function CompetenceTestCard({
  question, options, correctAnswer, selectedOption,
  onSelect, competenceId, competenceName, onNext, isLast,
}: Props) {
  return (
    <div className="bg-card rounded-xl card-shadow border border-border p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">QCM</span>
          <h3 className="text-sm font-bold text-foreground">{competenceName}</h3>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground bg-accent px-2 py-0.5 rounded">
          {competenceId}
        </span>
      </div>

      {/* Question */}
      <div className="bg-accent border-l-4 border-primary-mid rounded-lg p-4 mb-5 text-[14px] text-foreground">
        <QuestionContent text={question} />
      </div>

      {/* Options */}
      <div className="space-y-3 mb-5">
        {options.map((opt, idx) => {
          const letter = OPTION_LETTERS[idx] ?? String(idx);
          const isSelected = selectedOption === letter;
          return (
            <button
              key={letter}
              onClick={() => onSelect(letter)}
              className={`w-full text-left flex items-start gap-3 p-3.5 rounded-lg border-2 transition-all duration-150
                ${isSelected
                  ? 'border-primary-mid bg-primary-mid/10 font-semibold'
                  : 'border-border hover:border-primary-mid/40 bg-card'
                }`}
            >
              <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[12px] font-bold mt-0.5
                ${isSelected ? 'border-primary-mid bg-primary-mid text-white' : 'border-muted-foreground text-muted-foreground'}`}>
                {letter}
              </span>
              <span className="text-sm leading-relaxed">{opt}</span>
              {isSelected && <CheckCircle className="flex-shrink-0 w-4 h-4 text-primary-mid ml-auto mt-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-[11px] text-muted-foreground">
          {selectedOption ? `Réponse sélectionnée : ${selectedOption}` : 'Aucune réponse sélectionnée'}
        </span>
        {!isLast && onNext && (
          <button className="btn-outline-blue !text-[13px] !px-4 !py-2" onClick={onNext}>
            Compétence suivante →
          </button>
        )}
      </div>
    </div>
  );
}
