import React from 'react';

interface GlassCardProps {
  title: string;
  subtitle: string;
  icon: string | React.ReactNode;
  badge?: number;
  accentColor?: string;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ title, subtitle, icon, badge, accentColor, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="glass-card p-8 flex items-center gap-6 cursor-pointer relative overflow-hidden group"
    >
      {/* Decorative accent highlight */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 opacity-60"
        style={{ backgroundColor: accentColor || 'rgba(255,255,255,0.2)' }}
      />
      
      <div className="icon-container text-2xl">
        {icon}
      </div>
      
      <div className="flex-1">
        <h3 className="text-white text-lg font-bold text-shadow">{title}</h3>
        <p className="text-white/60 text-sm">{subtitle}</p>
      </div>

      {badge && (
        <div className="flex items-center justify-center">
          <span className="badge min-w-[24px] text-center shadow-lg">
            {badge}
          </span>
        </div>
      )}

      <div className="text-white/20 group-hover:text-white/50 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </div>
    </div>
  );
};

export default GlassCard;
