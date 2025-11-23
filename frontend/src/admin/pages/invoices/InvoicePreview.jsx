import React from 'react';

export default function InvoicePreview() {
    return (
        <div className="bg-white text-gray-900 p-8 min-h-[800px]">
            <div className="flex justify-between mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">INVOICE</h1>
                    <div className="text-gray-500">#INV-001</div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-xl mb-1">Your Company Name</div>
                    <div className="text-gray-500 text-sm">123 Business Rd</div>
                    <div className="text-gray-500 text-sm">Tech City, TC 90210</div>
                </div>
            </div>

            <div className="flex justify-between mb-12">
                <div>
                    <div className="text-xs font-bold text-gray-400 uppercase mb-2">Bill To</div>
                    <div className="font-bold text-lg">Acme Corp</div>
                    <div className="text-gray-500 text-sm">456 Industry Ave</div>
                    <div className="text-gray-500 text-sm">Metropolis, NY 10012</div>
                </div>
                <div className="text-right">
                    <div className="mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase mr-4">Date</span>
                        <span className="font-medium">Jun 15, 2024</span>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase mr-4">Due Date</span>
                        <span className="font-medium">Jun 30, 2024</span>
                    </div>
                </div>
            </div>

            <table className="w-full mb-12">
                <thead>
                    <tr className="border-b-2 border-gray-100">
                        <th className="text-left py-3 text-xs font-bold text-gray-400 uppercase">Description</th>
                        <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase">Qty</th>
                        <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase">Rate</th>
                        <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-gray-50">
                        <td className="py-4 font-medium">Website Redesign - Phase 1</td>
                        <td className="py-4 text-right">1</td>
                        <td className="py-4 text-right">$3,000.00</td>
                        <td className="py-4 text-right font-bold">$3,000.00</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                        <td className="py-4 font-medium">SEO Optimization Setup</td>
                        <td className="py-4 text-right">1</td>
                        <td className="py-4 text-right">$2,000.00</td>
                        <td className="py-4 text-right font-bold">$2,000.00</td>
                    </tr>
                </tbody>
            </table>

            <div className="flex justify-end mb-12">
                <div className="w-64">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-medium">$5,000.00</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Tax (0%)</span>
                        <span className="font-medium">$0.00</span>
                    </div>
                    <div className="flex justify-between py-4">
                        <span className="font-bold text-xl">Total</span>
                        <span className="font-bold text-xl text-blue-600">$5,000.00</span>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-8">
                <h4 className="font-bold text-sm mb-2">Notes</h4>
                <p className="text-gray-500 text-sm">Thank you for your business! Please make payment within 15 days.</p>
            </div>
        </div>
    );
}
