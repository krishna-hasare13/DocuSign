// frontend/src/pages/AboutPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, MousePointer2, Share2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

const AboutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const steps = [
    {
      title: "Upload",
      description: "Securely upload your PDF documents. We support bank-grade encryption for all files.",
      icon: FileText
    },
    {
      title: "Sign",
      description: "Drag and drop your signature box exactly where it needs to be on any page.",
      icon: MousePointer2
    },
    {
      title: "Share",
      description: "Instantly generate a public link or download the signed version for your records.",
      icon: Share2
    }
  ];

  // Dynamic navigation based on auth status
  const handleLogoClick = () => {
    navigate(user ? '/dashboard' : '/');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Dynamic Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={handleLogoClick}
          >
            <FileText className="h-7 w-7 text-blue-900 transition-transform group-hover:scale-110" />
            <span className="text-xl font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-blue-900">
              DocSigner
            </span>
          </div>
          <Button
            onClick={() => navigate(user ? '/dashboard' : '/login')}
            variant="outline"
            size="sm"
            className="font-medium tracking-wide"
          >
            {user ? 'Go to Dashboard' : 'Sign In'}
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 lg:py-16">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogoClick}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to {user ? 'Dashboard' : 'Home'}
        </Button>

        <section className="mb-16">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mb-6 leading-tight">
            Digital Signing Made <span className="text-blue-900">Simple</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            DocSigner was built to eliminate the hassle of printing, signing, and scanning. 
            Whether it's a rental agreement, a job offer, or a simple waiver, we provide the tools 
            to get it done in seconds, not hours.
          </p>
        </section>

        <div className="grid gap-6 mb-16">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-6 p-6 bg-white rounded-xl border border-slate-200 shadow-sm transition-hover hover:shadow-md">
              <div className="bg-blue-50 p-3 rounded-lg h-fit">
                <step.icon className="h-6 w-6 text-blue-900" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-900 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <ShieldCheck className="h-12 w-12 text-blue-300 flex-shrink-0" />
            <div>
              <h4 className="text-lg font-semibold">Your Security is Priority</h4>
              <p className="text-blue-100 text-sm">Every signature is mathematically verified and legally traceable.</p>
            </div>
          </div>
          <Button 
            className="bg-white text-blue-900 hover:bg-blue-50 w-full md:w-auto font-bold px-8"
            onClick={() => navigate(user ? '/dashboard' : '/login')}
          >
            {user ? 'View My Documents' : 'Start Signing Now'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;