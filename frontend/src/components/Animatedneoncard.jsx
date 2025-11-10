import React from 'react';
import { Clock, CheckCircle, MessageCircle } from 'lucide-react';

const AnimatedNeonCard = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        
        {/* Main Neon Card */}
        <div className="bg-[#C8FF00] rounded-[2rem] p-8 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(200,255,0,0.5)]">
          
          {/* Header with Clock Icon */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center animate-pulse">
              <Clock className="w-7 h-7 text-[#C8FF00] animate-spin-slow" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">DEVELOPIOS</h2>
          </div>

          {/* First Feature Section */}
          <div className="mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
              Timely Project Updates
            </h3>
            <p className="text-gray-800 text-base md:text-lg leading-relaxed">
              Regular progress updates to stay informed at every stage of your project.
            </p>
          </div>

          {/* Animated Checkmark Icon */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center relative overflow-hidden">
              {/* Ping Effect */}
              <div className="absolute inset-0 bg-[#C8FF00] rounded-full animate-ping opacity-20"></div>
              {/* Checkmark */}
              <CheckCircle className="w-10 h-10 text-[#C8FF00] relative z-10 animate-pulse-scale" />
            </div>
          </div>

          {/* Second Feature Section */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
              Satisfaction Guarantee
            </h3>
            <p className="text-gray-800 text-base md:text-lg leading-relaxed">
              If our work doesn't meet your expectations, we'll provide refund—no questions asked!
            </p>
          </div>
        </div>

        {/* Bottom Section - Process Steps */}
        <div className="mt-8 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-gray-800 px-6 py-4 rounded-2xl shadow-lg hover:bg-gray-750 transition-colors">
            <h4 className="text-lg md:text-xl font-bold text-white whitespace-nowrap">
              Simple 3 <span className="text-[#C8FF00]">Steps</span>
            </h4>
            <p className="text-white text-sm md:text-base">Process we Follow</p>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-bounce shadow-lg hover:bg-green-400 cursor-pointer transition-colors">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnimatedNeonCard;