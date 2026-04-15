import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const ClaimPieChart = ({ title, data, colors }) => {
    const values = data.map(item => Number(item?.value) || 0);
    const labels = data.map(item => item?.name || 'Unknown');
    const total = values.reduce((sum, value) => sum + value, 0);

    const chartData = {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor: colors,
                borderColor: 'white',
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            centerText: {
                text: title,
                color: '#1e293b',
                font: '600 18px Inter, system-ui',
            },
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || 'Unknown';
                        const value = Number(context.raw) || 0;
                        const percentage = total ? ((value / total) * 100).toFixed(1) : '0.0';
                        return `${label}: ${value.toLocaleString('en-IN')} (${percentage}%)`;
                    },
                },
                backgroundColor: 'white',
                titleColor: '#1e293b',
                bodyColor: '#475569',
                borderColor: '#e2e8f0',
                borderWidth: 1,
            },
            datalabels: {
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: 12,
                color: 'white',
                font: { weight: 'bold', size: 12 },
                padding: { left: 6, right: 6, top: 4, bottom: 4 },
                formatter: (value) => {
                    const numericValue = Number(value) || 0;
                    if (!total || numericValue === 0) return '';
                    const percentage = ((numericValue / total) * 100).toFixed(1);
                    return `${percentage}%`;
                },
                anchor: 'center',
                align: 'center',
            },
        },
    };

    return (
        <div className="w-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">{title}</h3>
            <div style={{ height: '280px', position: 'relative' }}>
                <Pie data={chartData} options={options} />
            </div>
            <div className="grid gap-2 text-sm" style={{ marginTop: '30px' }}>
                {data.map((item, index) => {
                    const value = Number(item?.value) || 0;
                    return (
                        <div key={`${item?.name}-${index}`} className="flex items-center gap-3">
                            <span className="inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: colors[index] || '#94a3b8' }} />
                            <span className="flex-1 text-slate-600">{item?.name || 'Unknown'}</span>
                            <span className="font-semibold text-slate-800">{value.toLocaleString('en-IN')}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ClaimPieChart;