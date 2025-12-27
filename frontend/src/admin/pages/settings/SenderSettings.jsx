import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, Edit, CheckCircle, AlertCircle, Shield, Copy, Globe, ChevronRight, Loader2, ArrowLeft, Server } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { useNotification } from '../../../contexts/NotificationContext';
import { SenderAPI } from '../../../lib/api';

export default function SenderSettings() {
    const { success, error: notifyError } = useNotification();
    const [activeTab, setActiveTab] = useState('senders'); // senders | domains

    // Senders State
    const [senders, setSenders] = useState([]);
    const [isSenderModalOpen, setIsSenderModalOpen] = useState(false);
    const [newSender, setNewSender] = useState({ name: '', email: '' });

    // Domains State
    const [domains, setDomains] = useState([]);

    // Domain Wizard State
    const [isDomainWizardOpen, setIsDomainWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(1); // 1: Input, 2: Analyzing, 3: Method, 4: DNS
    const [newDomain, setNewDomain] = useState('');
    const [dnsRecords, setDnsRecords] = useState(null); // Data for selected domain DNS
    const [analyzingStep, setAnalyzingStep] = useState(0); // 0: Start, 1: DNS Provider, 2: Setup Ready

    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (activeTab === 'senders') fetchSenders();
        if (activeTab === 'domains') fetchDomains();

        // Check for verification success param
        const params = new URLSearchParams(location.search);
        if (params.get('verified') === 'true') {
            success(`Sender verified successfully! ${params.get('email') ? `(${params.get('email')})` : ''}`);
            navigate(location.pathname, { replace: true });
        }
    }, [location.search, activeTab]);

    // ================= SENDER FUNCTIONS =================

    const fetchSenders = async () => {
        try {
            const data = await SenderAPI.list();
            setSenders(data);
        } catch (err) {
            console.error('Failed to fetch senders:', err);
        }
    };

    const handleAddSender = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await SenderAPI.create(newSender);
            success('Sender added! Verification email sent. Please check your inbox.');
            setIsSenderModalOpen(false);
            setNewSender({ name: '', email: '' });
            fetchSenders();
        } catch (err) {
            notifyError(err.message || 'Failed to add sender');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSender = async (id) => {
        if (window.confirm('Are you sure you want to delete this sender?')) {
            try {
                await SenderAPI.remove(id);
                success('Sender deleted successfully');
                fetchSenders();
            } catch (err) {
                notifyError(err.message || 'Failed to delete sender');
            }
        }
    };

    const handleResendSender = async (id) => {
        try {
            await SenderAPI.resendVerification(id);
            success('Verification email resent successfully.');
        } catch (err) {
            notifyError(err.message || 'Failed to resend email');
        }
    };

    // ================= DOMAIN FUNCTIONS =================

    const fetchDomains = async () => {
        try {
            const data = await SenderAPI.domains.list();
            setDomains(data);
        } catch (err) {
            console.error('Failed to fetch domains:', err);
        }
    };

    // Step 1: Add Domain & Move to Analysis
    const handleStartDomainWizard = async (e) => {
        e.preventDefault();
        if (!newDomain) return;

        setLoading(true);
        try {
            // Check if domain exists first, if not create it
            // For simplicity, we just try to create. 
            // If it exists, we handle the error or proceed.
            try {
                await SenderAPI.domains.create({ domain: newDomain });
                success('Domain added successfully.');
            } catch (err) {
                // If error is "already exists", we can proceed. Otherwise stop.
                // Assuming we proceed to configuration if it exists.
                if (!err.message?.includes('exists')) {
                    // console.log("Created domain");
                }
            }

            // Fetch clean list
            fetchDomains();

            // Fetch DNS records immediately for later
            const records = await SenderAPI.domains.get(newDomain);
            setDnsRecords(records);

            // Move to Analysis
            setWizardStep(2);
            simulateAnalysis();

        } catch (err) {
            notifyError(err.message || 'Failed to process domain');
        } finally {
            setLoading(false);
        }
    };

    const simulateAnalysis = () => {
        setAnalyzingStep(0);
        setTimeout(() => setAnalyzingStep(1), 1500); // Detecting DNS...
        setTimeout(() => setAnalyzingStep(2), 3000); // Setup Ready...
        setTimeout(() => setWizardStep(3), 4500);    // Move to Method
    };

    const handleDeleteDomain = async (domainName) => {
        if (window.confirm(`Are you sure you want to delete ${domainName}?`)) {
            try {
                await SenderAPI.domains.remove(domainName);
                success('Domain deleted successfully');
                fetchDomains();
            } catch (err) {
                notifyError(err.message || 'Failed to delete domain');
            }
        }
    };

    const handleOpenDnsForExisting = (domainName) => {
        navigate(`/admin/settings/domains/${domainName}`);
    };

    const handleVerifyDomain = async (domainName) => {
        setLoading(true);
        try {
            await SenderAPI.domains.verify(domainName);
            success('Verification triggered. Refreshing status...');
            fetchDomains();
            // Refresh DNS view
            if (isDomainWizardOpen && dnsRecords?.domain_name === domainName) {
                const data = await SenderAPI.domains.get(domainName);
                setDnsRecords(data);
            }
        } catch (err) {
            notifyError('Verification failed. Check your DNS stats.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        success('Copied to clipboard');
    };

    const closeWizard = () => {
        setIsDomainWizardOpen(false);
        setWizardStep(1);
        setNewDomain('');
        setDnsRecords(null);
        setAnalyzingStep(0);
    };

    // ================= RENDER =================

    return (
        <div className="admin-layout min-h-screen bg-[#002747] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-8 py-8">
                <AdminTopbar />

                <div className="flex flex-col gap-8 max-w-6xl mx-auto mt-6">
                    {/* Header */}
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Senders & Domains</h1>
                                <p className="text-gray-400 mt-2 text-base">Manage your sender identities, authenticated domains, and dedicated IPs.</p>
                            </div>
                            <button
                                onClick={() => activeTab === 'senders' ? setIsSenderModalOpen(true) : setIsDomainWizardOpen(true)}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
                            >
                                <Plus size={18} /> Add {activeTab === 'senders' ? 'sender' : 'domain'}
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-8 border-b border-white/10">
                            <button
                                onClick={() => setActiveTab('senders')}
                                className={`pb-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'senders' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                            >
                                Senders <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full">{senders.length}</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('domains')}
                                className={`pb-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'domains' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                            >
                                Domains <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full">{domains.length}</span>
                            </button>
                            <button className="pb-4 border-b-2 border-transparent text-gray-400 hover:text-gray-300 font-medium text-sm transition-colors cursor-not-allowed opacity-50">Dedicated IPs</button>
                        </div>
                    </div>

                    {/* Alert */}
                    <div className="bg-[#003560]/50 border border-blue-500/20 rounded-xl p-5 flex gap-4 items-start shadow-sm backdrop-blur-sm">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Shield className="text-blue-400" size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-1">Domain Compliance Status</h4>
                            <p className="text-sm text-gray-400 leading-relaxed max-w-3xl">
                                Your sender domains are partially compliant. To ensure 99.9% deliverability and prevent landing in spam folders, verify your domain authentication records (SPF & DKIM).
                            </p>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div>
                        {activeTab === 'senders' ? (
                            <div className="space-y-4">
                                {senders.length === 0 && (
                                    <div className="text-center py-12 text-gray-400 bg-[#003560] rounded-xl border border-white/10">
                                        <p>No senders found. Add one to get started.</p>
                                    </div>
                                )}
                                <div className="space-y-4">
                                    {senders.map((sender) => {
                                        // Try to find matching domain status
                                        const senderDomain = sender.email.split('@')[1];
                                        const matchingDomain = domains.find(d => d.domain_name === senderDomain);
                                        const dkimStatus = matchingDomain?.authenticated ? 'Authenticated' : 'Default';
                                        const dmarcStatus = matchingDomain?.authenticated ? 'DMARC is configured' : 'Value not monitored';

                                        return (
                                            <div key={sender._id || sender.id} className="bg-[#003560] rounded-xl border border-white/10 overflow-hidden transition-all hover:border-blue-500/30">
                                                {/* Top Row: Identity & Actions */}
                                                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="font-medium text-white text-base">
                                                            {sender.name} <span className="text-gray-400 ml-1 font-normal">&lt;{sender.email}&gt;</span>
                                                        </div>
                                                        {sender.status === 'verified' ? (
                                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-500/20">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Verified
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Not Verified
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        {sender.status !== 'verified' && (
                                                            <button
                                                                onClick={() => handleResendSender(sender._id || sender.id)}
                                                                className="px-4 py-1.5 bg-white text-slate-900 text-sm font-semibold rounded shadow hover:bg-gray-100 transition-colors"
                                                            >
                                                                Verify
                                                            </button>
                                                        )}
                                                        <div className="relative group">
                                                            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                                                <MoreVertical size={18} />
                                                            </button>
                                                            {/* Dropdown Menu */}
                                                            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                                                <button onClick={() => handleDeleteSender(sender._id || sender.id)} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 rounded-lg">Delete Sender</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bottom Row: Technical Details */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-[#002747]/30 text-sm">
                                                    <div>
                                                        <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">IP Address</span>
                                                        <div className="flex items-center gap-2 text-gray-300">
                                                            {sender.ip || 'Shared IP'}
                                                            <span className="text-gray-500 cursor-help" title="Using Brevo Shared IPs">
                                                                <AlertCircle size={14} />
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">DKIM Signature</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className={matchingDomain?.authenticated ? 'text-green-400 font-medium' : 'text-orange-400 font-medium'}>
                                                                {matchingDomain ? matchingDomain.domain_name : 'Default'}
                                                            </span>
                                                            {matchingDomain?.authenticated ? (
                                                                <CheckCircle size={14} className="text-green-500" />
                                                            ) : (
                                                                <AlertCircle size={14} className="text-orange-500" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">DMARC</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className={matchingDomain?.authenticated ? 'text-green-400' : 'text-gray-400'}>
                                                                {dmarcStatus}
                                                            </span>
                                                            {matchingDomain?.authenticated && <CheckCircle size={14} className="text-green-500" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {domains.length === 0 && (
                                    <div className="text-center py-12 text-gray-400 bg-[#003560] rounded-xl border border-white/10">
                                        <p>No domains found. Add a domain to authenticate it.</p>
                                    </div>
                                )}
                                {domains.map((domain) => (
                                    <div key={domain.id} className="bg-[#003560] rounded-xl border border-white/10 p-6 shadow-xl shadow-black/20 hover:border-white/20 transition-all">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                                                    <Globe size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white mb-1">{domain.domain_name}</h3>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        {domain.authenticated ? (
                                                            <span className="text-green-400 flex items-center gap-1"><CheckCircle size={14} /> Authenticated</span>
                                                        ) : (
                                                            <span className="text-yellow-400 flex items-center gap-1"><AlertCircle size={14} /> Unauthenticated</span>
                                                        )}
                                                        <span className="text-gray-500">•</span>
                                                        <span className="text-gray-400">DKIM {domain.dkim_status ? 'Active' : 'Missing'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => handleOpenDnsForExisting(domain.domain_name)} className="px-4 py-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-medium transition-all">
                                                    DNS Settings
                                                </button>
                                                <button onClick={() => handleDeleteDomain(domain.domain_name)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sender Modal */}
                {isSenderModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-[#003560] rounded-2xl border border-white/10 w-full max-w-md shadow-2xl">
                            <div className="p-6 border-b border-white/10">
                                <h3 className="text-xl font-bold text-white">Add New Sender</h3>
                                <p className="text-gray-400 text-sm mt-1">Configure a new "From" identity.</p>
                            </div>
                            <form onSubmit={handleAddSender} className="p-6">
                                <div className="space-y-4">
                                    <input value={newSender.name} onChange={e => setNewSender({ ...newSender, name: e.target.value })} required type="text" placeholder="Sender Name" className="w-full bg-[#002747] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                                    <input value={newSender.email} onChange={e => setNewSender({ ...newSender, email: e.target.value })} required type="email" placeholder="Sender Email" className="w-full bg-[#002747] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button type="button" onClick={() => setIsSenderModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                                    <button disabled={loading} type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold">{loading ? 'Adding...' : 'Verify & Add'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* DOMAIN WIZARD MODAL */}
                {isDomainWizardOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-[#003560] rounded-2xl border border-white/10 w-full max-w-xl shadow-2xl overflow-hidden min-h-[400px] flex flex-col">

                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#002747]/50">
                                {wizardStep > 1 && wizardStep < 4 ? (
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        Authenticate {newDomain || 'Domain'}
                                    </h3>
                                ) : (
                                    <h3 className="text-xl font-bold text-white">
                                        {wizardStep === 1 ? 'Authenticate a Domain' : `Domain Added`}
                                    </h3>
                                )}
                                <button onClick={closeWizard} className="text-gray-400 hover:text-white transition-colors">✕</button>
                            </div>

                            {/* Body Content */}
                            <div className="p-8 flex-1 flex flex-col justify-center">

                                {/* Step 1: Input */}
                                {wizardStep === 1 && (
                                    <form onSubmit={handleStartDomainWizard} className="space-y-6">
                                        <div>
                                            <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                                                Add a domain to verify your sender identity and improve email deliverability.
                                            </p>
                                            <input
                                                autoFocus
                                                value={newDomain}
                                                onChange={e => setNewDomain(e.target.value)}
                                                required
                                                type="text"
                                                placeholder="e.g. usmanricemills.com"
                                                className="w-full bg-[#002747] border border-white/10 rounded-xl px-5 py-4 text-white text-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-600"
                                            />
                                            <p className="text-xs text-gray-500 mt-2">You will need access to your domain's DNS settings.</p>
                                        </div>
                                        <div className="flex justify-end pt-4">
                                            <button disabled={loading} type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2">
                                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Add Domain'}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Step 2: Analysis Animation */}
                                {wizardStep === 2 && (
                                    <div className="text-center py-8">
                                        <div className="relative w-24 h-24 mx-auto mb-8">
                                            {/* Pulse Effect */}
                                            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
                                            <div className="relative bg-[#002747] border-2 border-blue-500 rounded-full w-full h-full flex items-center justify-center shadow-xl shadow-blue-900/30">
                                                <Server className="text-blue-400" size={40} />
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Analyzing your domain</h3>
                                        <div className="text-gray-400 space-y-2 text-sm h-16">
                                            <p className="transition-all duration-500 opacity-100 flex items-center justify-center gap-2">
                                                <Loader2 size={14} className="animate-spin text-blue-400" /> Analyzing {newDomain}...
                                            </p>
                                            {analyzingStep >= 1 && (
                                                <p className="transition-all duration-500 opacity-100 flex items-center justify-center gap-2 text-green-400">
                                                    <CheckCircle size={14} /> Detecting DNS Provider...
                                                </p>
                                            )}
                                            {analyzingStep >= 2 && (
                                                <p className="transition-all duration-500 opacity-100 flex items-center justify-center gap-2 text-green-400">
                                                    <CheckCircle size={14} /> Getting your setup ready...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Method Selection */}
                                {wizardStep === 3 && (
                                    <div className="space-y-4">
                                        <p className="text-gray-400 text-sm mb-4">Choose how you want to authenticate your domain.</p>

                                        {/* Auto verify option (Disabled/Mock) */}
                                        <div className="border border-white/5 rounded-xl p-4 flex items-start gap-4 opacity-50 cursor-not-allowed bg-[#002747]/30">
                                            <div className="mt-1 w-5 h-5 rounded-full border border-gray-600 flex items-center justify-center"></div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-gray-400">Authenticate automatically</h4>
                                                    <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Recommended</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Direct integration with GoDaddy, Namecheap etc. (Coming Soon)</p>
                                            </div>
                                        </div>

                                        {/* Manual verify option (Selected) */}
                                        <div className="border-2 border-blue-500 bg-blue-500/5 rounded-xl p-4 flex items-start gap-4 cursor-pointer relative shadow-inner shadow-blue-500/10">
                                            <div className="mt-1 w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">Authenticate the domain yourself</h4>
                                                <p className="text-sm text-gray-300 mt-1">Set up your domain records manually in your domain provider account.</p>
                                            </div>
                                        </div>

                                        <div className="pt-6 flex justify-end">
                                            <button onClick={() => setWizardStep(4)} className="px-8 py-3 bg-white text-[#002747] hover:bg-gray-100 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2">
                                                Continue <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Success Message & Navigation */}
                                {wizardStep === 4 && (
                                    <div className="flex flex-col items-center justify-center h-full space-y-6 pt-8">
                                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mb-2 border border-blue-500/20">
                                            <Globe size={32} />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <h3 className="text-xl font-bold text-white">Domain Added Successfully!</h3>
                                            <p className="text-gray-400 max-w-sm mx-auto text-sm leading-relaxed">
                                                Your domain has been added. You can now configure the DNS records to authenticate it.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/admin/settings/domains/${newDomain}`)}
                                            className="px-8 py-3 bg-white text-[#002747] hover:bg-gray-100 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 mt-4"
                                        >
                                            Configure DNS <ChevronRight size={18} />
                                        </button>
                                        <div className="flex-1 w-full" /> {/* Spacer */}
                                        <div className="w-full pt-4 border-t border-white/10 flex justify-center pb-2">
                                            <button onClick={closeWizard} className="text-sm text-gray-500 hover:text-white transition-colors">Close</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
