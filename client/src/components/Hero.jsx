import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import { BRAND, THEME } from '../config/theme';

const Hero = () => {
  const { navigate } = useAppContext();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  return (
    <div 
      className='relative min-h-[92vh] md:min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-16 lg:px-24 xl:px-32 text-white overflow-hidden pt-24 pb-16'
      style={{ 
        background: `radial-gradient(ellipse at top, ${THEME.colors.primaryLight} 0%, ${THEME.colors.primary} 60%, ${THEME.colors.primaryDark} 100%)`
      }}
    >
      {/* Ambient background glow & atmospheric mist effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-32 -left-20 w-[500px] h-[500px] rounded-full blur-[120px] opacity-25"
          style={{ background: THEME.colors.accent }}
        />
        <div 
          className="absolute top-1/3 -right-20 w-[600px] h-[600px] rounded-full blur-[140px] opacity-20"
          style={{ background: THEME.colors.secondaryLight }}
        />
        <div 
          className="absolute -bottom-40 left-1/3 w-[700px] h-[500px] rounded-full blur-[160px] opacity-30"
          style={{ background: THEME.colors.primaryLight }}
        />
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Mountain silhouette bottom fog transition */}
      <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />

      {/* Main Content Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-4xl mx-auto w-full"
      >
        {/* Badges */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className='flex flex-wrap items-center justify-center gap-3 mb-6'
        >
          <span 
            className='inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium tracking-wide shadow-lg backdrop-blur-xl border border-amber-400/30'
            style={{ 
              background: "rgba(212, 175, 55, 0.15)",
              color: THEME.colors.accentLight 
            }}
          >
            <span className="text-amber-300">★</span> {BRAND.rating || "9.8/10 Exceptional Rating"}
          </span>
          <span 
            className='inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium tracking-wide shadow-lg backdrop-blur-xl border border-white/20'
            style={{ 
              background: "rgba(255, 255, 255, 0.1)",
              color: "#FFFFFF" 
            }}
          >
            📍 {BRAND.locationBadge || "Ella, Sri Lanka"}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.15] text-white drop-shadow-md' 
          style={{ fontFamily: THEME.fonts.heading }}
        >
          {BRAND.name}
        </motion.h1>
        
        {/* Subtitle / Tagline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className='text-base sm:text-lg md:text-xl mt-5 max-w-2xl mx-auto font-light leading-relaxed text-emerald-50/90'
        >
          {BRAND.description}
        </motion.p>

        {/* Key Highlight Pills */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
          className='flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8'
        >
          {(BRAND.highlights || [
            { icon: "🌅", title: "Sunrise Views from Bed" },
            { icon: "🍛", title: "Authentic Home-Cooked Curries" },
            { icon: "👨‍🍳", title: "Traditional Cooking Classes" }
          ]).map((item, idx) => (
            <div 
              key={idx}
              className='flex items-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-md px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-white/95 border border-white/10 shadow-sm transition-all'
            >
              <span>{item.icon}</span>
              <span>{item.title}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Floating Glass Booking Widget */}
      <motion.form 
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.7, type: "spring" }}
        onSubmit={onSearch} 
        className='relative z-10 bg-white/95 backdrop-blur-2xl text-gray-800 rounded-3xl p-4 sm:p-5 md:p-6 flex flex-col md:flex-row items-stretch md:items-center gap-4 mt-10 shadow-2xl max-w-4xl w-full border border-white/60'
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.3)"
        }}
      >
        {/* Check-in */}
        <div className='flex-1 bg-gray-50/80 hover:bg-emerald-50/40 rounded-2xl p-3 px-4 border border-gray-100 transition-colors'>
          <label htmlFor="checkIn" className='text-xs uppercase tracking-wider font-semibold text-gray-500 flex items-center gap-1.5'>
            <span className="text-emerald-700">📅</span> Check-in
          </label>
          <input
            id="checkIn"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full bg-transparent font-medium text-gray-800 text-sm mt-1 outline-none cursor-pointer"
            required
          />
        </div>

        {/* Check-out */}
        <div className='flex-1 bg-gray-50/80 hover:bg-emerald-50/40 rounded-2xl p-3 px-4 border border-gray-100 transition-colors'>
          <label htmlFor="checkOut" className='text-xs uppercase tracking-wider font-semibold text-gray-500 flex items-center gap-1.5'>
            <span className="text-emerald-700">📅</span> Check-out
          </label>
          <input
            id="checkOut"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-transparent font-medium text-gray-800 text-sm mt-1 outline-none cursor-pointer"
            required
          />
        </div>

        {/* Guests */}
        <div className='w-full md:w-36 bg-gray-50/80 hover:bg-emerald-50/40 rounded-2xl p-3 px-4 border border-gray-100 transition-colors'>
          <label htmlFor="guests" className='text-xs uppercase tracking-wider font-semibold text-gray-500 flex items-center gap-1.5'>
            <span className="text-emerald-700">👥</span> Guests
          </label>
          <select
            id="guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full bg-transparent font-medium text-gray-800 text-sm mt-1 outline-none cursor-pointer"
          >
            <option value={1}>1 Guest</option>
            <option value={2}>2 Guests</option>
            <option value={3}>3 Guests</option>
            <option value={4}>4 Guests</option>
            <option value={5}>5+ Guests</option>
          </select>
        </div>

        {/* Submit CTA */}
        <motion.button 
          type="submit"
          whileHover={{ scale: 1.03, boxShadow: `0 15px 30px -5px ${THEME.colors.primary}60` }}
          whileTap={{ scale: 0.97 }}
          className='w-full md:w-auto flex items-center justify-center gap-2 rounded-2xl py-4 px-8 text-white font-semibold text-sm sm:text-base cursor-pointer shadow-lg transition-all'
          style={{ 
            background: `linear-gradient(135deg, ${THEME.colors.primaryLight} 0%, ${THEME.colors.primary} 100%)`,
          }}
        >
          <span>Check Availability</span>
          <span className="text-amber-300 font-bold">→</span>
        </motion.button>
      </motion.form>

      {/* Subtle Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className='absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity cursor-pointer'
        onClick={() => window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' })}
      >
        <span className="text-[11px] tracking-widest uppercase font-medium text-white/80">Explore Sanctuary</span>
        <div className='w-5 h-8 rounded-full border border-white/40 flex items-start justify-center p-1.5'>
          <div className='w-1 h-2 bg-white/90 rounded-full animate-bounce' />
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;
