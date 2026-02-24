import { Calendar, Hash, Briefcase, Clock } from 'lucide-react';
import { Employee } from '@/store/useSkillBridgeStore';

interface Props {
  employee: Employee;
}

export default function EmployeeHeader({ employee }: Props) {
  return (
    <div className="gradient-header-wash rounded-xl card-shadow border border-border p-6 mb-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{employee.name}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs bg-accent text-accent-foreground px-2.5 py-1 rounded-md">
              <Hash className="w-3 h-3" /> {employee.id}
            </span>
            <span className="btn-outline-blue !px-2 !py-0.5 !text-[11px] !font-bold !border">
              {employee.department}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Briefcase className="w-3 h-3" /> {employee.position}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" /> {employee.seniority_months} mois
            </span>
          </div>
        </div>
        <div className="gradient-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 shrink-0">
          <Calendar className="w-4 h-4" />
          {employee.evaluation_date}
        </div>
      </div>
    </div>
  );
}
