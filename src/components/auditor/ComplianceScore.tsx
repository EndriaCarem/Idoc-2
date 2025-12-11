import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface ComplianceScoreProps {
  score: number;
  totalIssues: number;
  resolvedIssues: number;
}

export function ComplianceScore({ score, totalIssues, resolvedIssues }: ComplianceScoreProps) {
  const isComplete = score === 100;
  
  const chartData = [
    { name: 'score', value: score },
    { name: 'remaining', value: 100 - score },
  ];

  const scoreColor = isComplete ? 'hsl(142, 76%, 36%)' : 'hsl(24, 95%, 53%)'; // green-600 or orange-500
  const remainingColor = 'hsl(214, 32%, 91%)'; // slate-200

  return (
    <div className="p-4 bg-card rounded-lg border shadow-sm">
      {/* Donut Chart */}
      <div className="relative h-32 w-32 mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={55}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={scoreColor} />
              <Cell fill={remainingColor} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Score no centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span 
            className="text-3xl font-bold transition-colors duration-500"
            style={{ color: scoreColor }}
          >
            {score}%
          </span>
        </div>
      </div>
      
      {/* Título */}
      <div className="flex items-center justify-center gap-2 mt-3">
        {isComplete ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        )}
        <h3 className="font-semibold text-sm">Score de Compliance</h3>
      </div>
      
      {/* Texto explicativo */}
      <p className="text-xs text-muted-foreground text-center mt-2 leading-relaxed">
        {isComplete 
          ? "Parabéns! Seu relatório está em conformidade total."
          : "Seu relatório tem inconsistências que podem gerar glosa. Corrija os itens abaixo para atingir 100%."
        }
      </p>

      {/* Progress indicator */}
      {totalIssues > 0 && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Itens resolvidos</span>
            <span className="font-medium">{resolvedIssues}/{totalIssues}</span>
          </div>
        </div>
      )}
    </div>
  );
}
