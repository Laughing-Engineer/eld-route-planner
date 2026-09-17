import React from 'react';

/**
 * ELDGridSVG: Renders an authentic FMCSA Form MCS-59 24-Hour Duty Status Graph Grid
 * Rows:
 * 1. Off Duty
 * 2. Sleeper Berth
 * 3. Driving
 * 4. On Duty (Not Driving)
 */
export default function ELDGridSVG({ segments = [], totals = {} }) {
  // SVG ViewBox dimensions
  const viewBoxWidth = 840;
  const viewBoxHeight = 180;

  const leftMargin = 130;
  const gridWidth = 660; // 24 hours -> 27.5px per hour
  const hourStep = gridWidth / 24;

  const rowHeight = 35;
  const topMargin = 25;

  const rows = [
    { label: "1. OFF DUTY", code: "OFF", y: topMargin + 0 * rowHeight + 15, total: totals.off_duty_hours || 0 },
    { label: "2. SLEEPER BERTH", code: "SB", y: topMargin + 1 * rowHeight + 15, total: totals.sleeper_berth_hours || 0 },
    { label: "3. DRIVING", code: "D", y: topMargin + 2 * rowHeight + 15, total: totals.driving_hours || 0 },
    { label: "4. ON DUTY", code: "ON", y: topMargin + 3 * rowHeight + 15, total: totals.on_duty_hours || 0 }
  ];

  // Helper to convert hour (0 - 24) to SVG X coordinate
  const hourToX = (hour) => leftMargin + hour * hourStep;

  // Build continuous SVG path
  let pathD = "";
  if (segments && segments.length > 0) {
    let prevY = null;
    segments.forEach((seg, i) => {
      const x1 = hourToX(seg.start_hour);
      const x2 = hourToX(seg.end_hour);
      const row = rows[seg.status_index] || rows[0];
      const y = row.y;

      if (i === 0) {
        pathD += `M ${x1.toFixed(1)} ${y.toFixed(1)} L ${x2.toFixed(1)} ${y.toFixed(1)}`;
      } else {
        if (prevY !== y) {
          pathD += ` L ${x1.toFixed(1)} ${y.toFixed(1)}`;
        }
        pathD += ` L ${x2.toFixed(1)} ${y.toFixed(1)}`;
      }
      prevY = y;
    });
  }

  return (
    <div className="w-full overflow-x-auto bg-white border border-slate-300 rounded shadow-sm p-3">
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-auto min-w-[750px] select-none font-mono"
      >
        {/* Background */}
        <rect x="0" y="0" width={viewBoxWidth} height={viewBoxHeight} fill="#ffffff" />

        {/* Row backgrounds (alternating subtle tint) */}
        {rows.map((row, idx) => (
          <rect
            key={`row-bg-${idx}`}
            x={leftMargin}
            y={topMargin + idx * rowHeight}
            width={gridWidth}
            height={rowHeight}
            fill={idx % 2 === 0 ? "#f8fafc" : "#ffffff"}
            stroke="#cbd5e1"
            strokeWidth="0.5"
          />
        ))}

        {/* Hour Header Bar */}
        <rect x={leftMargin} y={topMargin - 18} width={gridWidth} height={18} fill="#1e293b" />
        {Array.from({ length: 25 }).map((_, h) => {
          const x = hourToX(h);
          const isNoon = h === 12;
          const isMidnight = h === 0 || h === 24;
          return (
            <g key={`hour-head-${h}`}>
              <text
                x={x}
                y={topMargin - 6}
                textAnchor="middle"
                fontSize={h === 0 || h === 24 ? "8" : "9"}
                fill="#ffffff"
                fontWeight={isNoon || isMidnight ? "bold" : "normal"}
              >
                {isMidnight ? (h === 0 ? "MID" : "24") : isNoon ? "NOON" : h}
              </text>
            </g>
          );
        })}

        {/* Vertical Grid Lines across rows */}
        {Array.from({ length: 25 }).map((_, h) => {
          const x = hourToX(h);
          return (
            <g key={`grid-v-${h}`}>
              {/* Full hour line */}
              <line
                x1={x}
                y1={topMargin}
                x2={x}
                y2={topMargin + 4 * rowHeight}
                stroke={h === 12 ? "#64748b" : "#94a3b8"}
                strokeWidth={h === 0 || h === 12 || h === 24 ? "1.5" : "0.75"}
              />

              {/* 30-minute and 15-minute sub ticks inside each hour (except at 24) */}
              {h < 24 && (
                <>
                  {/* 15 min */}
                  <line
                    x1={x + hourStep * 0.25}
                    y1={topMargin}
                    x2={x + hourStep * 0.25}
                    y2={topMargin + 4 * rowHeight}
                    stroke="#e2e8f0"
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                  />
                  {/* 30 min */}
                  <line
                    x1={x + hourStep * 0.5}
                    y1={topMargin}
                    x2={x + hourStep * 0.5}
                    y2={topMargin + 4 * rowHeight}
                    stroke="#cbd5e1"
                    strokeWidth="0.7"
                    strokeDasharray="3,2"
                  />
                  {/* 45 min */}
                  <line
                    x1={x + hourStep * 0.75}
                    y1={topMargin}
                    x2={x + hourStep * 0.75}
                    y2={topMargin + 4 * rowHeight}
                    stroke="#e2e8f0"
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                  />
                </>
              )}
            </g>
          );
        })}

        {/* Row Labels (Left Margin) */}
        {rows.map((row, idx) => (
          <g key={`label-${idx}`}>
            <rect
              x="0"
              y={topMargin + idx * rowHeight}
              width={leftMargin - 2}
              height={rowHeight}
              fill="#f1f5f9"
              stroke="#cbd5e1"
              strokeWidth="0.5"
            />
            <text
              x="8"
              y={topMargin + idx * rowHeight + 21}
              fontSize="10"
              fontWeight="600"
              fill="#0f172a"
              fontFamily="sans-serif"
            >
              {row.label}
            </text>
          </g>
        ))}

        {/* Right Margin: Totals Column */}
        <rect
          x={leftMargin + gridWidth + 2}
          y={topMargin - 18}
          width={45}
          height={18 + 4 * rowHeight}
          fill="#f8fafc"
          stroke="#94a3b8"
          strokeWidth="1"
        />
        <text
          x={leftMargin + gridWidth + 24}
          y={topMargin - 6}
          textAnchor="middle"
          fontSize="9"
          fontWeight="bold"
          fill="#1e293b"
          fontFamily="sans-serif"
        >
          TOTAL
        </text>

        {rows.map((row, idx) => (
          <text
            key={`tot-${idx}`}
            x={leftMargin + gridWidth + 24}
            y={topMargin + idx * rowHeight + 22}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#0284c7"
          >
            {row.total.toFixed(1)}
          </text>
        ))}

        {/* Active Duty Status Step Line */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="#0284c7"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  );
}
