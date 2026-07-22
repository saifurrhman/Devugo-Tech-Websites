const aiService = require('../services/aiService');
const PROMPTS = require('../config/aiPrompts');

// Smart rule-based fallback chatbot - works WITHOUT AI key
function getFallbackReply(message) {
    const msg = message.toLowerCase().trim();

    // Greetings
    if (/^(hi|hello|hey|salam|assalam|helo|hii|helo|good morning|good evening|good afternoon)/.test(msg)) {
        return "Hello! 👋 Welcome to Devugo Tech Solutions! I'm here to help you. How can I assist you today?";
    }

    // Services
    if (msg.includes('service') || msg.includes('offer') || msg.includes('provide') || msg.includes('what do you do') || msg.includes('kya karte')) {
        return "We offer a range of digital services:\n\n🌐 **Web Development** - Custom websites & web apps\n📱 **Mobile App Development** - iOS & Android\n🔍 **SEO & Digital Marketing** - Grow your online presence\n🤖 **AI Solutions** - Smart automation & AI tools\n🎨 **UI/UX Design** - Beautiful, user-friendly designs\n\nWould you like to know more about any specific service?";
    }

    // Pricing
    if (msg.includes('price') || msg.includes('pricing') || msg.includes('cost') || msg.includes('how much') || msg.includes('rate') || msg.includes('qeemat') || msg.includes('charge')) {
        return "Our pricing depends on project requirements. We offer flexible packages for every budget! 💰\n\nFor a detailed quote tailored to your project, please:\n📞 Contact us at: support@devugotechsolution.store\n📝 Or fill out our contact form on the website\n\nOur team will get back to you within 24 hours!";
    }

    // Contact
    if (msg.includes('contact') || msg.includes('reach') || msg.includes('talk') || msg.includes('call') || msg.includes('email') || msg.includes('phone') || msg.includes('whatsapp')) {
        return "You can reach us through:\n\n📧 **Email:** support@devugotechsolution.store\n🌐 **Website:** devugotechsolution.store\n💬 **WhatsApp:** Available via the WhatsApp button on our site\n\nWe typically respond within a few hours. Feel free to reach out!";
    }

    // Portfolio / Work
    if (msg.includes('portfolio') || msg.includes('work') || msg.includes('project') || msg.includes('example') || msg.includes('past') || msg.includes('sample')) {
        return "We've worked on amazing projects! 🚀\n\nYou can view our portfolio on the Portfolio section of our website to see our past work across web development, mobile apps, and digital solutions.\n\nWould you like to discuss a project with us?";
    }

    // About
    if (msg.includes('about') || msg.includes('who are you') || msg.includes('devugo') || msg.includes('company') || msg.includes('team')) {
        return "We are **Devugo Tech Solutions** — a passionate team of developers, designers, and digital strategists! 🏢\n\nWe help businesses grow online through cutting-edge technology and innovative digital solutions. From startups to enterprises, we build digital products that make a difference.\n\nWant to start a project with us?";
    }

    // Website
    if (msg.includes('website') || msg.includes('web') || msg.includes('develop') || msg.includes('build')) {
        return "We build stunning, high-performance websites! 🌐\n\n✅ Custom design tailored to your brand\n✅ Fast loading & mobile responsive\n✅ SEO optimized from day one\n✅ Admin panel to manage your content\n✅ E-commerce, portfolio, corporate & more\n\nInterested? Contact us at support@devugotechsolution.store";
    }

    // SEO
    if (msg.includes('seo') || msg.includes('ranking') || msg.includes('google rank') || msg.includes('search engine') || msg.includes('traffic')) {
        return "We specialize in SEO & Digital Marketing! 🔍\n\n📈 Improve your Google rankings\n🎯 Drive targeted traffic to your website\n📊 Data-driven strategies that deliver results\n🔑 Keyword research & content optimization\n\nLet's boost your online visibility! Contact us to get started.";
    }

    // AI
    if (msg.includes('ai') || msg.includes('artificial intelligence') || msg.includes('chatbot') || msg.includes('automation') || msg.includes('machine learning')) {
        return "Yes, we build AI-powered solutions! 🤖\n\n🧠 Custom AI chatbots for your business\n⚡ Workflow automation\n📊 AI analytics & insights\n🔗 API integrations with OpenAI, Gemini & more\n\nWant to add AI to your business? Let's talk!";
    }

    // Thanks
    if (msg.includes('thank') || msg.includes('thanks') || msg.includes('shukriya') || msg.includes('jazak')) {
        return "You're welcome! 😊 It was a pleasure helping you. If you have any more questions, feel free to ask. Have a great day!";
    }

    // Bye
    if (msg.includes('bye') || msg.includes('goodbye') || msg.includes('khuda hafiz') || msg.includes('allah hafiz')) {
        return "Goodbye! 👋 Thank you for visiting Devugo Tech Solutions. Feel free to come back anytime. Have a wonderful day!";
    }

    // Default
    return "Thanks for reaching out to Devugo Tech Solutions! 🙏\n\nI'd be happy to help you. For the best assistance, please contact us directly:\n\n📧 **Email:** support@devugotechsolution.store\n📝 **Contact Form:** Available on our website\n\nOur team will respond within 24 hours and we'll make sure all your questions are answered!";
}

exports.handleChatMessage = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        console.log('💬 Chat Request:', message);

        // Try AI first
        try {
            const result = await aiService.generateContent(PROMPTS.PUBLIC_CHAT, { question: message }, 'chat');
            const replyText = result.reply || result.body;

            // If AI returned a real reply (not mock/error), use it
            if (replyText && !result.isMock) {
                return res.json({ success: true, reply: replyText });
            }
        } catch (aiErr) {
            console.warn('⚠️ AI unavailable, using smart fallback:', aiErr.message);
        }

        // Smart fallback - always works!
        const fallbackReply = getFallbackReply(message);
        return res.json({
            success: true,
            reply: fallbackReply
        });

    } catch (error) {
        console.error('❌ Chat Controller Error:', error);
        res.status(500).json({
            success: false,
            reply: "I apologize, but I encountered an error. Please contact us directly at support@devugotechsolution.store."
        });
    }
};
