import React from 'react';

// SVG-based radar/spider chart
export default function RadarChart({ data, expectedData, size = 240 }) {
    const cx = size / 2, cy = size / 2, r = size / 2 - 30;
    const labels = Object.keys(data);
    const n = labels.length;
    if (n < 3) return null;

    const angleStep = (2 * Math.PI) / n;
    const getPoint = (value, i) => ({
        x: cx + r * (value / 100) * Math.sin(i * angleStep),
        y: cy - r * (value / 100) * Math.cos(i * angleStep)
    });

    const makePolygon = (values) => labels.map((_, i) => {
        const p = getPoint(values[i], i);
        return `${p.x},${p.y}`;
    }).join(' ');

    const studentValues = labels.map(l => data[l] || 0);
    const expectedValues = labels.map(l => expectedData[l] || 0);

    // Grid rings
    const rings = [20, 40, 60, 80, 100];

    return (
        <div className="radar-chart-container">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Grid */}
                {rings.map(ring => (
                    <polygon key={ring} points={labels.map((_, i) => { const p = getPoint(ring, i); return `${p.x},${p.y}`; }).join(' ')}
                        fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
                ))}
                {/* Axes */}
                {labels.map((_, i) => {
                    const p = getPoint(100, i);
                    return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />;
                })}
                {/* Expected polygon */}
                <polygon points={makePolygon(expectedValues)} fill="rgba(143,171,212,0.15)" stroke="#8FABD4" strokeWidth="1.5" strokeDasharray="4 2" />
                {/* Student polygon */}
                <polygon points={makePolygon(studentValues)} fill="rgba(74,112,169,0.2)" stroke="#4A70A9" strokeWidth="2" />
                {/* Dots + Labels */}
                {labels.map((label, i) => {
                    const p = getPoint(studentValues[i], i);
                    const lp = getPoint(115, i);
                    return (
                        <g key={label}>
                            <circle cx={p.x} cy={p.y} r="4" fill="#4A70A9" />
                            <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
                                style={{ fontSize: '9px', fontWeight: 700, fill: '#5A5A5A' }}>{label}</text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
