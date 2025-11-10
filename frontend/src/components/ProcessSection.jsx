import React from 'react';
import { Briefcase, Code, Rocket, CheckCircle2, Users, PenTool } from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXACT REPLICA - Based on developios.com console inspection
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ProcessSection = () => {
  const processSteps = [
    {
      number: "1",
      title: "Onboarding",
      description: "We kick off with a comprehensive onboarding. This includes setting up a dedicated Slack workspace, sharing a detailed project plan, and aligning on goals to ensure we're fully prepared to meet your needs.",
      icons: [
        { Icon: Briefcase, position: "top-left" },
        { Icon: Users, position: "top-right" },
        { Icon: PenTool, position: "bottom-left" },
        { Icon: CheckCircle2, position: "bottom-right" }
      ]
    },
    {
      number: "2",
      title: "Design & Development",
      description: "Our team transforms your ideas into reality, focusing on user experience and functionality. We create a pixel-perfect design and develop it after your approval.",
      icons: [
        { Icon: Code, position: "top-left" },
        { Icon: PenTool, position: "top-right" },
        { Icon: Briefcase, position: "bottom-left" },
        { Icon: CheckCircle2, position: "bottom-right" }
      ]
    },
    {
      number: "3",
      title: "Testing & Launch",
      description: "Before going live, we rigorously test every feature to ensure everything works flawlessly. Once perfected, we launch your project and continue providing support.",
      icons: [
        { Icon: Rocket, position: "top-left" },
        { Icon: CheckCircle2, position: "top-right" },
        { Icon: Code, position: "bottom-left" },
        { Icon: Users, position: "bottom-right" }
      ]
    }
  ];

  return (
    <section className="section-home-process bg-[#0d0d0d] py-24 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00ff88]/5 to-transparent pointer-events-none"></div>
      
      <div className="page-padding">
        <div className="container-medium">
          <div className="padding-vertical padding-xhuge">
            
            {/* Section Header */}
            <div className="margin-bottom margin-xhuge text-center">
              <div className="max-width-large align-center">
                <h2 className="heading-6 text-white font-bold text-3xl md:text-5xl mb-6">
                  Our three-step process ensures you stay in the loop from day one
                </h2>
                <p className="paragraph-19 text-gray-400 text-lg md:text-xl max-w-4xl mx-auto">
                  while we tackle each phase with precision—turning your vision into a final product that propels your brand forward.
                </p>
              </div>
            </div>

            {/* Process Container */}
            <div className="process_container">
              <div className="process_wrapper max-w-6xl mx-auto">
                
                {/* Process Steps */}
                {processSteps.map((step, index) => (
                  <div 
                    key={index} 
                    className="process_step flex flex-col md:flex-row gap-8 mb-16 last:mb-0"
                    data-w-id={`72620c8c-8f9d-6ab7-f343-dfc3958a8bc${index + 6}`}
                  >
                    {/* Left Side - Visual Icon Grid */}
                    <div className="process_visual w-full md:w-80 shrink-0">
                      <div className="relative h-96 bg-gradient-to-br from-[#1a4d3d] to-[#0d261f] rounded-2xl p-8 flex items-center justify-center overflow-hidden group hover:shadow-2xl hover:shadow-[#00ff88]/20 transition-all duration-500">
                        
                        {/* Large center circle with number */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-32 h-32 rounded-full bg-[#00ff88]/20 backdrop-blur-sm border-4 border-[#00ff88] flex items-center justify-center shadow-lg shadow-[#00ff88]/30 group-hover:scale-110 transition-transform duration-500">
                            <span className="text-6xl font-bold text-[#00ff88]">
                              {step.number}
                            </span>
                          </div>
                        </div>

                        {/* Corner Icons */}
                        {step.icons.map(({ Icon, position }, iconIndex) => {
                          const positionClasses = {
                            "top-left": "top-8 left-8",
                            "top-right": "top-8 right-8",
                            "bottom-left": "bottom-8 left-8",
                            "bottom-right": "bottom-8 right-8"
                          };

                          return (
                            <div
                              key={iconIndex}
                              className={`absolute ${positionClasses[position]} w-14 h-14 rounded-full bg-[#0d261f] border-2 border-[#00ff88]/30 flex items-center justify-center group-hover:border-[#00ff88] transition-all duration-300`}
                              style={{
                                animationDelay: `${iconIndex * 0.1}s`
                              }}
                            >
                              <Icon className="w-6 h-6 text-[#00ff88]" />
                            </div>
                          );
                        })}

                        {/* Animated connecting lines */}
                        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                          <line x1="25%" y1="25%" x2="75%" y2="75%" stroke="#00ff88" strokeWidth="1" opacity="0.2" className="animate-pulse" />
                          <line x1="75%" y1="25%" x2="25%" y2="75%" stroke="#00ff88" strokeWidth="1" opacity="0.2" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                        </svg>

                        {/* Progress indicator bar at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#0d261f]">
                          <div className="process_timeline-progress h-full bg-gradient-to-r from-[#00ff88] to-[#00ffaa] animate-pulse" style={{ width: '40.325%' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Content */}
                    <div className="process_content flex-1 flex flex-col justify-center">
                      <div className="process_content-top mb-6">
                        <h3 className="text-white font-bold text-3xl md:text-4xl mb-4 group-hover:text-[#00ff88] transition-colors duration-300">
                          {step.title}
                        </h3>
                      </div>
                      <div className="process_content-bottom">
                        <p className="text-gray-400 text-base md:text-lg leading-relaxed">
                          {step.description}
                        </p>
                      </div>

                      {/* Progress dots */}
                      <div className="flex gap-2 mt-6">
                        {processSteps.map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              i === index
                                ? 'w-8 bg-[#00ff88]'
                                : 'w-2 bg-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Process Timeline (connecting line between steps) */}
                <div className="process_timeline hidden md:block absolute left-40 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#00ff88]/30 to-transparent"></div>
                
                {/* Overlay effects */}
                <div className="process_overlay-top absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0d0d0d] to-transparent pointer-events-none"></div>
                <div className="process_overlay-bottom absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0d0d0d] to-transparent pointer-events-none"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUSTOM CSS (Add to your CSS file or use styled-components)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/*
.process_timeline-progress {
  animation: progressGrow 3s ease-in-out infinite;
}

@keyframes progressGrow {
  0%, 100% { width: 0%; }
  50% { width: 100%; }
}

.process_step {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.6s ease-out forwards;
}

.process_step:nth-child(1) { animation-delay: 0.1s; }
.process_step:nth-child(2) { animation-delay: 0.3s; }
.process_step:nth-child(3) { animation-delay: 0.5s; }

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .process_timeline {
    display: none;
  }
}
*/