import { Check } from 'lucide-react';

const steps = [
  { label: 'Analyste', short: 'Agent 1' },
  { label: 'Génération Tests', short: 'Agent 2' },
  { label: 'Scoring', short: 'Agent 3' },
  { label: 'Validation', short: 'Agent 4' },
  { label: 'Sortie JSON', short: 'Agent 5' },
];

interface Props {
  currentStep: number; // 0-5, 5 = all done
}

export default function AgentStepper({ currentStep }: Props) {
  return (
    <div className="bg-card rounded-xl card-shadow border border-border p-6 mb-6 animate-fade-in">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => {
          const completed = currentStep > i;
          const active = currentStep === i;
          const pending = currentStep < i;

          return (
            <div key={i} className="flex items-center flex-1 last:flex-initial">
              {/* Step circle + label */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                    ${completed ? 'gradient-primary text-white animate-scale-pop' : ''}
                    ${active ? 'border-2 border-primary-mid text-primary-mid animate-pulse-ring' : ''}
                    ${pending ? 'border-2 border-border text-muted-foreground' : ''}
                  `}
                >
                  {completed ? <Check className="w-5 h-5" /> : i + 1}
                </div>
                <span className={`text-[11px] mt-2 text-center font-medium
                  ${completed ? 'text-primary' : active ? 'text-primary-mid' : 'text-muted-foreground'}
                `}>
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 mt-[-20px] rounded-full overflow-hidden bg-border">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${completed ? 'gradient-stepper' : ''}`}
                    style={{ width: completed ? '100%' : active ? '50%' : '0%' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
