import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History as HistoryIcon, FileText, Download, Calendar } from 'lucide-react';

const History = ({ currentDatasetId }) => {
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/datasets/');
            setDatasets(response.data);
        } catch (err) {
            console.error('Failed to fetch history', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [currentDatasetId]);

    const handleDownloadPDF = (id, name) => {
        window.open(`http://127.0.0.1:8000/api/datasets/${id}/pdf/`, '_blank');
    };

    if (loading) return <div className="text-center p-12 text-gray-400 animate-pulse">Loading history...</div>;
    if (datasets.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <HistoryIcon className="text-blue-600" /> Recent Uploads
            </h2>

            <div className="space-y-4">
                {datasets.map((ds) => (
                    <div key={ds.id} className="group p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{ds.name}</h3>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(ds.upload_time).toLocaleString()}</span>
                                    <span className="bg-gray-200 px-2 py-0.5 rounded text-xs px-1.5">{ds.row_count} records</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handleDownloadPDF(ds.id, ds.name)}
                            className="flex items-center gap-2 bg-white border border-blue-200 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-md"
                        >
                            <Download size={18} /> PDF Report
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default History;
