import React, { useState } from 'react';
import axios from 'axios';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
        setSuccess(false);
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess(true);
            onUploadSuccess(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to upload file');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 transition-all hover:shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <Upload className="text-blue-600" /> Upload CSV Data
            </h2>
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2.5 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100 transition-all cursor-pointer"
                    />
                </div>
                <button
                    onClick={handleUpload}
                    disabled={loading || !file}
                    className={`w-full md:w-auto px-8 py-2.5 rounded-full font-bold text-white transition-all transform active:scale-95 ${loading || !file ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg'
                        }`}
                >
                    {loading ? 'Processing...' : 'Upload & Analyze'}
                </button>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 animate-pulse">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            {success && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                    <CheckCircle size={20} /> File uploaded successfully!
                </div>
            )}
        </div>
    );
};

export default FileUpload;
