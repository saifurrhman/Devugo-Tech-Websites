import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { useNotification } from '../../../contexts/NotificationContext';
import { ContactAPI, ListAPI } from '../../../lib/api';
import CustomSelect from '../../../components/CustomSelect';
import { Upload, X, Check, FileText, ChevronRight } from 'lucide-react';

export default function ContactsUpload() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get('returnUrl');
    const { success, error: notifyError } = useNotification();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [mapping, setMapping] = useState({});
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Upload, 2: Map & Preview
    const [verifyAfterImport, setVerifyAfterImport] = useState(false);

    // List support
    const [lists, setLists] = useState([]);
    const [selectedListId, setSelectedListId] = useState('');

    useEffect(() => {
        loadLists();
    }, []);

    const loadLists = async () => {
        try {
            const data = await ListAPI.list();
            if (Array.isArray(data)) {
                setLists(data);
            }
        } catch (err) {
            console.error('Failed to load lists', err);
        }
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            if (selected.type !== 'text/csv' && !selected.name.endsWith('.csv')) {
                notifyError('Please upload a CSV file.');
                return;
            }
            setFile(selected);
            parseCSV(selected);
        }
    };

    const parseCSV = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
            if (lines.length === 0) {
                notifyError('File is empty.');
                return;
            }
            const headerLine = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            setHeaders(headerLine);

            const previewData = lines.slice(1, 6).map(line => {
                const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                const row = {};
                headerLine.forEach((h, i) => {
                    row[h] = values[i] || '';
                });
                return row;
            });

            setPreview(previewData);

            // Auto-map common fields
            const newMapping = {};
            headerLine.forEach(h => {
                const lower = h.toLowerCase();
                if (lower.includes('name')) newMapping[h] = 'name';
                else if (lower.includes('email')) newMapping[h] = 'email';
                else if (lower.includes('phone')) newMapping[h] = 'phone';
                else if (lower.includes('company')) newMapping[h] = 'company';
            });
            setMapping(newMapping);

            setStep(2);
        };
        reader.readAsText(file);
    };

    const handleMapChange = (csvHeader, dbField) => {
        setMapping(prev => ({
            ...prev,
            [csvHeader]: dbField
        }));
    };

    const handleImport = async () => {
        if (!file) return;

        // Validate mapping
        if (!Object.values(mapping).includes('email')) {
            if (!window.confirm('No column mapped to "Email". Are you sure?')) return;
        }

        setLoading(true);

        // Parse full file
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
            const headerLine = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

            const contactsToImport = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                const contact = {};
                headerLine.forEach((h, i) => {
                    const dbField = mapping[h];
                    if (dbField && dbField !== 'ignore') {
                        contact[dbField] = values[i] || '';
                    }
                });
                // Default status
                if (!contact.status) contact.status = 'Unverified';
                contact.source = 'Import';
                return contact;
            }).filter(c => c.email); // Filter out rows without email if mapped

            // Use legacy method sending array if no list, else object
            const payload = selectedListId
                ? { contacts: contactsToImport, listId: selectedListId }
                : contactsToImport;

            try {
                const res = await ContactAPI.import(payload);
                setLoading(false);

                if (res.success) {
                    const importedCount = (res.count !== undefined) ? res.count : 0;
                    let msg = `Successfully imported ${importedCount} contacts.`;

                    if (res.errors && res.errors.length > 0) {
                        msg += ` (${res.errors.length} failed). Check console for details.`;
                        console.error('Import Errors:', res.errors);
                        notifyError(`${res.errors.length} contacts failed to import. See console.`);
                    }

                    if (importedCount === 0 && (!res.errors || res.errors.length === 0)) {
                        notifyError('Imported 0 contacts. They may already exist (duplicates) or be invalid.');
                    } else {
                        if (verifyAfterImport) {
                            try {
                                const emails = contactsToImport.map(c => c.email);
                                await ContactAPI.verifyBatch(emails);
                                msg += ' Verification completed.';
                            } catch (vErr) {
                                console.error('Verification failed', vErr);
                                msg += ' However, verification failed.';
                            }
                        }
                        success(msg);
                        navigate(returnUrl || '/admin/recipients');
                    }
                } else {
                    notifyError(res.message || 'Import failed.');
                }
            } catch (err) {
                setLoading(false);
                console.error(err);
                notifyError('Import request failed.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">Import Contacts</h1>
                        <button onClick={() => navigate('/admin/recipients')} className="text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="card bg-[#1e293b] border border-gray-800 rounded-xl p-8">
                        {step === 1 ? (
                            <>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Add to List (Optional)
                                    </label>
                                    <CustomSelect
                                        value={selectedListId}
                                        onChange={(val) => setSelectedListId(val)}
                                        placeholder="-- No specific list --"
                                        options={[
                                            { value: '', label: '-- No specific list --' },
                                            ...lists.map(list => ({
                                                value: list._id,
                                                label: `${list.name} (${list.count} contacts)`
                                            }))
                                        ]}
                                        className="w-full"
                                    />
                                </div>

                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-xl p-12 transition-colors hover:border-blue-500 hover:bg-gray-800/50">
                                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 text-blue-400">
                                        <Upload size={32} />
                                    </div>
                                    <h3 className="text-lg font-medium mb-2">Upload CSV File</h3>
                                    <p className="text-gray-400 text-sm mb-6 text-center max-w-sm">
                                        Drag and drop your CSV file here, or click to browse.
                                        File should contain headers like Name, Email, Phone.
                                    </p>
                                    <label className="btn-primary bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-lg cursor-pointer">
                                        <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                                        Select File
                                    </label>
                                </div>
                            </>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between gap-4 mb-6 p-4 bg-[#0f172a] border border-gray-700 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-500/10 rounded text-blue-400">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{file?.name}</div>
                                            <div className="text-xs text-gray-400">{(file?.size / 1024).toFixed(1)} KB • {headers.length} columns</div>
                                        </div>
                                    </div>
                                    <button onClick={() => setStep(1)} className="text-sm text-blue-400 hover:text-blue-300 hover:underline">Change File</button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                                    {/* Mapping Section */}
                                    <div className="lg:col-span-5 flex flex-col h-[500px]">
                                        <h3 className="font-bold text-gray-300 mb-4 flex items-center gap-2">
                                            Map Columns <span className="text-xs font-normal text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{headers.length} found</span>
                                        </h3>
                                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                            {headers.map(header => (
                                                <div key={header} className="flex items-center justify-between p-3 bg-[#0f172a] border border-gray-800 rounded-lg group hover:border-gray-700 transition-colors">
                                                    <span className="text-sm text-gray-400 font-medium truncate max-w-[150px]" title={header}>{header}</span>

                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-600 text-xs">→</span>
                                                        <select
                                                            className={`bg-[#002747] text-sm rounded px-3 py-1.5 outline-none min-w-[140px] transition-colors border ${mapping[header] ? 'border-blue-500 text-white' : 'border-white/10 text-gray-400'}`}
                                                            value={mapping[header] || ''}
                                                            onChange={(e) => handleMapChange(header, e.target.value)}
                                                        >
                                                            <option value="" className="bg-[#002747] text-white">Ignore</option>
                                                            <optgroup label="Contact Fields" className="bg-[#002747] text-white">
                                                                <option value="name" className="bg-[#002747] text-white py-2">Full Name</option>
                                                                <option value="email" className="bg-[#002747] text-white py-2">Email Address</option>
                                                                <option value="phone" className="bg-[#002747] text-white py-2">Phone Number</option>
                                                                <option value="company" className="bg-[#002747] text-white py-2">Company</option>
                                                                <option value="jobTitle" className="bg-[#002747] text-white py-2">Job Title</option>
                                                                <option value="website" className="bg-[#002747] text-white py-2">Website</option>
                                                                <option value="city" className="bg-[#002747] text-white py-2">City</option>
                                                                <option value="country" className="bg-[#002747] text-white py-2">Country</option>
                                                                <option value="tags" className="bg-[#002747] text-white py-2">Tags</option>
                                                            </optgroup>
                                                        </select>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Preview Section */}
                                    <div className="lg:col-span-7 flex flex-col h-[500px]">
                                        <h3 className="font-bold text-gray-300 mb-4">Data Preview</h3>
                                        <div className="flex-1 overflow-auto border border-gray-800 rounded-xl bg-[#0f172a] custom-scrollbar">
                                            <table className="w-full text-xs text-left whitespace-nowrap">
                                                <thead className="bg-gray-800/50 text-gray-400 font-medium sticky top-0 z-10 backdrop-blur-sm">
                                                    <tr>
                                                        <th></th>
                                                        {headers.map(h => (
                                                            <th key={h} className="px-4 py-3 border-b border-gray-700">
                                                                <div className="flex flex-col gap-1">
                                                                    <span>{h}</span>
                                                                    {mapping[h] && <span className="text-[10px] text-blue-400 font-normal">{mapping[h]}</span>}
                                                                </div>
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-800 text-gray-300">
                                                    {preview.map((row, i) => (
                                                        <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                                                            <td className="px-2 py-3 text-gray-600 border-r border-gray-800/50 text-[10px] text-center">{i + 1}</td>
                                                            {headers.map(h => <td key={h} className="px-4 py-3">{row[h]}</td>)}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-800">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={verifyAfterImport}
                                                onChange={(e) => setVerifyAfterImport(e.target.checked)}
                                                className="peer hidden"
                                            />
                                            <div className="w-9 h-5 bg-gray-700 rounded-full peer-checked:bg-green-600 transition-colors"></div>
                                            <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text - sm font - medium transition - colors ${verifyAfterImport ? 'text-white' : 'text-gray-400'} `}>Verify emails automatically</span>
                                            <span className="text-xs text-gray-500">Checks for valid syntax and active mailboxes (slower)</span>
                                        </div>
                                    </label>

                                    <button
                                        onClick={handleImport}
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>{verifyAfterImport && loading ? 'Importing & Verifying...' : 'Importing Contacts...'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Import {preview.length > 5 ? 'All' : ''} Contacts</span>
                                                <Check size={18} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
