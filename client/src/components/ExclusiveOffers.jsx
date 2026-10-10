import React from 'react'
import Title from './Title'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const ExclusiveOffers = () => {
  const { navigate } = useAppContext();

  const packages = [
    {
      id: 1,
      title: "Cooking Experience",
      description: "Learn 3 curries, yellow rice & coconut sambal with host Renu",
      highlight: "Includes Jackfruit Curry",
      icon: "👩‍🍳",
      color: "from-amber-500 to-orange-600"
    },
    {
      id: 2,
      title: "Sunrise Package",
      description: "Wake up to breathtaking views with breakfast on your balcony",
      highlight: "Ella Rock Views",
      icon: "🌅",
      color: "from-rose-500 to-pink-600"
    },
    {
      id: 3,
      title: "Adventure Bundle",
      description: "Ella Rock hike maps, packed breakfast & scooter rental",
      highlight: "Full Day Exploration",
      icon: "🥾",
      color: "from-emerald-500 to-teal-600"
    }
  ];

  return (
    <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 xl:px-32 pt-20 pb-24'>

      {/* Top Section */}
      <div className='flex flex-col md:flex-row items-center justify-between w-full'>
        <Title
          align="left"
          title="Special Experiences"
          subTitle="Enhance your stay at Cloudy Hill Cottage with our curated packages and authentic Sri Lankan experiences"
        />

        <button 
          onClick={() => navigate('/experience')}
          className='group flex items-center gap-2 font-medium cursor-pointer max-md:mt-12 text-emerald-600 hover:text-emerald-700'
        >
          View All Experiences
          <img
            src={assets.arrowIcon}
            alt="arrow-icon"
            className='group-hover:translate-x-1 transition-all'
          />
        </button>
      </div>

      {/* Packages Grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full'>
        {packages.map((item) => (
          <div
            key={item.id}
            className={`group relative flex flex-col items-start justify-between rounded-2xl text-white bg-gradient-to-br ${item.color} p-6 min-h-[280px] overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer`}
            onClick={() => navigate('/experience')}
          >
            {/* Decorative circle */}
            <div className='absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full'></div>
            <div className='absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full'></div>
            
            <div className='relative z-10'>
              <span className='text-5xl'>{item.icon}</span>
              <p className='text-2xl font-bold font-playfair mt-4'>{item.title}</p>
              <p className='text-white/90 mt-2 text-sm'>{item.description}</p>
            </div>

            <div className='relative z-10 w-full'>
              <span className='inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs'>
                ✨ {item.highlight}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Info */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 w-full'>
        {[
          { icon: "🛏️", label: "King Size Beds" },
          { icon: "📶", label: "Free WiFi" },
          { icon: "🍳", label: "Breakfast Included" },
          { icon: "🚗", label: "Free Parking" },
        ].map((item, index) => (
          <div key={index} className='flex items-center gap-3 bg-gray-50 rounded-xl p-4'>
            <span className='text-2xl'>{item.icon}</span>
            <span className='text-gray-700 text-sm font-medium'>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExclusiveOffers
