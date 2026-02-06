import React, { useState } from 'react';
import { Table, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({ data }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('equipment_name');
    const [sortOrder, setSortOrder] = useState('asc');
    const itemsPerPage = 10;

    if (!data || data.length === 0) return null;

    const handleSort = (field) => {
        const isAsc = sortField === field && sortOrder === 'asc';
        setSortOrder(isAsc ? 'desc' : 'asc');
        setSortField(field);
    };

    const sortedData = [...data].sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const SortIcon = () => <ArrowUpDown size={14} className="inline ml-1 text-gray-400" />;

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-8">
            <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Table className="text-blue-600" /> Equipment Details
                </h2>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    Total: {data.length}
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                            <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('equipment_name')}>
                                Equipment Name <SortIcon />
                            </th>
                            <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('equipment_type')}>
                                Type <SortIcon />
                            </th>
                            <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('flowrate')}>
                                Flowrate (m³/h) <SortIcon />
                            </th>
                            <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('pressure')}>
                                Pressure (bar) <SortIcon />
                            </th>
                            <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('temperature')}>
                                Temp (°C) <SortIcon />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/30 transition-colors duration-150">
                                <td className="p-4 font-medium text-gray-900">{item.equipment_name}</td>
                                <td className="p-4"><span className="px-2 py-1 bg-gray-100 rounded text-gray-600 text-sm">{item.equipment_type}</span></td>
                                <td className="p-4 text-gray-700">{item.flowrate.toFixed(1)}</td>
                                <td className="p-4 text-gray-700">{item.pressure.toFixed(1)}</td>
                                <td className="p-4 text-gray-700 font-semibold text-blue-600">{item.temperature.toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                <p className="text-sm text-gray-500">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, data.length)} of {data.length}
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataTable;
