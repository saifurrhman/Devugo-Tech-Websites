import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { InvoiceAPI } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';

export default function CreateInvoice() {
    const navigate = useNavigate();
    const { success, error, warning } = useNotification();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        clientName: '',
        clientEmail: '',
        invoiceNumber: 'INV-' + Math.floor(Math.random() * 10000),
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        currency: 'USD',
        notes: '',
        items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
    });
    const [errors, setErrors] = useState({});

    function handleItemChange(index, field, value) {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        if (field === 'quantity' || field === 'rate') {
            newItems[index].amount = newItems[index].quantity * newItems[index].rate;
        }

        setFormData(prev => ({ ...prev, items: newItems }));
    }

    function addItem() {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
        }));
    }

    function removeItem(index) {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    }

    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.1; // 10% tax hardcoded for now
    const total = subtotal + tax;

    function validateForm() {
        const newErrors = {};
        if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required';
        if (!formData.clientEmail.trim()) newErrors.clientEmail = 'Client email is required';
        if (formData.clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
            newErrors.clientEmail = 'Invalid email format';
        }
        if (!formData.dueDate) newErrors.dueDate = 'Due date is required';

        if (formData.items.length === 0) {
            warning('Please add at least one item');
            return false;
        }

        let hasItemErrors = false;
        formData.items.forEach((item, index) => {
            if (!item.description.trim()) {
                warning(`Item ${index + 1} description is missing`);
                hasItemErrors = true;
            }
            if (item.quantity <= 0) {
                warning(`Item ${index + 1} quantity must be greater than 0`);
                hasItemErrors = true;
            }
            if (item.rate < 0) {
                warning(`Item ${index + 1} rate cannot be negative`);
                hasItemErrors = true;
            }
        });

        if (hasItemErrors) return false;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(status) {
        if (!validateForm()) {
            if (Object.keys(errors).length > 0) {
                warning('Please fix the errors in the form');
            }
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                status,
                subtotal,
                tax,
                total
            };

            await InvoiceAPI.create(payload);
            success(`Invoice ${status === 'sent' ? 'sent' : 'saved'} successfully!`);
            navigate('/admin/invoices');
        } catch (err) {
            console.error('Failed to create invoice:', err);
            error('Failed to create invoice. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">New Invoice</h1>
                        <p className="text-gray-400 text-sm mt-1">Create and send a new invoice</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleSubmit('draft')}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors text-sm"
                        >
                            Save Draft
                        </button>
                        <button
                            onClick={() => handleSubmit('sent')}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-sm font-medium"
                        >
                            {loading ? 'Processing...' : 'Send Invoice'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-8">
                            <div className="flex justify-between mb-8">
                                <div>
                                    <div className="text-xs text-gray-500 uppercase mb-1">From</div>
                                    <div className="font-bold text-lg">Your Company Name</div>
                                    <div className="text-gray-400 text-sm">billing@yourcompany.com</div>
                                    <div className="text-gray-400 text-sm">123 Business Rd, Tech City</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 uppercase mb-1">Invoice #</div>
                                    <div className="font-bold text-lg">{formData.invoiceNumber}</div>
                                    <div className="text-gray-400 text-sm mt-2">Date: {formData.date}</div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="text-xs text-gray-500 uppercase mb-2">Bill To</div>
                                <div className="space-y-2">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Client Name"
                                            value={formData.clientName}
                                            onChange={e => {
                                                setFormData({ ...formData, clientName: e.target.value });
                                                if (errors.clientName) setErrors({ ...errors, clientName: '' });
                                            }}
                                            className={`w-full max-w-md bg-[#0f172a] border ${errors.clientName ? 'border-red-500' : 'border-gray-700'} rounded px-3 py-2 text-white outline-none focus:border-blue-500`}
                                        />
                                        {errors.clientName && <p className="text-red-400 text-xs mt-1">{errors.clientName}</p>}
                                    </div>
                                    <div>
                                        <input
                                            type="email"
                                            placeholder="Client Email"
                                            value={formData.clientEmail}
                                            onChange={e => {
                                                setFormData({ ...formData, clientEmail: e.target.value });
                                                if (errors.clientEmail) setErrors({ ...errors, clientEmail: '' });
                                            }}
                                            className={`w-full max-w-md bg-[#0f172a] border ${errors.clientEmail ? 'border-red-500' : 'border-gray-700'} rounded px-3 py-2 text-white outline-none focus:border-blue-500`}
                                        />
                                        {errors.clientEmail && <p className="text-red-400 text-xs mt-1">{errors.clientEmail}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase border-b border-gray-700">
                                        <tr>
                                            <th className="py-2 w-1/2">Item Description</th>
                                            <th className="py-2 text-right">Qty</th>
                                            <th className="py-2 text-right">Rate</th>
                                            <th className="py-2 text-right">Amount</th>
                                            <th className="py-2 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {formData.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="py-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Item name"
                                                        value={item.description}
                                                        onChange={e => handleItemChange(index, 'description', e.target.value)}
                                                        className="w-full bg-transparent border-none outline-none text-white placeholder-gray-600"
                                                    />
                                                </td>
                                                <td className="py-4 text-right">
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                        className="w-16 bg-[#0f172a] border border-gray-700 rounded px-2 py-1 text-right outline-none"
                                                    />
                                                </td>
                                                <td className="py-4 text-right">
                                                    <input
                                                        type="number"
                                                        value={item.rate}
                                                        onChange={e => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                                                        className="w-24 bg-[#0f172a] border border-gray-700 rounded px-2 py-1 text-right outline-none"
                                                    />
                                                </td>
                                                <td className="py-4 text-right font-medium">${item.amount.toFixed(2)}</td>
                                                <td className="py-4 text-right">
                                                    {formData.items.length > 1 && (
                                                        <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300">×</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button onClick={addItem} className="mt-4 text-sm text-blue-400 hover:text-blue-300">+ Add Line Item</button>
                            </div>

                            <div className="flex justify-end border-t border-gray-800 pt-6">
                                <div className="w-64 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Subtotal</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Tax (10%)</span>
                                        <span>${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-700">
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                            <h3 className="font-semibold mb-4">Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={e => {
                                            setFormData({ ...formData, dueDate: e.target.value });
                                            if (errors.dueDate) setErrors({ ...errors, dueDate: '' });
                                        }}
                                        className={`w-full bg-[#0f172a] border ${errors.dueDate ? 'border-red-500' : 'border-gray-700'} rounded px-3 py-2 text-white outline-none`}
                                    />
                                    {errors.dueDate && <p className="text-red-400 text-xs mt-1">{errors.dueDate}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Currency</label>
                                    <select
                                        value={formData.currency}
                                        onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded px-3 py-2 text-white outline-none"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded px-3 py-2 text-white outline-none h-24 resize-none"
                                        placeholder="Payment terms, thank you note..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
