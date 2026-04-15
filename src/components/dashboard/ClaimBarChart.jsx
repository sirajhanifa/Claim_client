import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell
} from 'recharts';

// Elegant, distinct colors 
const COLORS = [
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16'  // lime
];

const formatAmount = (value) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-sm border border-slate-100 rounded-2xl shadow-xl px-5 py-3">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                    ₹{payload[0].value.toLocaleString('en-IN')}
                </p>
            </div>
        );
    }
    return null;
};

const CustomXAxisTick = ({ x, y, payload }) => {
    const words = payload.value?.split(' ') || [];
    const lines = [];
    let current = '';
    words.forEach(word => {
        if ((current + ' ' + word).trim().length > 12) {
            if (current) lines.push(current.trim());
            current = word;
        } else {
            current = (current + ' ' + word).trim();
        }
    });
    if (current) lines.push(current.trim());

    return (
        <g transform={`translate(${x},${y})`}>
            {lines.map((line, i) => (
                <text
                    key={i}
                    x={0}
                    y={0}
                    dy={12 + i * 14}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize={11}
                    fontWeight={450}
                    className="font-sans"
                >
                    {line}
                </text>
            ))}
        </g>
    );
};

const ClaimBarChart = ({ data }) => {
    const barSize = Math.max(32, Math.min(70, Math.floor(500 / (data.length || 1)) - 8));
    const bottomMargin = data.some(d => d.name?.length > 12) ? 50 : 24;

    return (
        <div className="w-full">
            <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                    Claim Amount by Type
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    Total amount across all claim categories
                </p>
            </div>

            <ResponsiveContainer width="100%" height={360}>
                <BarChart
                    data={data}
                    margin={{ top: 32, right: 16, left: 0, bottom: bottomMargin }}
                    barSize={barSize}
                    barGap={8}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e9eef3"
                        vertical={false}
                        strokeWidth={0.8}
                    />
                    <XAxis
                        dataKey="name"
                        tick={<CustomXAxisTick />}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                    />
                    <YAxis
                        tickFormatter={formatAmount}
                        tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 450 }}
                        axisLine={false}
                        tickLine={false}
                        width={55}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', opacity: 0.6 }} />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                        <LabelList
                            dataKey="amount"
                            position="top"
                            content={({ value, x, y, width, height }) => {
                                if (height < 22) return null;
                                return (
                                    <text
                                        x={x + width / 2}
                                        y={y - 8}
                                        textAnchor="middle"
                                        fill="#1e293b"
                                        fontSize={12}
                                        fontWeight={600}
                                        className="font-mono"
                                    >
                                        {formatAmount(value)}
                                    </text>
                                );
                            }}
                        />
                        {data.map((_, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                stroke="rgba(255,255,255,0.3)"
                                strokeWidth={1}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ClaimBarChart;