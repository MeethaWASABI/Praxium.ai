import React from 'react';

// SVG line chart for progress history
export default function LineChart({ data, width = 500, height = 180 }) {
    if (!data || data.length < 2) return <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.82rem' }}>Take more tests to see your progress graph.</div>;

    const pad = { top: 20, right: 20, bottom: 30, left: 40 };
    const w = width - pad.left - pad.right;
    const h = height - pad.top - pad.bottom;
    const maxVal = Math.max(...data.map(d => d.value), 100);

    const points = data.map((d, i) => ({
        x: pad.left + (i / (data.length - 1)) * w,
        y: pad.top + h - (d.value / maxVal) * h
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const areaD = pathD + ` L${points[points.length - 1].x},${pad.top + h} L${points[0].x},${pad.top + h} Z`;

    return (
        <div className="line-chart-container">
            <svg viewBox={`0 0 ${width} ${height}`} className="line-chart-svg" preserveAspectRatio="xMidYMid meet">
                {/* Y grid lines */}
                {[0, 25, 50, 75, 100].map(v => {
                    const y = pad.top + h - (v / maxVal) * h;
                    return (
                        <g key={v}>
                            <line x1={pad.left} y1={y} x2={pad.left + w} y2={y} stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                            <text x={pad.left - 6} y={y + 3} textAnchor="end" style={{ fontSize: '8px', fill: '#999', fontWeight: 600 }}>{v}%</text>
                        </g>
                    );
                })}
                {/* Area fill */}
                <path d={areaD} fill="url(#lineGrad)" />
                {/* Line */}
                <path d={pathD} fill="none" stroke="#4A70A9" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {/* Dots + labels */}
                {points.map((p, i) => (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#4A70A9" strokeWidth="2" />
                        <text x={p.x} y={pad.top + h + 16} textAnchor="middle" style={{ fontSize: '7px', fill: '#999', fontWeight: 600 }}>{data[i].label}</text>
                    </g>
                ))}
                <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(74,112,169,0.2)" />
                        <stop offset="100%" stopColor="rgba(74,112,169,0)" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}
