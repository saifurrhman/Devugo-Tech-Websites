import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Copy, AlertCircle, Globe, Loader2 } from 'lucide-react';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { useNotification } from '../../../contexts/NotificationContext';
import { SenderAPI } from '../../../lib/api';

const DomainDNS = () => {
    const { domain } = useParams();
    const navigate = useNavigate();
    const { success, error: notifyError } = useNotification();
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [dnsRecords, setDnsRecords] = useState(null);

    useEffect(() => {
        fetchDnsRecords();
    }, [domain]);

    const fetchDnsRecords = async () => {
        setLoading(true);
        try {
            const data = await SenderAPI.domains.get(domain);
            setDnsRecords(data);
        } catch (err) {
            notifyError('Failed to fetch DNS records');
            navigate('/admin/settings/senders');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyLike = async () => {
        setVerifying(true);
        try {
            await SenderAPI.domains.verify(domain);
            success('Verification triggered. Refreshing status...');
            await fetchDnsRecords();
        } catch (err) {
            notifyError('Verification failed. Check your configuration.');
        } finally {
            setVerifying(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        success('Copied to clipboard');
    };

    const DNSRecordItem = ({ title, type, name, value, verified }) => (
        <div className="mb-8 last:mb-0">
            <h4 className="text-lg font-bold text-white mb-4">{title}</h4>

            <div className="space-y-4">
                {/* Type Row */}
                <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-400">Type</label>
                    </div>
                    <div className="col-span-6">
                        <div className="bg-[#001e38] border border-white/10 rounded px-3 py-2 text-sm text-gray-300 font-mono">
                            {type}
                        </div>
                    </div>
                </div>

                {/* Name Row */}
                <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-400">Name</label>
                    </div>
                    <div className="col-span-6">
                        <div className="bg-[#001e38] border border-white/10 rounded px-3 py-2 text-sm text-gray-300 font-mono truncate">
                            {name}
                        </div>
                    </div>
                    <div className="col-span-4">
                        <button
                            onClick={() => copyToClipboard(name)}
                            className="text-sm text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1.5 transition-colors"
                        >
                            <Copy size={14} /> Copy {title.toLowerCase().includes('code') ? 'code' : 'record'} name
                        </button>
                    </div>
                </div>

                {/* Value Row */}
                <div className="grid grid-cols-12 gap-4 items-start">
                    <div className="col-span-2 pt-2">
                        <label className="text-sm font-medium text-gray-400">Value</label>
                    </div>
                    <div className="col-span-6">
                        <div className="bg-[#001e38] border border-white/10 rounded px-3 py-2 text-sm text-gray-300 font-mono break-all leading-relaxed">
                            {value}
                        </div>
                        {verified && (
                            <div className="flex items-center gap-2 mt-2 text-green-400 text-xs">
                                <CheckCircle size={14} />
                                <span>The record matches your configuration.</span>
                            </div>
                        )}
                    </div>
                    <div className="col-span-4 pt-2">
                        <button
                            onClick={() => copyToClipboard(value)}
                            className="text-sm text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1.5 transition-colors"
                        >
                            <Copy size={14} /> Copy {title.toLowerCase().includes('code') ? 'code' : 'record'} value
                        </button>
                    </div>
                </div>
            </div>
            <div className="h-px bg-white/5 my-8 w-full" />
        </div>
    );

    return (
        <div className="admin-layout min-h-screen bg-[#002747] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-8 py-8">
                <AdminTopbar />

                <div className="max-w-5xl mx-auto mt-6">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => navigate('/admin/settings/senders')}
                            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors text-sm font-medium"
                        >
                            <ArrowLeft size={16} /> Back to domains
                        </button>
                        <h1 className="text-3xl font-bold text-white mb-2">{domain}</h1>
                        <p className="text-gray-400">DNS records for domain authentication</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Alert Info */}
                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3 items-start">
                                <div className="mt-0.5"><AlertCircle size={16} className="text-blue-400" /></div>
                                <p className="text-sm text-blue-200/80 leading-relaxed">
                                    Need help? Check our <a href="#" className="underline hover:text-white">help article</a> or <a href="#" className="underline hover:text-white">contact our support</a>. We're here to help.
                                </p>
                            </div>

                            {/* Records Card */}
                            <div className="bg-[#002747] p-8 rounded-2xl border border-white/5 shadow-xl">
                                {dnsRecords?.dns_records?.brevo_code && (
                                    <DNSRecordItem
                                        title="Brevo code"
                                        type={dnsRecords.dns_records.brevo_code.type}
                                        name={dnsRecords.dns_records.brevo_code.host_name || '@'}
                                        value={dnsRecords.dns_records.brevo_code.value}
                                        verified={dnsRecords.authenticated}
                                    />
                                )}

                                {dnsRecords?.dns_records?.dkim1Record && (
                                    <DNSRecordItem
                                        title="DKIM 1 record"
                                        type={dnsRecords.dns_records.dkim1Record.type}
                                        name={dnsRecords.dns_records.dkim1Record.host_name}
                                        value={dnsRecords.dns_records.dkim1Record.value}
                                        verified={dnsRecords.authenticated}
                                    />
                                )}

                                {dnsRecords?.dns_records?.dkim2Record && (
                                    <DNSRecordItem
                                        title="DKIM 2 record"
                                        type={dnsRecords.dns_records.dkim2Record.type}
                                        name={dnsRecords.dns_records.dkim2Record.host_name}
                                        value={dnsRecords.dns_records.dkim2Record.value}
                                        verified={dnsRecords.authenticated}
                                    />
                                )}

                                {/* Fallbacks */}
                                {dnsRecords?.dns_records?.dkim_record && (
                                    <DNSRecordItem
                                        title="DKIM record"
                                        type="TXT"
                                        name={dnsRecords.dns_records.dkim_record.key || 'mail._domainkey'}
                                        value={dnsRecords.dns_records.dkim_record.value}
                                    />
                                )}

                                {dnsRecords?.dns_records?.spf_record && (
                                    <DNSRecordItem
                                        title="SPF record"
                                        type="TXT"
                                        name="@"
                                        value={dnsRecords.dns_records.spf_record.value}
                                    />
                                )}
                            </div>

                            {/* Action Footer */}
                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    onClick={() => navigate('/admin/settings/senders')}
                                    className="px-6 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors border border-transparent hover:border-white/10 rounded-lg"
                                >
                                    Back to domains
                                </button>
                                <button
                                    onClick={handleVerifyLike}
                                    disabled={verifying}
                                    className="px-6 py-2.5 bg-white text-[#002747] hover:bg-gray-100 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2"
                                >
                                    {verifying ? <Loader2 className="animate-spin" size={16} /> : 'Check configuration'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DomainDNS;
