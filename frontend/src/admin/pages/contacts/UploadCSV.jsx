import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function UploadCSV() {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Import Contacts</h1>
                    <p className="text-gray-400 text-sm mt-1">Upload a CSV file to bulk import contacts</p>
                </div>

                <div className="max-w-2xl mx-auto">
                    <div
                        className={`card bg-[#1e293b] rounded-xl border-2 border-dashed p-10 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        {!file ? (
                            <>
                                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                                    📄
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Drag & Drop your CSV here</h3>
                                <p className="text-gray-400 mb-6">or click to browse from your computer</p>
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept=".csv"
                                    onChange={handleChange}
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="btn-primary bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg cursor-pointer inline-block font-medium transition-colors"
                                >
                                    Select File
                                </label>
                                <p className="text-xs text-gray-500 mt-4">Supported format: .csv (Max 5MB)</p>
                            </>
                        ) : (
                            <div className="py-8">
                                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
                                <h3 className="text-lg font-semibold mb-1">{file.name}</h3>
                                <p className="text-gray-400 text-sm mb-6">{(file.size / 1024).toFixed(2)} KB</p>
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={() => setFile(null)}
                                        className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        Remove
                                    </button>
                                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors">
                                        Upload & Process
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        <h3 className="font-semibold mb-3">Instructions</h3>
                        <ul className="list-disc list-inside text-sm text-gray-400 space-y-2">
                            <li>Your CSV must contain an <strong>email</strong> column.</li>
                            <li>Optional columns: <strong>name</strong>, <strong>company</strong>, <strong>phone</strong>.</li>
                            <li>First row should be the header row.</li>
                            <li><a href="#" className="text-blue-400 hover:underline">Download sample CSV</a></li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}
