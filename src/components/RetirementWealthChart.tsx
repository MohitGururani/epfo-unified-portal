import React, { useState } from 'react';
import { TrendingUp, Info } from 'lucide-react';

interface TrajectoryPoint {
  age: number;
  label: string;
  xPercent: number; // 0 to 100
  corpus: number; // in Rupees
  displayCorpus: string;
  isRetirement?: boolean;
  isCurrent?: boolean;
}

export const RetirementWealthChart: React.FC = () => {
  // Key points along the 26-year compounding curve (from Age 32 to 58)
  const trajectoryData: TrajectoryPoint[] = [
    { age: 32, label: 'Age 32 (Now)', xPercent: 0, corpus: 1040000, displayCorpus: '₹10,40,000', isCurrent: true },
    { age: 37, label: 'Age 37', xPercent: 19.2, corpus: 2480000, displayCorpus: '₹24,80,000' },
    { age: 42, label: 'Age 42', xPercent: 38.5, corpus: 4760000, displayCorpus: '₹47,60,000' },
    { age: 47, label: 'Age 47', xPercent: 57.7, corpus: 8216800, displayCorpus: '₹82,16,800' },
    { age: 52, label: 'Age 52', xPercent: 76.9, corpus: 13650000, displayCorpus: '₹1,36,50,000' },
    { age: 58, label: 'Age 58 (Retirement)', xPercent: 100, corpus: 22396000, displayCorpus: '₹2,23,96,000', isRetirement: true },
  ];

  // Default active point is Age 47 as highlighted in user's image
  const [activeAge, setActiveAge] = useState<number>(47);
  const activePoint = trajectoryData.find((p) => p.age === activeAge) || trajectoryData[3];

  // SVG Chart dimensions
  const width = 800;
  const height = 340;
  const paddingLeft = 65;
  const paddingRight = 40;
  const paddingTop = 25;
  const paddingBottom = 45;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Max scale is 240 Lakhs (₹2,40,00,000)
  const maxAmount = 24000000;

  // Y-axis grid levels (in Lakhs)
  const yTicks = [
    { value: 24000000, label: '₹240L', yPercent: 0 },
    { value: 18000000, label: '₹180L', yPercent: 25 },
    { value: 12000000, label: '₹120L', yPercent: 50 },
    { value: 6000000, label: '₹60L', yPercent: 75 },
    { value: 0, label: '₹0L', yPercent: 100 },
  ];

  // Generate SVG coordinates for points
  const points = trajectoryData.map((pt) => {
    const x = paddingLeft + (pt.xPercent / 100) * chartWidth;
    const y = paddingTop + chartHeight - (pt.corpus / maxAmount) * chartHeight;
    return { ...pt, x, y };
  });

  // Calculate smooth SVG cubic bezier path
  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePath = generateSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  // Active point coordinates for tooltip and highlighted circle
  const activePt = points.find((p) => p.age === activeAge) || points[3];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors relative overflow-hidden">
      {/* Header Section matching image.png */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Retirement Wealth Trajectory
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
            Compounded growth projection based on standard 8.25% statutory yield and continuous contributions.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            ESTIMATED AT AGE 58
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight mt-0.5 font-sans">
            ₹2,23,96,000
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative w-full aspect-[16/7] min-h-[280px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible select-none"
        >
          <defs>
            {/* Smooth gradient fill matching the image */}
            <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Horizontal Dashed Grid Lines & Y-Axis Labels */}
          {yTicks.map((tick) => {
            const y = paddingTop + (tick.yPercent / 100) * chartHeight;
            return (
              <g key={tick.label}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={paddingLeft + chartWidth}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] font-medium fill-slate-400 dark:fill-slate-500 font-mono"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* Vertical Dashed Grid Lines & X-Axis Labels */}
          {points.map((pt) => (
            <g key={pt.age}>
              <line
                x1={pt.x}
                y1={paddingTop}
                x2={pt.x}
                y2={paddingTop + chartHeight}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text
                x={pt.x}
                y={paddingTop + chartHeight + 22}
                textAnchor={pt.age === 32 ? 'start' : pt.age === 58 ? 'end' : 'middle'}
                className="text-[11px] font-medium fill-slate-500 dark:fill-slate-400 font-sans cursor-pointer"
                onClick={() => setActiveAge(pt.age)}
              >
                {pt.label}
              </text>
            </g>
          ))}

          {/* Baseline Solid Axis Line */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={paddingLeft + chartWidth}
            y2={paddingTop + chartHeight}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeWidth="1.5"
          />

          {/* Gradient Filled Area */}
          <path d={areaPath} fill="url(#wealthGradient)" />

          {/* Primary Curve Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#0d9488"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Interactive clickable node points */}
          {points.map((pt) => {
            const isSelected = pt.age === activeAge;
            return (
              <g
                key={pt.age}
                className="cursor-pointer group"
                onClick={() => setActiveAge(pt.age)}
              >
                {/* Larger transparent hit area */}
                <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />

                {isSelected ? (
                  <>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="7"
                      fill="#0d9488"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className="transition-all duration-200 drop-shadow-sm"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="12"
                      fill="#0d9488"
                      fillOpacity="0.2"
                      className="animate-ping"
                    />
                  </>
                ) : (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#0d9488"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip Card positioned near active point exactly as in image.png */}
        <div
          className="absolute z-20 pointer-events-auto transition-all duration-300 transform -translate-x-1/2 -translate-y-full mb-3"
          style={{
            left: `${(activePt.x / width) * 100}%`,
            top: `${(activePt.y / height) * 100}%`,
          }}
        >
          <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-xl rounded-2xl p-4 min-w-[210px] text-left">
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Age {activePt.age}
            </div>
            <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 font-sans tracking-tight mt-0.5">
              {activePt.displayCorpus}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1">
              <span>Government Guaranteed Corpus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Helper Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Compounded growth projection based on standard 8.25% statutory yield and continuous contributions.</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <span>Click any age on the chart to inspect milestone corpus</span>
        </div>
      </div>
    </div>
  );
};
