import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeTitles = {
    // Public
    '/': 'Home - Devugo Tech',
    '/about': 'About Us - Devugo Tech',
    '/services': 'Services - Devugo Tech',
    '/portfolio': 'Portfolio - Devugo Tech',
    '/team': 'Team - Devugo Tech',
    '/blog': 'Blog - Devugo Tech',
    '/contact': 'Contact Us - Devugo Tech',
    '/solutions': 'Solutions - Devugo Tech',
    '/pricing': 'Pricing - Devugo Tech',
    '/faq': 'FAQ - Devugo Tech',
    '/privacy-policy': 'Privacy Policy - Devugo Tech',

    // Admin Auth
    '/admin/login': 'Login - Devugo Admin',
    '/admin/signup': 'Signup - Devugo Admin',
    '/admin/reset-password': 'Reset Password - Devugo Admin',

    // Admin Dashboard
    '/admin': 'Dashboard - Devugo Admin',
    '/admin/profile': 'Profile - Devugo Admin',

    // Admin Lists
    '/admin/portfolio': 'Portfolio - Devugo Admin',
    '/admin/blog': 'Blog - Devugo Admin',
    '/admin/team': 'Team - Devugo Admin',
    '/admin/contacts': 'Contacts - Devugo Admin',
    '/admin/leads': 'Leads - Devugo Admin',
    '/admin/forms': 'Forms - Devugo Admin',
    '/admin/services': 'Services - Devugo Admin',
    '/admin/pricing': 'Pricing Plans - Devugo Admin',
    '/admin/tech-stack': 'Tech Stack - Devugo Admin',
    '/admin/reviews': 'Reviews - Devugo Admin',
    '/admin/faqs': 'FAQs - Devugo Admin',
    '/admin/social-links': 'Social Links - Devugo Admin',
    '/admin/settings': 'Settings - Devugo Admin',
    '/admin/analytics': 'Analytics - Devugo Admin',

    // Email Marketing 
    '/admin/campaigns': 'Campaigns - Devugo Admin',
    '/admin/recipients': 'Recipients - Devugo Admin',
    '/admin/inbox': 'Inbox - Devugo Admin',
    '/admin/templates': 'Templates - Devugo Admin',
    '/admin/email-analytics': 'Email Analytics - Devugo Admin',
    '/admin/settings/integrations': 'Integrations & API - Devugo Admin',

    // CRM & Projects
    '/admin/pipeline': 'Pipeline - Devugo Admin',
    '/admin/projects': 'Projects - Devugo Admin',
    '/admin/invoices': 'Invoices - Devugo Admin',
    '/admin/meetings': 'Meetings - Devugo Admin',
};

const dynamicPrefixes = [
    { prefix: '/admin/invoices/create', title: 'Create Invoice - Devugo Admin' },
    { prefix: '/admin/projects/create', title: 'Create Project - Devugo Admin' },
    { prefix: '/admin/campaigns/create', title: 'Create Campaign - Devugo Admin' },
    { prefix: '/admin/templates/create', title: 'Create Template - Devugo Admin' },
    { prefix: '/admin/templates/ai-generator', title: 'AI Generator - Devugo Admin' },
    { prefix: '/admin/meetings/schedule', title: 'Schedule Meeting - Devugo Admin' },
    { prefix: '/admin/blog/create', title: 'Create Post - Devugo Admin' },
    { prefix: '/services/', title: 'Service Detail - Devugo Tech' },
    { prefix: '/portfolio/', title: 'Project Detail - Devugo Tech' },
    { prefix: '/blog/', title: 'Blog Post - Devugo Tech' },
    { prefix: '/admin/portfolio/', title: 'Edit Portfolio - Devugo Admin' },
    { prefix: '/admin/blog/', title: 'Edit Post - Devugo Admin' },
    { prefix: '/admin/team/', title: 'Edit Member - Devugo Admin' },
    { prefix: '/admin/leads/', title: 'Edit Lead - Devugo Admin' },
    { prefix: '/admin/services/', title: 'Edit Service - Devugo Admin' },
    { prefix: '/admin/reviews/', title: 'Edit Review - Devugo Admin' },
    { prefix: '/admin/faqs/', title: 'Edit FAQ - Devugo Admin' },
    { prefix: '/admin/inbox/', title: 'Inbox - Devugo Admin' },
];

export default function DynamicTitle() {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        let title = routeTitles[path];

        if (!title) {
            // Check for dynamic prefixes
            const dynamicMatch = dynamicPrefixes.find(d => path.startsWith(d.prefix));
            if (dynamicMatch) {
                title = dynamicMatch.title;
            }
        }

        document.title = title || 'Devugo Tech Solutions';
    }, [location]);

    return null;
}
