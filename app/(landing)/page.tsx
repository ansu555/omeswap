import { HeroSection } from '@/components/landing/hero-section';
import { BentoGrid } from '@/components/landing/bento-grid';
import { Footer } from '@/components/layout';
import LiquidEther from '@/components/ui/liquid-ether';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black">
      {/* Global Liquid Ether Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <LiquidEther
          colors={['#5227FF', '#FF9FFC', '#B19EEF']}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      {/* Content */}
      <div className="relative z-10">
        <HeroSection />
        <BentoGrid />
        <Footer />
      </div>
    </div>
  );
}
