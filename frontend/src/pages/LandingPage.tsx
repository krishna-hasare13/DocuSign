// frontend/src/pages/LandingPage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Shield, Users, CheckCircle2, ArrowRight } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', ...props }, ref) => {
    const baseStyles = 'font-medium rounded transition-colors inline-flex items-center justify-center';
    const variantStyles = {
      primary: 'bg-blue-900 text-white hover:bg-blue-800',
      outline: 'border border-slate-300 text-slate-900 hover:bg-slate-50'
    };
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-2 text-base',
      lg: 'px-8 py-3 text-lg'
    };
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: 'Easy Document Upload',
      description: 'Upload PDF documents securely and manage them in one place',
      image: 'https://images.unsplash.com/photo-1549912300-fc2f0207445d?crop=entropy&cs=srgb&fm=jpg&q=85'
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Your documents are encrypted and stored with enterprise-level security',
      image: 'https://images.unsplash.com/photo-1756908992987-54c948949b32?crop=entropy&cs=srgb&fm=jpg&q=85'
    },
    {
      icon: Users,
      title: 'Shareable Links',
      description: 'Generate secure links to share signed documents with anyone',
      image: 'https://images.unsplash.com/photo-1638940054491-49e997612cd2?crop=entropy&cs=srgb&fm=jpg&q=85'
    }
  ];

  const benefits = [
    'Draw or upload your signature',
    'Complete audit trail',
    'Legally binding signatures',
    'Cloud storage included'
  ];

  // Helper function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 noise-bg">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={scrollToTop}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <FileText className="h-7 w-7 text-blue-900 transition-transform group-hover:scale-110" />
            <span className="text-xl font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-blue-900">
              DocSigner
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3" // Added flex and gap for both buttons
          >
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              size="sm"
              className="font-medium tracking-wide"
            >
              Sign In
            </Button>
            
            {/* NEW: Sign Up Button */}
            <Button
              onClick={() => navigate('/login', { state: { mode: 'signup' } })}
              variant="primary"
              size="sm"
              className="font-medium tracking-wide shadow-sm"
            >
              Sign Up
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <img
            src="https://images.unsplash.com/photo-1638940054491-49e997612cd2?crop=entropy&cs=srgb&fm=jpg&q=85"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 pt-4 pb-20 lg:pt-8 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 leading-[1.1] mb-4">
                Sign Documents
                <br />
                <span className="text-blue-900">Digitally & Securely</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6 max-w-xl">
                Upload, sign, and share PDF documents with complete legal traceability.
                Bank-grade security meets intuitive design.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Button
                  onClick={() => navigate('/login')}
                  size="lg"
                  className="bg-blue-900 hover:bg-blue-800 text-white font-medium tracking-wide px-8 rounded-md"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="font-medium tracking-wide rounded-md"
                  onClick={() => navigate('/about')}
                >
                  Learn More
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {benefits.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-slate-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-900/10 rounded-lg blur-3xl -translate-y-4"></div>
                <img
                  src="https://images.unsplash.com/photo-1549912300-fc2f0207445d?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Document signing"
                  className="relative rounded-lg shadow-2xl border border-white/20 max-h-[500px] w-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-blue-900 font-semibold mb-2">FEATURES</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Everything You Need</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-md p-6">
                <div className="mb-4 h-40 rounded-md overflow-hidden bg-slate-200">
                  <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
                </div>
                <feature.icon className="h-8 w-8 text-blue-900 mb-3" />
                <h3 className="text-lg font-semibold tracking-tight text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div 
            className="flex items-center justify-center gap-2 mb-4 cursor-pointer group"
            onClick={scrollToTop}
          >
            <FileText className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
              DocSigner
            </span>
          </div>
          <p className="text-xs">© 2026 DocSigner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;