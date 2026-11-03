import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useData } from '../../context/DataContext';

export const SubjectPieChart: React.FC = () => {
  const { subjectSummaries, stats, theme } = useData();

  const data = subjectSummaries.filter((s) => s.totalSeconds > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-xl bg-navy-950 border border-slate-750 p-3 shadow-xl text-xs dark:bg-navy-950 light:bg-white light:border-slate-200">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="font-bold text-white dark:text-white light:text-slate-900">{item.subjectName}</span>
          </div>
          <p className="mt-1 font-mono text-purple-300 font-bold">
            {item.totalHours} hrs ({item.percentage}%)
          </p>
          <p className="text-[11px] text-slate-400">
            {item.sessionCount} recorded sessions
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-navy-900 border border-slate-800 p-6 shadow-lg dark:bg-navy-900 dark:border-slate-800 light:bg-white light:border-slate-200">
      <div className="pb-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-100">
        <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900">
          Subject Study Distribution
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
          Proportional time allocation across your courses
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 items-center gap-6">
        {data.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-sm text-slate-400">
            No study sessions recorded yet. Start tracking to see subject distribution!
          </div>
        ) : (
          <>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="totalSeconds"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown List */}
            <div className="space-y-3">
              {data.map((item) => (
                <div key={item.subjectId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-200 font-semibold dark:text-slate-200 light:text-slate-700">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.subjectName}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {item.totalHours}h ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden dark:bg-slate-800 light:bg-slate-200">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: item.color,
                        width: `${item.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

