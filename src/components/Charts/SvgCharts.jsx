import React from 'react';

// Responsive SVG Bar Chart
export const BarChartComponent = ({ data = [], height = 180, barColor = 'var(--accent-primary)' }) => {
  if (!data || data.length === 0) {
    return <div className="no-chart-data">No activity recorded for chart</div>;
  }

  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="svg-chart-wrapper" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 320 160" preserveAspectRatio="none">
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {data.map((item, idx) => {
          const barWidth = 24;
          const spacing = (320 - barWidth * data.length) / (data.length + 1);
          const x = spacing + idx * (barWidth + spacing);
          const barHeight = (item.value / maxVal) * 110;
          const y = 130 - barHeight;

          return (
            <g key={idx} className="bar-group">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="6"
                fill="url(#barGrad)"
              />
              <text
                x={x + barWidth / 2}
                y={152}
                textAnchor="middle"
                fill="var(--text-subtle)"
                fontSize="11"
                fontWeight="500"
              >
                {item.label}
              </text>
              {item.value > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fill="var(--text-main)"
                  fontSize="10"
                  fontWeight="600"
                >
                  {item.value}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <style>{`
        .svg-chart-wrapper { width: 100%; position: relative; }
        .no-chart-data { font-size: 0.8rem; color: var(--text-subtle); text-align: center; padding: 2rem; }
      `}</style>
    </div>
  );
};

// Trend Curve Line Chart
export const TrendChartComponent = ({ data = [], height = 180 }) => {
  if (!data || data.length === 0) {
    return <div className="no-chart-data">No trend data available</div>;
  }

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const width = 320;
  const chartHeight = 120;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * (width - 40) + 20;
    const y = chartHeight - (d.value / maxVal) * (chartHeight - 30) + 10;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${(0 / (data.length - 1 || 1)) * (width - 40) + 20},${chartHeight + 10} ${points} ${width - 20},${chartHeight + 10}`;

  return (
    <div className="svg-chart-wrapper" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 320 160" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <polygon points={areaPoints} fill="url(#areaGrad)" />
        {/* Smooth trend line */}
        <polyline points={points} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

        {/* Data points */}
        {data.map((item, i) => {
          const x = (i / (data.length - 1 || 1)) * (width - 40) + 20;
          const y = chartHeight - (item.value / maxVal) * (chartHeight - 30) + 10;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="#10b981" stroke="var(--bg-surface)" strokeWidth="2" />
              <text x={x} y={152} textAnchor="middle" fill="var(--text-subtle)" fontSize="11">
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Donut Progress Ring
export const ProgressRing = ({ percent = 0, size = 80, strokeWidth = 8, color = 'var(--accent-primary)' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="progress-ring-box" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring-text">{Math.round(percent)}%</div>
      <style>{`
        .progress-ring-box { position: relative; display: flex; align-items: center; justify-content: center; }
        .ring-text { position: absolute; font-size: 0.85rem; font-weight: 700; color: var(--text-main); }
      `}</style>
    </div>
  );
};
