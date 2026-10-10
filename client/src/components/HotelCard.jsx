import React from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { THEME, CURRENCY } from "../config/theme";

const HotelCard = ({ room, index }) => {
  const { currency } = useAppContext();

  const roomTitle = room.roomType || room.hotel?.name || "Deluxe Mountain Sanctuary Suite";
  const imageSrc = room.images?.[0] || "/hero-bg.jpg";

  return (
    <Link
      to={"/rooms/" + room._id}
      onClick={() => window.scrollTo(0, 0)}
      className="group relative flex flex-col rounded-3xl overflow-hidden bg-white text-gray-700 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-1.5"
    >
      {/* Image Container with Zoom */}
      <div className="relative h-56 w-full overflow-hidden bg-gray-100">
        <img
          src={imageSrc}
          alt={roomTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800";
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5">
          {index % 2 === 0 ? (
            <span className="px-3 py-1 text-xs font-semibold bg-emerald-950/80 text-amber-300 backdrop-blur-md rounded-full shadow-sm">
              ✨ Best Seller
            </span>
          ) : (
            <span className="px-3 py-1 text-xs font-semibold bg-white/90 text-emerald-900 backdrop-blur-md rounded-full shadow-sm">
              🌄 Mountain View
            </span>
          )}
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-full">
          <span className="text-amber-400">★</span> 4.9
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold uppercase tracking-wider">
            <span>📍 Ella Mountain Sanctuary</span>
          </div>

          <h3 
            className="text-xl font-bold text-gray-900 mt-1.5 group-hover:text-emerald-800 transition-colors line-clamp-1"
            style={{ fontFamily: THEME.fonts.heading }}
          >
            {roomTitle}
          </h3>

          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {room.description || "Panoramic hill views, king bed, private sunrise balcony & luxury en-suite bathroom."}
          </p>

          {/* Quick Amenities */}
          <div className="flex items-center gap-2 mt-3 text-[11px] text-gray-600">
            <span className="bg-gray-50 px-2 py-0.5 rounded-md">🛏️ King Bed</span>
            <span className="bg-gray-50 px-2 py-0.5 rounded-md">☕ Breakfast</span>
            <span className="bg-gray-50 px-2 py-0.5 rounded-md">📶 High-Speed WiFi</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-400 block font-medium">Starting from</span>
            <p className="text-lg font-bold text-emerald-900">
              {CURRENCY.display(room.pricePerNight)}
              <span className="text-xs font-normal text-gray-500"> / night</span>
            </p>
          </div>
          
          <span 
            className="px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-md group-hover:scale-105 transition-all"
            style={{ backgroundColor: THEME.colors.primary }}
          >
            Reserve →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
