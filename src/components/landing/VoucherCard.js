import React from 'react';

const VoucherCard = ({ 
  theme = 'pink', 
  discount, 
  badge, 
  title, 
  code, 
  icon: Icon 
}) => {
  const themes = {
    pink: {
      gradient: 'from-pink-50 via-pink-50 to-purple-50',
      border: 'border-pink-300',
      badgeBg: 'bg-pink-500',
      discountColor: 'text-pink-600',
      codeColor: 'text-pink-600',
      buttonGradient: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
      iconColor: 'text-pink-400',
      divider: 'border-pink-200'
    },
    blue: {
      gradient: 'from-blue-50 via-blue-50 to-cyan-50',
      border: 'border-blue-300',
      badgeBg: 'bg-blue-500',
      discountColor: 'text-blue-600',
      codeColor: 'text-blue-600',
      buttonGradient: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      iconColor: 'text-blue-400',
      divider: 'border-blue-200'
    },
    orange: {
      gradient: 'from-amber-50 via-orange-50 to-orange-100',
      border: 'border-orange-300',
      badgeBg: 'bg-red-500',
      discountColor: 'text-orange-600',
      codeColor: 'text-orange-600',
      buttonGradient: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
      iconColor: 'text-orange-400',
      divider: 'border-orange-200'
    }
  };

  const currentTheme = themes[theme];

  return (
    <div className={`relative bg-gradient-to-br ${currentTheme.gradient} rounded-lg overflow-hidden border-2 border-dashed ${currentTheme.border} hover:shadow-lg transition-all group`}>
      {/* Ticket Punch Holes */}
      <div className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-dashed ${currentTheme.border}`}></div>
      <div className={`absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-dashed ${currentTheme.border}`}></div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className={`inline-block ${currentTheme.badgeBg} text-white text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${badge === '🔥 ساخن' ? 'animate-pulse' : ''}`}>
              {badge}
            </div>
            <div className={`text-3xl font-black ${currentTheme.discountColor} mb-0.5`}>
              {discount}
            </div>
            <div className="text-xs text-gray-600 mb-1">خصم على</div>
            <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
          </div>
          <div className={`text-5xl opacity-10 ${currentTheme.iconColor} group-hover:scale-110 transition-transform`}>
            <Icon size={48} />
          </div>
        </div>
        <div className={`border-t-2 border-dashed ${currentTheme.divider} pt-3 mt-3`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">كود الخصم:</span>
            <span className={`font-mono font-bold text-xs ${currentTheme.codeColor}`}>{code}</span>
          </div>
          <button className={`w-full bg-gradient-to-r ${currentTheme.buttonGradient} text-white text-xs px-4 py-2 rounded-lg font-bold transition-all shadow-md hover:shadow-lg`}>
            احجز الآن واستفد
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherCard;
