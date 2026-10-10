import React from 'react';

function NewsLetter() {
  return (
    <div className="relative overflow-hidden flex flex-col items-center max-w-5xl lg:w-full rounded-2xl px-6 py-12 md:py-16 mx-4 lg:mx-auto my-16 bg-gradient-to-br from-emerald-800 to-teal-900 text-white">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 text-center">
        <span className="text-5xl mb-4 block">🏔️</span>
        <h2 className="font-playfair text-3xl md:text-4xl font-bold">
          Ready to Experience Ella?
        </h2>
        <p className="text-emerald-100 mt-4 max-w-xl mx-auto">
          Book your stay at Cloudy Hill Cottage and wake up to breathtaking mountain views, 
          authentic Sri Lankan hospitality, and unforgettable experiences.
        </p>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
        <a 
          href="tel:+94715934715"
          className="flex items-center gap-2 bg-white text-emerald-800 px-6 py-3 rounded-full font-medium hover:bg-emerald-50 transition-colors"
        >
          📞 +94 71 593 4715
        </a>
        <a 
          href="/rooms"
          className="flex items-center gap-2 border-2 border-white px-6 py-3 rounded-full font-medium hover:bg-white/10 transition-colors"
        >
          View Rooms & Book
        </a>
      </div>

      {/* Location Info */}
      <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-emerald-200">
        <span className="flex items-center gap-2">
          📍 Sooriyagahawatte, Kithalella, Ella
        </span>
        <span className="flex items-center gap-2">
          🚂 2.3 km from Ella Station
        </span>
        <span className="flex items-center gap-2">
          ⏰ Check-in: 1:00 PM
        </span>
      </div>

      <p className="relative z-10 text-emerald-300/60 mt-8 text-xs text-center">
        💡 Remember: We accept cash only (LKR/USD/EUR) • Children welcome • Free parking available
      </p>
    </div>
  );
}

export default NewsLetter;
