import React, { useEffect } from 'react';
import { ChevronDown, Users, Baby, Bed } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../locales/translations';

const GuestSelector = ({ 
  rooms, 
  setRooms,
  roomsConfig,
  setRoomsConfig,
  showGuestSelector,
  setShowGuestSelector,
  onClose // New prop for standalone usage
}) => {
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === 'ar';
  
  // Initialize rooms config if not provided
  useEffect(() => {
    if ((!roomsConfig || roomsConfig.length === 0) && setRoomsConfig) {
      setRoomsConfig([{ adults: 2, children: [] }]);
    }
    // Sync rooms count with roomsConfig length
    if (roomsConfig && roomsConfig.length > 0 && setRooms && rooms !== roomsConfig.length) {
      setRooms(roomsConfig.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomsConfig]);
  
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (setShowGuestSelector) {
      setShowGuestSelector(false);
    }
  };
  
  const updateRoomCount = (newCount) => {
    const count = Math.max(1, Math.min(10, newCount));
    setRooms(count);
    
    if (count > roomsConfig.length) {
      // Add new rooms
      const newRooms = [...roomsConfig];
      for (let i = roomsConfig.length; i < count; i++) {
        newRooms.push({ adults: 2, children: [] });
      }
      setRoomsConfig(newRooms);
    } else if (count < roomsConfig.length) {
      // Remove rooms
      setRoomsConfig(roomsConfig.slice(0, count));
    }
  };
  
  const updateRoomAdults = (roomIndex, newAdults) => {
    const updated = [...roomsConfig];
    updated[roomIndex].adults = Math.max(1, Math.min(10, newAdults));
    setRoomsConfig(updated);
  };
  
  const updateRoomChildren = (roomIndex, newChildrenCount) => {
    const updated = [...roomsConfig];
    const currentChildren = updated[roomIndex].children.length;
    
    if (newChildrenCount > currentChildren) {
      // Add children with default age 5
      for (let i = currentChildren; i < newChildrenCount; i++) {
        updated[roomIndex].children.push(5);
      }
    } else {
      // Remove children
      updated[roomIndex].children = updated[roomIndex].children.slice(0, newChildrenCount);
    }
    setRoomsConfig(updated);
  };
  
  const updateChildAge = (roomIndex, childIndex, age) => {
    const updated = [...roomsConfig];
    updated[roomIndex].children[childIndex] = parseInt(age);
    setRoomsConfig(updated);
  };
  
  const getTotalGuests = () => {
    let totalAdults = 0;
    let totalChildren = 0;
    if (roomsConfig && Array.isArray(roomsConfig)) {
      roomsConfig.forEach(room => {
        totalAdults += room.adults || 0;
        totalChildren += (room.children || []).length;
      });
    }
    return { totalAdults, totalChildren };
  };
  
  const { totalAdults, totalChildren } = getTotalGuests();
  
  return (
    <div className="md:col-span-3 relative">
      <label className={`block text-xs font-bold text-gray-700 mb-2.5 ${isRTL ? 'text-right' : 'text-left'}`}>
        {t.search.guests}
      </label>
      <div className="relative">
        <Users size={20} className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none`} />
        <button
          type="button"
          onClick={() => setShowGuestSelector(!showGuestSelector)}
          className={`w-full ${isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} py-3.5 border border-gray-300 rounded-xl text-sm bg-white hover:border-gray-400 focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100 transition-all`}
        >
          <span className="font-medium">
            {rooms} {t.guestSelector.rooms} • {totalAdults} {t.guestSelector.adults}
            {totalChildren > 0 ? ` • ${totalChildren} ${t.guestSelector.children}` : ''}
          </span>
        </button>
        <ChevronDown size={16} className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none`} />
      </div>

      {/* Backdrop Blur */}
      {(showGuestSelector || onClose) && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]"
          onClick={handleClose}
        />
      )}

      {/* Guest Selector Modal */}
      {(showGuestSelector || onClose) && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-2xl shadow-2xl p-5 sm:p-6 z-[99999] w-[95vw] sm:w-[90vw] max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-hide">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Bed size={22} className="text-primary-600" />
            {language === 'fr' ? 'Configuration des chambres' : language === 'ar' ? 'تكوين الغرف' : 'Room Configuration'}
          </h3>
          
          {/* Number of Rooms */}
          <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-transparent rounded-lg p-4">
            <div>
              <div className="font-bold text-gray-900 text-lg">{t.guestSelector.rooms}</div>
              <div className="text-xs text-gray-500">{language === 'fr' ? 'Nombre de chambres' : language === 'ar' ? 'عدد الغرف' : 'Number of rooms'}</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateRoomCount(rooms - 1)}
                className="w-10 h-10 rounded-full border-2 border-primary-300 bg-white flex items-center justify-center hover:border-primary-500 hover:bg-primary-50 hover:text-primary-600 transition-colors font-bold text-lg"
              >
                -
              </button>
              <span className="w-12 text-center font-bold text-xl text-primary-700">{rooms}</span>
              <button
                type="button"
                onClick={() => updateRoomCount(rooms + 1)}
                className="w-10 h-10 rounded-full border-2 border-primary-300 bg-white flex items-center justify-center hover:border-primary-500 hover:bg-primary-50 hover:text-primary-600 transition-colors font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>

          {/* Individual Room Configuration */}
          <div className="space-y-5 mb-6">
            {roomsConfig.map((room, roomIndex) => {
              const totalPeople = room.adults + (room.children?.length || 0);
              let roomType = '';
              if (totalPeople === 1) roomType = language === 'fr' ? 'Simple' : language === 'ar' ? 'فردية' : 'Single';
              else if (totalPeople === 2) roomType = language === 'fr' ? 'Double' : language === 'ar' ? 'مزدوجة' : 'Double';
              else if (totalPeople === 3) roomType = language === 'fr' ? 'Triple' : language === 'ar' ? 'ثلاثية' : 'Triple';
              else if (totalPeople === 4) roomType = language === 'fr' ? 'Quadruple' : language === 'ar' ? 'رباعية' : 'Quadruple';
              else roomType = `${totalPeople} ${language === 'fr' ? 'Pers.' : language === 'ar' ? 'أشخاص' : 'Ppl'}`;
              
              return (
              <div key={roomIndex} className="border border-gray-200 rounded-xl p-4 sm:p-5 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Bed size={18} className="text-primary-600" />
                    {language === 'fr' ? `Chambre ${roomIndex + 1}` : language === 'ar' ? `غرفة ${roomIndex + 1}` : `Room ${roomIndex + 1}`}
                  </h4>
                  <span className="text-xs sm:text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                    {roomType}
                  </span>
                </div>
                
                {/* Adults for this room */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-gray-600" />
                    <div>
                      <div className="font-semibold text-gray-900">{t.guestSelector.adults}</div>
                      <div className="text-xs text-gray-500">{language === 'fr' ? '12 ans et plus' : language === 'ar' ? 'من 12 سنة فأكثر' : '12+ years'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateRoomAdults(roomIndex, room.adults - 1)}
                      className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary-500 hover:bg-primary-50 hover:text-primary-600 transition-colors font-semibold"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-lg">{room.adults}</span>
                    <button
                      type="button"
                      onClick={() => updateRoomAdults(roomIndex, room.adults + 1)}
                      className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary-500 hover:bg-primary-50 hover:text-primary-600 transition-colors font-semibold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children for this room */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Baby size={18} className="text-gray-600" />
                    <div>
                      <div className="font-semibold text-gray-900">{t.guestSelector.children}</div>
                      <div className="text-xs text-gray-500">{language === 'fr' ? '0-11 ans' : language === 'ar' ? 'من 0-11 سنة' : '0-11 years'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateRoomChildren(roomIndex, room.children.length - 1)}
                      className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary-500 hover:bg-primary-50 hover:text-primary-600 transition-colors font-semibold"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-lg">{room.children.length}</span>
                    <button
                      type="button"
                      onClick={() => updateRoomChildren(roomIndex, room.children.length + 1)}
                      className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary-500 hover:bg-primary-50 hover:text-primary-600 transition-colors font-semibold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Child Ages */}
                {room.children.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="font-semibold text-gray-900 mb-3 text-sm">
                      {language === 'fr' ? 'Âges des enfants' : language === 'ar' ? 'أعمار الأطفال' : 'Children Ages'}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {room.children.map((age, childIndex) => (
                        <div key={childIndex}>
                          <label className="text-xs text-gray-600 mb-1 block">
                            {language === 'fr' ? `Enfant ${childIndex + 1}` : language === 'ar' ? `طفل ${childIndex + 1}` : `Child ${childIndex + 1}`}
                          </label>
                          <select
                            value={age}
                            onChange={(e) => updateChildAge(roomIndex, childIndex, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white"
                          >
                            {Array.from({ length: 12 }, (_, i) => (
                              <option key={i} value={i}>{i} {language === 'fr' ? 'ans' : language === 'ar' ? 'سنة' : 'years'}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
            })}
          </div>

          {/* Summary */}
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-5">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              {language === 'fr' ? 'Résumé' : language === 'ar' ? 'ملخص' : 'Summary'}
            </div>
            <div className="text-lg font-bold text-primary-900">
              {rooms} {t.guestSelector.rooms} • {totalAdults} {t.guestSelector.adults}
              {totalChildren > 0 ? ` • ${totalChildren} ${t.guestSelector.children}` : ''}
            </div>
          </div>

          {/* Validate Button */}
          <button
            type="button"
            onClick={handleClose}
            className="w-full bg-primary-700 text-white py-4 rounded-xl font-bold text-base hover:bg-primary-800 transition-colors shadow-md hover:shadow-lg"
          >
            {t.guestSelector.done}
          </button>
        </div>
      )}
    </div>
  );
};

export default GuestSelector;
