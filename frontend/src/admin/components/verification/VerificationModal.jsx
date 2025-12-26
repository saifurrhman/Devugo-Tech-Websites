import React from 'react';
import { X, CheckCircle, AlertTriangle, Shield, Mail, Server } from 'lucide-react';

export default function VerificationDetailsModal({ isOpen, onClose, data, loading }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white text-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">

                {/* Header */}
                <div className="flex justify-center pt-8 pb-4 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${loading ? 'border-gray-200 bg-gray-50' :
                            data?.is_safe_to_send ? 'border-green-100 bg-green-50 text-green-500' :
                                'border-red-100 bg-red-50 text-red-500'
                        }`}>
                        {loading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                        ) : (
                            <span className="text-4xl font-bold">?</span> // Icon placeholder 
                        )}
                        {!loading && (data?.is_safe_to_send ? <CheckCircle size={40} /> : <AlertTriangle size={40} />)}
                    </div>
                </div>

                {/* Status Title */}
                <div className="text-center mb-6 px-6">
                    <h2 className="text-2xl font-bold uppercase tracking-wider text-gray-700">
                        {loading ? 'VERIFYING...' : (data?.status || 'UNKNOWN')}
                    </h2>
                </div>

                {/* Loading Skeleton or Data */}
                {loading ? (
                    <div className="p-8 space-y-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                ) : (
                    <div className="px-8 pb-8 text-sm space-y-2 font-mono text-gray-600">
                        <div className="flex justify-between">
                            <span className="font-bold text-gray-800">email:</span>
                            <span className="text-blue-600">{data.email}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="font-bold text-gray-800">status:</span>
                            <span className="italic">{data.status}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="font-bold text-gray-800">overall_score:</span>
                            <span className="italic">{data.overall_score}/100</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="font-bold text-gray-800">is_safe_to_send:</span>
                            <span className={data.is_safe_to_send ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                                {String(data.is_safe_to_send)}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="font-bold text-gray-800">is_valid_syntax:</span>
                            <span className={data.is_valid_syntax ? 'text-green-600' : 'text-red-500'}>{String(data.is_valid_syntax)}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="font-bold text-gray-800">is_disposable:</span>
                            <span className={!data.is_disposable ? 'text-green-600' : 'text-red-500'}>{String(data.is_disposable)}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="font-bold text-gray-800">mx_accepts_mail:</span>
                            <span className={data.mx_accepts_mail ? 'text-green-600' : 'text-red-500'}>{String(data.mx_accepts_mail)}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="font-bold text-gray-800">mx_records:</span>
                            <span className="truncate max-w-[150px]" title={data.mx_records}>{data.mx_records || 'null'}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="font-bold text-gray-800">can_connect_smtp:</span>
                            <span className={data.can_connect_smtp ? 'text-green-600' : 'text-gray-400'}>{String(!!data.can_connect_smtp)}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="font-bold text-gray-800">is_deliverable:</span>
                            <span className={data.is_deliverable ? 'text-green-600' : 'text-red-500'}>{String(!!data.is_deliverable)}</span>
                        </div>

                    </div>
                )}

                <div className="bg-gray-100 p-4 flex justify-center">
                    <button
                        onClick={onClose}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20"
                    >
                        OK
                    </button>
                </div>

            </div>
        </div>
    );
}
