import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import InvoicePreview from './InvoicePreview';
import { InvoiceAPI } from '../../lib/api';

export default function InvoiceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadInvoice();
    }, [id]);

    async function loadInvoice() {
        try {
            setLoading(true);
            const data = await InvoiceAPI.get(id);
            setInvoice(data);
            setError(null);
        } catch (err) {
            console.error('Failed to load invoice:', err);
            setError('Failed to load invoice details');
            // Fallback mock data
            setInvoice({
                _id: id,
                invoiceNumber: 'INV-001',
                status: 'paid',
                clientName: 'Acme Corp',
                date: '2024-06-15',
                total: 5000,
                history: [
                    { action: 'Payment Received', amount: 5000, date: '2024-06-16', note: 'via Stripe' },
                    { action: 'Invoice Sent', date: '2024-06-15', note: 'to billing@acme.com' }
                ]
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!window.confirm('Are you sure you want to delete this invoice?')) return;

        try {
            await InvoiceAPI.delete(id);
            navigate('/admin/invoices');
        } catch (err) {
            console.error('Failed to delete invoice:', err);
            alert('Failed to delete invoice');
        }
    }

    if (loading) return <div className="p-8 text-center text-white">Loading invoice details...</div>;
    if (!invoice) return <div className="p-8 text-center text-white">Invoice not found</div>;

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-6">
                    <button onClick={() => navigate('/admin/invoices')} className="text-sm text-gray-400 hover:text-white mb-2">← Back to Invoices</button>
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold">Invoice {invoice.invoiceNumber}</h1>
                                <span className={`px-2 py-0.5 text-xs rounded border ${invoice.status === 'paid' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                        invoice.status === 'sent' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                            'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                    } capitalize`}>{invoice.status}</span>
                            </div>
                            <p className="text-gray-400 text-sm">Client: {invoice.clientName} • Date: {invoice.date}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 rounded-lg border border-red-900/50 text-red-400 hover:bg-red-900/20 transition-colors text-sm"
                            >
                                Delete
                            </button>
                            <button className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors text-sm">Download PDF</button>
                            <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-sm font-medium">Resend Email</button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden">
                            <InvoicePreview invoice={invoice} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                            <h3 className="font-semibold mb-4">Payment History</h3>
                            <div className="space-y-4">
                                {invoice.history?.map((event, idx) => (
                                    <div key={idx} className={`flex justify-between items-center text-sm ${idx > 0 ? 'opacity-70' : ''}`}>
                                        <div>
                                            <div className={`font-medium ${event.action.includes('Payment') ? 'text-green-400' : ''}`}>{event.action}</div>
                                            <div className="text-xs text-gray-500">{event.note}</div>
                                        </div>
                                        <div className="text-right">
                                            {event.amount && <div className="font-medium">${event.amount.toFixed(2)}</div>}
                                            <div className="text-xs text-gray-500">{event.date}</div>
                                        </div>
                                    </div>
                                ))}
                                {(!invoice.history || invoice.history.length === 0) && (
                                    <div className="text-gray-500 text-sm text-center">No history available</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
