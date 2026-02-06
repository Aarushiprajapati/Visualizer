import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { LayoutDashboard } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Charts = ({ summary, rawData }) => {
    if (!summary || !rawData) return null;

    const typeData = {
        labels: Object.keys(summary.type_distribution),
        datasets: [
            {
                label: 'Equipment Count',
                data: Object.values(summary.type_distribution),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.6)',
                    'rgba(16, 185, 129, 0.6)',
                    'rgba(245, 158, 11, 0.6)',
                    'rgba(239, 68, 68, 0.6)',
                    'rgba(139, 92, 246, 0.6)',
                    'rgba(107, 114, 128, 0.6)',
                ],
                borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)',
                    'rgb(139, 92, 246)',
                    'rgb(107, 114, 128)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const trendData = {
        labels: rawData.map((_, i) => `Eq ${i + 1}`),
        datasets: [
            {
                label: 'Temperature (°C)',
                data: rawData.map(d => d.temperature),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
                tension: 0.3,
            },
            {
                label: 'Flowrate (m³/h)',
                data: rawData.map(d => d.flowrate),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3,
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <LayoutDashboard className="text-blue-600" /> Analytics Dashboard
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center">
                    <h3 className="text-lg font-bold mb-4 text-gray-700">Type Distribution</h3>
                    <div className="w-full h-64 flex justify-center">
                        <Pie data={typeData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 text-gray-700">Parameter Overview</h3>
                    <div className="w-full h-64">
                        <Bar data={typeData} options={chartOptions} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 lg:col-span-2">
                    <h3 className="text-lg font-bold mb-4 text-gray-700">Data Trends (Flowrate vs Temp)</h3>
                    <div className="w-full h-80">
                        <Line data={trendData} options={chartOptions} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-md text-white">
                    <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Avg Flowrate</p>
                    <p className="text-3xl font-bold mt-1">{summary.avg_flowrate.toFixed(2)} m³/h</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl shadow-md text-white">
                    <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider">Avg Pressure</p>
                    <p className="text-3xl font-bold mt-1">{summary.avg_pressure.toFixed(2)} bar</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-xl shadow-md text-white">
                    <p className="text-amber-100 text-sm font-semibold uppercase tracking-wider">Avg Temp</p>
                    <p className="text-3xl font-bold mt-1">{summary.avg_temperature.toFixed(2)} °C</p>
                </div>
            </div>
        </div>
    );
};

export default Charts;
