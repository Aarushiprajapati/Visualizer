import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';
import Charts from './components/Charts';
import History from './components/History';
import { Microscope, Download } from 'lucide-react';
import './App.css';

function App() {
  const [currentDataset, setCurrentDataset] = useState(null);
  const [equipmentData, setEquipmentData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUploadSuccess = (dataset) => {
    fetchDatasetDetails(dataset.id);
  };

  const fetchDatasetDetails = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/datasets/${id}/`);
      setCurrentDataset(response.data);
      setEquipmentData(response.data.equipment);
    } catch (err) {
      console.error('Error fetching dataset details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (currentDataset) {
      window.open(`http://127.0.0.1:8000/api/datasets/${currentDataset.id}/pdf/`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Microscope className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Chem<span className="text-blue-600">Viz</span> Pro
              </h1>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
              <span className="hidden sm:inline">User: Maintenance Eng.</span>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm">
                ME
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Equipment Parameter Visualizer</h2>
          <p className="text-gray-500 text-lg">Upload equipment data to generate real-time analytics and technical reports.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2">
            <FileUpload onUploadSuccess={handleUploadSuccess} />

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-4 text-gray-500 font-medium">Analyzing data...</span>
              </div>
            ) : currentDataset ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Results for {currentDataset.name}</h3>
                  <button
                    onClick={handleDownloadReport}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-bold transition-all shadow-md active:scale-95"
                  >
                    <Download size={18} /> Download Report
                  </button>
                </div>
                <Charts summary={currentDataset.summary} rawData={equipmentData} />
                <DataTable data={equipmentData} />
              </>
            ) : (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-20 text-center">
                <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                  <Microscope size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No data analyzed yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">Upload a chemical equipment CSV file (Equipment Name, Type, Flowrate, Pressure, Temperature) to see the dashboard.</p>
              </div>
            )}
          </div>

          <div className="xl:col-span-1">
            <History currentDatasetId={currentDataset?.id} />
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-3">Professional Analytics</h3>
                <p className="text-indigo-100 mb-6 opacity-90">Generate comprehensive equipment performance reports for stakeholders instantly.</p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm"><span className="h-1.5 w-1.5 bg-white rounded-full"></span> Comparative Trend Analysis</li>
                  <li className="flex items-center gap-2 text-sm"><span className="h-1.5 w-1.5 bg-white rounded-full"></span> Equipment Distribution Charts</li>
                  <li className="flex items-center gap-2 text-sm"><span className="h-1.5 w-1.5 bg-white rounded-full"></span> Automated PDF Generation</li>
                </ul>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <Microscope size={200} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-200 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">© 2026 ChemViz Pro - Chemical Equipment Parameter Visualizer</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
