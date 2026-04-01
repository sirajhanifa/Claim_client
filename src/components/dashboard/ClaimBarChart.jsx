import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f43f5e', '#a3e635'];

const formatAmount = (value) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-4 py-3 max-w-[200px]">
        <p className="text-sm font-semibold text-slate-700 mb-1 break-words">{label}</p>
        <p className="text-sm text-slate-500">
          Amount: <span className="font-bold text-slate-800">₹{payload[0].value.toLocaleString('en-IN')}</span>
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
          fontWeight={500}
        >
          {line}
        </text>
      ))}
    </g>
  );
};

const ClaimBarChart = ({ data }) => {
  const barSize = Math.max(24, Math.min(56, Math.floor(600 / (data.length || 1)) - 16));
  const bottomMargin = data.some(d => d.name?.length > 12) ? 50 : 20;

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Claim Amount by Type</h3>
        <p className="text-sm text-slate-500 mt-1">Total amount across all claim categories</p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: bottomMargin }} barSize={barSize}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="name"
            tick={<CustomXAxisTick />}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tickFormatter={formatAmount}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClaimBarChart;
