
import React, { useState } from 'react';

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const PolicyModal: React.FC<ModalProps> = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl p-1">&times;</button>
        </div>
        <div className="p-8 overflow-y-auto text-slate-600 leading-relaxed space-y-4 text-sm md:text-base">
          {children}
        </div>
        <div className="p-6 border-t border-slate-100 text-right">
          <button onClick={onClose} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">Close</button>
        </div>
      </div>
    </div>
  );
};

export const LandingPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | 'service' | null>(null);
  const [selectedService, setSelectedService] = useState<{title: string, icon: string, longDesc: string, features: string[]} | null>(null);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const services = [
    { 
      title: 'Complaint Tracking', 
      desc: 'Real-time updates on maintenance requests with priority levels.', 
      icon: '🛠',
      longDesc: 'Our centralized ticketing system ensures no resident request goes unheard. From plumbing leaks to electrical faults, track every stage of resolution from your smartphone.',
      features: ['Automated Ticket Assignment', 'Priority Level Escalation', 'Photo Attachments for Proof', 'Resolution Timeline Tracking']
    },
    { 
      title: 'Digital Notices', 
      desc: 'Broadcast important news instantly to every resident smartphone.', 
      icon: '📢',
      longDesc: 'Eliminate paper wastage and missed announcements. Our digital board ensures urgent alerts for water cuts, maintenance, or events reach everyone instantly.',
      features: ['Push Notifications', 'Urgency Tagging', 'Scheduled Broadcasts', 'Read-receipt Analytics']
    },
    { 
      title: 'Payment Gateway', 
      desc: 'Secure maintenance bill tracking and automated receipts.', 
      icon: '💳',
      longDesc: 'Simplify society accounting with automated billing. Residents can pay via UPI, Credit Cards, or NetBanking with instant GST-compliant receipts.',
      features: ['Automated Monthly Invoicing', 'Penalty Calculation', 'Online Payment Integration', 'Historical Statement Access']
    },
    { 
      title: 'Resident Directory', 
      desc: 'Easily manage resident data and unit allocations.', 
      icon: '👥',
      longDesc: 'Maintain a clean, digital record of all tenants and owners. Manage move-in/move-out protocols and vehicle details with enterprise-grade data security.',
      features: ['Tenant/Owner Tagging', 'Vehicle Registration', 'Emergency Contact Access', 'Unit Allocation Map']
    },
    { 
      title: 'Facility Booking', 
      desc: 'Reserve clubhouses, gyms, and sports courts seamlessly.', 
      icon: '🎾',
      longDesc: 'End the "first-come-first-serve" disputes. Residents can book community assets through a transparent, calendar-based reservation system.',
      features: ['Conflict Prevention Logic', 'Booking Fee Management', 'Asset Usage Reports', 'Cancellation Policies']
    },
    { 
      title: 'Visitor Log', 
      desc: 'Enhanced security with digital gate pass management.', 
      icon: '🛡',
      longDesc: 'Secure your community with digital gatekeeping. Pre-approve guests, track delivery personnel, and receive instant entry alerts on your phone.',
      features: ['Pre-approved Guest Passes', 'Delivery Tracking', 'Blacklist Management', 'Historical Security Logs']
    },
  ];

  const PricingCard = ({ title, price, features, recommended = false }: { title: string, price: string, features: string[], recommended?: boolean }) => (
    <div className={`p-8 rounded-3xl border ${recommended ? 'border-indigo-600 ring-4 ring-indigo-50 shadow-xl lg:scale-105' : 'border-slate-100 shadow-sm'} bg-white transition-all hover:translate-y-[-4px] relative`}>
      {recommended && <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">Recommended</span>}
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <div className="mb-6">
        <span className="text-4xl font-black text-slate-900">{price}</span>
        {price !== 'Custom' && <span className="text-slate-500 font-medium text-lg">/mo</span>}
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-center text-slate-600 text-sm">
            <span className="text-indigo-500 mr-2 text-lg">✓</span> {f}
          </li>
        ))}
      </ul>
      <button 
        onClick={onLogin}
        className={`w-full py-3 rounded-xl font-bold transition-all ${recommended ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
      >
        Choose Plan
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-40 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100">C</div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">CivicHub</span>
        </div>
        <div className="hidden md:flex space-x-8 text-slate-600 font-semibold">
          <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#who-we-are" onClick={(e) => handleNavClick(e, 'who-we-are')} className="hover:text-indigo-600 transition-colors">About</a>
          <a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="hover:text-indigo-600 transition-colors">Pricing</a>
          <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="hover:text-indigo-600 transition-colors">Contact</a>
        </div>
        <button 
          onClick={onLogin}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center">
        <div className="inline-block px-4 py-1.5 mb-6 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100">
          Premium Community Ecosystem
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
          Redefining the <br />
          <span className="text-indigo-600">Residential Experience</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          The all-in-one operating system for modern apartment complexes. Seamless automation, total transparency, and enhanced security for every resident.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-20">
          <button 
            onClick={onLogin}
            className="w-full sm:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all transform hover:-translate-y-1"
          >
            Start Free Trial
          </button>
          <button 
            onClick={(e) => handleNavClick(e as any, 'features')}
            className="w-full sm:w-auto bg-white border-2 border-slate-200 text-slate-700 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all"
          >
            Explore Services
          </button>
        </div>
        
        <div className="relative px-4 group">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[85%] h-[85%] bg-indigo-100 rounded-full blur-3xl opacity-30"></div>
            </div>
            {/* HERO IMAGE: Distinct High-End Blue Glass Architecture */}
            <div className="bg-slate-200 rounded-[40px] overflow-hidden max-w-6xl mx-auto">
              <img 
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80" 
                  alt="Modern Office/Residential Skyscraper" 
                  className="relative rounded-[40px] shadow-2xl border-4 border-white w-full object-cover aspect-[21/9] bg-slate-100 transition-all duration-700 group-hover:scale-[1.01]"
                  loading="eager"
              />
            </div>
        </div>
      </section>

      {/* About Section: Who We Are */}
      <section id="who-we-are" className="py-24 bg-white overflow-hidden scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-60"></div>
              
              {/* STAGGERED GRID: Two Distinct Architecture Images */}
              <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="bg-slate-100 rounded-[32px] overflow-hidden mt-12">
                  {/* ABOUT IMAGE 1: Modern Apartment Block with Balconies */}
                  <img 
                    src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80" 
                    className="rounded-[32px] shadow-2xl border-4 border-white object-cover aspect-[3/4] w-full h-full transform transition-transform duration-700 hover:scale-110" 
                    alt="Modern Sustainable Apartments" 
                    loading="lazy"
                  />
                </div>
                <div className="bg-slate-100 rounded-[32px] overflow-hidden">
                  {/* ABOUT IMAGE 2: Luxury Residential Exterior Detail */}
                  <img 
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" 
                    className="rounded-[32px] shadow-2xl border-4 border-white object-cover aspect-[3/4] w-full h-full transform transition-transform duration-700 hover:scale-110" 
                    alt="Modern Villa Architecture" 
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl z-20 border border-slate-50">
                <div className="text-3xl font-black text-indigo-600">99.9%</div>
                <div className="text-slate-500 text-xs font-black uppercase tracking-widest">Uptime Guarantee</div>
              </div>
            </div>
            <div>
              <div className="inline-block px-3 py-1 mb-4 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black uppercase tracking-widest border border-indigo-100">Who We Are</div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">Bridging the Gap Between <br /><span className="text-indigo-600">Living and Technology.</span></h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
                Founded in 2021, CivicHub emerged with a single goal: to modernize the way residential communities interact. We noticed that while everything else went digital, apartment management remained stuck in paper registers and chaotic messenger groups.
              </p>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Our team consists of urban planners, software architects, and former society board members who understand the unique friction of collective living. We provide the tools to make governance efficient, financial records immutable, and community life more connected.
              </p>
              <div className="grid grid-cols-2 gap-6 mt-10">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="text-2xl font-black text-indigo-600 mb-1">50k+</div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Homes Empowered</div>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="text-2xl font-black text-indigo-600 mb-1">24/7</div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section: Enterprise Features */}
      <section id="features" className="bg-slate-50 py-24 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-3 py-1 mb-4 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black uppercase tracking-widest border border-indigo-100">Capabilities</div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Enterprise Features</h2>
          <p className="text-slate-500 text-lg mb-16 max-w-2xl mx-auto font-medium leading-relaxed">Explore the high-performance modules that make CivicHub the industry leader.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((f, i) => (
              <button 
                key={i} 
                onClick={() => { setSelectedService(f); setModalType('service'); }}
                className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-2xl hover:border-indigo-100 transition-all group text-left outline-none focus:ring-4 focus:ring-indigo-50"
              >
                <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform inline-block p-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">{f.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm mb-4 font-medium">{f.desc}</p>
                <div className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest flex items-center">
                  Full Specifications <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 mb-4 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black uppercase tracking-widest border border-indigo-100">Pricing</div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Flexible Plans</h2>
            <p className="text-slate-500 text-lg font-medium">Scalable solutions for communities of any magnitude.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
            <PricingCard 
              title="Startup" 
              price="$29" 
              features={['Up to 50 Units', 'Core Dashboard', 'Maintenance Requests', 'Basic Notices']} 
            />
            <PricingCard 
              title="Professional" 
              price="$79" 
              recommended={true}
              features={['Up to 250 Units', 'Priority Support', 'Full Payment Gateway', 'Facility Booking', 'Visitor Management']} 
            />
            <PricingCard 
              title="Enterprise" 
              price="Custom" 
              features={['Unlimited Units', 'Dedicated Account Manager', 'White-label Branding', 'Custom API Integrations', 'Multi-society Dashboard']} 
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-indigo-600 text-white scroll-mt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black mb-6 tracking-tight">Elevate your community today.</h2>
          <p className="text-indigo-100 text-lg mb-12 max-w-3xl mx-auto font-medium">Join thousands of societies that have moved to a more efficient, digital-first management model. Our onboarding team is ready.</p>
          <div className="bg-white p-2 rounded-2xl flex flex-col sm:flex-row shadow-2xl max-w-lg mx-auto overflow-hidden">
            <input 
              type="email" 
              placeholder="Your professional email" 
              className="flex-1 px-6 py-4 text-slate-900 outline-none placeholder:text-slate-400 font-medium" 
            />
            <button className="bg-indigo-600 px-8 py-4 font-bold rounded-xl transition-all hover:bg-indigo-700 active:scale-95">Get a Demo</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-black">C</div>
              <span className="text-xl font-bold tracking-tight">CivicHub</span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed mb-6 font-medium">
              Transforming residential complexes into smart, efficient, and secure community ecosystems.
            </p>
          </div>
          
          <div>
            <h4 className="font-black mb-6 text-slate-100 uppercase tracking-widest text-xs">Product</h4>
            <ul className="space-y-4 text-slate-400 font-medium">
              <li><a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="hover:text-indigo-400">Features</a></li>
              <li><a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="hover:text-indigo-400">Pricing</a></li>
              <li><a href="#who-we-are" onClick={(e) => handleNavClick(e, 'who-we-are')} className="hover:text-indigo-400">About Us</a></li>
              <li><button onClick={() => setModalType('terms')} className="hover:text-indigo-400 text-left">Terms of Service</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-6 text-slate-100 uppercase tracking-widest text-xs">Support</h4>
            <ul className="space-y-4 text-slate-400 font-medium">
              <li><a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="hover:text-indigo-400">Contact</a></li>
              <li><button onClick={() => setModalType('privacy')} className="hover:text-indigo-400 text-left">Privacy Policy</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-800 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
          © 2024 CivicHub. All rights reserved.
        </div>
      </footer>

      {/* Service Detail Modal */}
      <PolicyModal 
        title={selectedService?.title || 'Service Detail'} 
        isOpen={modalType === 'service'} 
        onClose={() => setModalType(null)}
      >
        <div className="flex flex-col space-y-6">
          <div className="text-5xl bg-indigo-50 w-20 h-20 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm">
            {selectedService?.icon}
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Service Overview</h4>
            <p className="font-medium text-slate-600 leading-relaxed">{selectedService?.longDesc}</p>
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-4">Core Capabilities</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedService?.features.map((feat, idx) => (
                <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-indigo-500 font-black">✓</span>
                  <span className="text-slate-700 font-bold text-sm">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PolicyModal>

      {/* Legal Modals */}
      <PolicyModal 
        title="Privacy Policy" 
        isOpen={modalType === 'privacy'} 
        onClose={() => setModalType(null)}
      >
        <p className="font-black text-slate-900 mb-2">1. Data Collection</p>
        <p className="font-medium mb-4">We collect information you provide directly to us when you create an account, such as your name, unit number, email, and phone number. We also collect data related to your interactions with the society management tools.</p>
        <p className="font-black text-slate-900 mb-2">2. Use of Information</p>
        <p className="font-medium">Your data is used solely to facilitate society management, maintenance tracking, and communication within your community. We do not sell your personal data to third parties.</p>
      </PolicyModal>

      <PolicyModal 
        title="Terms of Service" 
        isOpen={modalType === 'terms'} 
        onClose={() => setModalType(null)}
      >
        <p className="font-black text-slate-900 mb-2">1. Acceptance of Terms</p>
        <p className="font-medium mb-4">By accessing CivicHub, you agree to be bound by these terms. If your society administration has signed a contract, those specific terms prevail in case of conflict.</p>
        <p className="font-black text-slate-900 mb-2">2. User Conduct</p>
        <p className="font-medium">Users must not use the platform to harass, spread misinformation, or engage in illegal activities. The community notices and complaints should be used respectfully and for their intended purposes.</p>
      </PolicyModal>
    </div>
  );
};
