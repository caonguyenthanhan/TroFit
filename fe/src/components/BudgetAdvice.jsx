import React from 'react';
import { Landmark, AlertCircle, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { getFinancialAdvice, checkBudgetExtensionConditions } from '../lib/budgetRules';

export default function BudgetAdvice({ income, rent, totalCost, profile }) {
  const inc = Number(income) || 0;
  if (inc <= 0) return null;

  const r = Number(rent) || 0;
  const tc = Number(totalCost) || r; // fallback to rent if no total cost

  const adviceData = getFinancialAdvice(inc, r, tc, profile);
  if (!adviceData) return null;

  const { rentPercent, totalCostPercent, status, advice, maxPercentage } = adviceData;
  const { conditions } = checkBudgetExtensionConditions(profile);

  // Styling helper for status colors
  const statusColors = {
    safe: {
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-500/5',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />
    },
    warning: {
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      bg: 'bg-amber-500/5',
      icon: <AlertCircle className="w-5 h-5 text-amber-400" />
    },
    danger: {
      text: 'text-rose-400',
      border: 'border-rose-500/20',
      bg: 'bg-rose-500/5',
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />
    }
  };

  const style = statusColors[status] || statusColors.safe;

  return (
    <div className={`p-5 rounded-2xl border ${style.border} ${style.bg} space-y-4`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{style.icon}</div>
        <div className="space-y-1">
          <h4 className={`font-bold text-sm ${style.text} flex items-center gap-1.5`}>
            Phân Tích Ngân Sách Tài Chính Cá Nhân
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">{advice}</p>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>Tổng chi phí trọ/Thu nhập: <strong>{totalCostPercent.toFixed(1)}%</strong></span>
          <span>Hạn mức tối đa khuyên dùng: <strong>{maxPercentage}%</strong></span>
        </div>
        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
          {/* Target marker */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-indigo-500/80 z-10"
            style={{ left: `${maxPercentage}%` }}
            title={`Hạn mức tối đa khuyên dùng: ${maxPercentage}%`}
          ></div>
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-indigo-500/40 z-10"
            style={{ left: `30%` }}
            title="Ngưỡng 30% mặc định"
          ></div>

          {/* Current cost filled */}
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              status === 'safe' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${Math.min(100, totalCostPercent)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-[9px] text-slate-500 px-0.5">
          <span>0%</span>
          <span>15% (Lý tưởng)</span>
          <span>30% (Khuyên dùng)</span>
          <span>40% (Trần tối đa)</span>
        </div>
      </div>

      {/* Nới trần justification */}
      {conditions.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-slate-900/60">
          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Lý do nới trần ngân sách (+{conditions.reduce((s, c) => s + c.increase, 0)}%):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {conditions.map((c) => (
              <span key={c.id} className="text-[9px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded">
                {c.label} (+{c.increase}%)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
