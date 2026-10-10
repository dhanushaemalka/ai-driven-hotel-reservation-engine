import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { assets, facilityIcons } from '../assets/assets'
import { useSearchParams } from 'react-router-dom'
import StarRating from '../components/StarRating';
import { useAppContext } from '../context/AppContext';
import { BRAND, THEME, CURRENCY, ANIMATIONS } from '../config/theme';

const CheckBox = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm group">
      <input 
        type="checkbox" 
        checked={selected} 
        onChange={(e) => onChange(e.target.checked, label)} 
        className="w-4 h-4 rounded"
        style={{ accentColor: THEME.colors.primary }}
      />
      <span className='font-light select-none group-hover:text-gray-900 transition-colors'>{label}</span>
    </label>
  )
}

const RadioButton = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm group">
      <input 
        type="radio" 
        name="sortOption" 
        checked={selected} 
        onChange={() => onChange(label)} 
        className="w-4 h-4"
        style={{ accentColor: THEME.colors.primary }}
      />
      <span className='font-light select-none group-hover:text-gray-900 transition-colors'>{label}</span>
    </label>
  )
}

const AllRooms = () => {
   const [searchParams , setSearchParams] = useSearchParams()
   const {rooms,navigate,currency} = useAppContext()
   const selectedExperience = searchParams.get('experience')
 
  const [openFilters, setOpenFilters] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    roomType: [],
    priceRange: [],
  });

  const [selectedSort, setSelectedSort] = useState('')

  const roomTypes = useMemo(() => [...new Set((rooms || []).map((r) => r.roomType).filter(Boolean))], [rooms]);

  const priceRanges = [
    '0 to 10000',
    '10000 to 15000',
    '15000 to 22000',
    '22000 to 40000',
  ];

  const sortOptions = [
    "Price Low to High",
    "Price High to Low",
    "Newest First"
  ];

  // handle changes for filters and sorting

  const  handleFilterChange = (checked, value , type) => {
    setSelectedFilters((prevFilters) => {
     const updatedFilters = { ... prevFilters};
     if(checked){
      updatedFilters[type].push(value);
     }else{
      updatedFilters[type]= updatedFilters[type].filter(item => item !== value);
     }
     return updatedFilters;
    })
  }

  const handleSortChange = ( sortOption) =>{
    setSelectedSort(sortOption);
  }
  //function to check if a room matches the selected room types

  const matchesRoomType = (room) => {
    return selectedFilters.roomType.length === 0 || selectedFilters.roomType.includes(room.roomType);
  }

    //function to check if a room matches the selecte pricetypes

    const matchesPriceRange = (room) => {
    return selectedFilters.priceRange.length === 0 || selectedFilters.priceRange.some(range => {
      const [min,max] = range.split(' to ').map(Number);
      return room.pricePerNight >= min && room.pricePerNight <= max;
    });
  }

   //function to sort room based on the selecteed sort option
  const sortRooms = (a,b) => {
    if(selectedSort === 'Price Low to High'){
return a.pricePerNight - b.pricePerNight;
    }
   if(selectedSort === 'Price High to Low'){
return b.pricePerNight - a.pricePerNight;
   }
   if(selectedSort === 'Newest First'){
return new Date(b.createdAt) - new Date(a.createdAt);
  }
return 0;
}
 // filter destination

 const filterDestination = (room) => {
  const destination =searchParams.get('destination');
  if(!destination) return true;
  const destinationText = `${BRAND.address || ''} ${room.view || ''} ${room.roomType || ''}`.toLowerCase();
  return destinationText.includes(destination.toLowerCase())
 }

  //filter and  sort room based on the selecteed  filters and sort option
const filteredRooms = useMemo(()=>{
  return rooms.filter(room => matchesRoomType(room) && matchesPriceRange(room) && filterDestination(room)).sort(sortRooms);
},[rooms,selectedFilters,selectedSort,searchParams])

// clear all filters

const clearFilters = () => {
  setSelectedFilters({
    roomType : [],
    priceRange: [],
  })

  setSelectedSort('');
    setSearchParams({});
  
}


  return (
    <div
      className='luxury-page-bg min-h-screen flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-36 px-4 md:px-16 lg:px-24 xl:px-32 gap-8'
      style={{
        background:
          'linear-gradient(140deg, rgba(223,236,226,0.75) 0%, rgba(244,248,252,0.96) 36%, rgba(253,246,225,0.8) 100%)'
      }}
    >
      
      {/* LEFT CONTENT */}
      <div className='flex-1 w-full relative z-10'>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='mb-8'
        >
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900' style={{ fontFamily: THEME.fonts.heading }}>
            Our Rooms
          </h1>
          <p className='text-gray-500 mt-3 max-w-2xl'>
            Discover your perfect retreat at {BRAND.name}. Each room offers stunning mountain views and authentic Sri Lankan hospitality.
          </p>
          <div className='flex items-center gap-2 mt-4'>
            <span className='px-3 py-1 rounded-full text-sm' style={{ backgroundColor: `${THEME.colors.primary}10`, color: THEME.colors.primary }}>
              {filteredRooms.length} rooms available
            </span>
          </div>

          {selectedExperience && (
            <div
              className='mt-4 p-4 rounded-xl border'
              style={{
                backgroundColor: `${THEME.colors.primary}08`,
                borderColor: `${THEME.colors.primary}33`
              }}
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-sm font-medium' style={{ color: THEME.colors.primary }}>
                    Booking with experience
                  </p>
                  <p className='text-sm text-gray-700 mt-1'>{decodeURIComponent(selectedExperience)}</p>
                </div>
                <button
                  onClick={() => {
                    const nextParams = new URLSearchParams(searchParams)
                    nextParams.delete('experience')
                    setSearchParams(nextParams)
                  }}
                  className='text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* ROOM LIST */}
        <motion.div 
          variants={ANIMATIONS.staggerContainer}
          initial="initial"
          animate="animate"
          className='space-y-6'
        >
          <AnimatePresence mode="popLayout">
            {filteredRooms.map((room, index) => (
              <motion.div
                key={room._id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.15)" }}
                className='flex flex-col md:flex-row items-stretch bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm cursor-pointer group'
                onClick={() => { navigate(`/rooms/${room._id}`); scrollTo(0, 0); }}
              >
                {/* Image */}
                <div className='relative md:w-2/5 h-64 md:h-auto overflow-hidden'>
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    src={room.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                    alt={room.roomType}
                    className='w-full h-full object-cover'
                  />
                  {/* Room Type Badge */}
                  <div className='absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-medium text-white backdrop-blur-sm'
                    style={{ backgroundColor: `${THEME.colors.primary}CC` }}>
                    {room.roomType}
                  </div>
                  {/* Availability */}
                  {room.isAvailable && (
                    <div className='absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/90 text-white backdrop-blur-sm'>
                      <span className='w-1.5 h-1.5 rounded-full bg-white animate-pulse'></span>
                      Available
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className='flex-1 p-6 flex flex-col'>
                  <div className='flex items-start justify-between mb-3'>
                    <div>
                      <h3 className='text-2xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors' style={{ fontFamily: THEME.fonts.heading }}>
                        {room.roomType}
                      </h3>
                      <p className='text-sm text-gray-500 mt-1'>Room {room.roomNumber} • {room.capacity} guests • {room.view || 'Mountain'} view</p>
                    </div>
                    <div className='flex items-center gap-1 text-sm'>
                      <span className='text-yellow-500'>★</span>
                      <span className='font-medium'>4.9</span>
                    </div>
                  </div>

                  <p className='text-gray-600 text-sm line-clamp-2 mb-4'>
                    {room.description || `Experience comfort and tranquility in our ${room.roomType}. Wake up to stunning views of Ella's misty mountains.`}
                  </p>

                  {/* Amenities */}
                  <div className='flex flex-wrap gap-2 mb-4'>
                    {(room.amenities || []).slice(0, 4).map((item, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + idx * 0.05 }}
                        className='flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium'
                        style={{ backgroundColor: `${THEME.colors.primary}08`, color: THEME.colors.primary }}
                      >
                        {facilityIcons?.[item] && <img src={facilityIcons[item]} alt={item} className='w-3.5 h-3.5' />}
                        {item}
                      </motion.div>
                    ))}
                    {room.amenities?.length > 4 && (
                      <span className='px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600'>
                        +{room.amenities.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Price & CTA */}
                  <div className='mt-auto pt-4 border-t border-gray-100 flex items-center justify-between'>
                    <div>
                      <p className='text-2xl font-bold' style={{ color: THEME.colors.primary }}>
                        {CURRENCY.display(room.pricePerNight)}
                      </p>
                      <p className='text-xs text-gray-400'>per night</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className='px-6 py-2.5 rounded-xl text-white font-medium text-sm transition-all'
                      style={{ backgroundColor: THEME.colors.primary }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/rooms/${room._id}`); scrollTo(0, 0); }}
                    >
                      View Details
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredRooms.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='text-center py-16'
          >
            <div className='w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center' style={{ backgroundColor: `${THEME.colors.primary}10` }}>
              <svg className='w-10 h-10' style={{ color: THEME.colors.primary }} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
              </svg>
            </div>
            <p className='text-gray-500 text-lg'>No rooms match your filters</p>
            <button 
              onClick={clearFilters}
              className='mt-4 px-6 py-2 rounded-xl text-sm font-medium'
              style={{ backgroundColor: `${THEME.colors.primary}10`, color: THEME.colors.primary }}
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>

      {/* FILTERS */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className='w-full lg:w-80 lg:sticky lg:top-28 flex-shrink-0 relative z-10'
      >
        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
          <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100'>
            <p className='font-semibold text-gray-900'>Filters</p>
            <div className='flex items-center gap-3 text-xs'>
              <span 
                onClick={() => setOpenFilters(!openFilters)} 
                className='lg:hidden cursor-pointer font-medium'
                style={{ color: THEME.colors.primary }}
              >
                {openFilters ? 'Hide' : 'Show'}
              </span>
              <span 
                onClick={clearFilters} 
                className='hidden lg:block cursor-pointer font-medium hover:opacity-70 transition-opacity'
                style={{ color: THEME.colors.primary }}
              >
                Clear all
              </span>
            </div>
          </div>

          <motion.div 
            initial={false}
            animate={{ height: openFilters || window.innerWidth >= 1024 ? 'auto' : 0 }}
            className='overflow-hidden'
          >
            <div className='px-5 pt-5'>
              <p className='font-medium text-gray-800 pb-2 text-sm'>Room Type</p>
              {roomTypes.map((room, index) => (
                <CheckBox 
                  key={index} 
                  label={room} 
                  selected={selectedFilters.roomType.includes(room)} 
                  onChange={(checked) => handleFilterChange(checked, room, 'roomType')} 
                />
              ))}
            </div>

            <div className='px-5 pt-5'>
              <p className='font-medium text-gray-800 pb-2 text-sm'>Price Range ({CURRENCY.code})</p>
              {priceRanges.map((range, index) => (
                <CheckBox 
                  key={index} 
                  label={`${CURRENCY.code} ${range}`} 
                  selected={selectedFilters.priceRange.includes(range)} 
                  onChange={(checked) => handleFilterChange(checked, range, 'priceRange')} 
                />
              ))}
            </div>

            <div className='px-5 pt-5 pb-6'>
              <p className='font-medium text-gray-800 pb-2 text-sm'>Sort By</p>
              {sortOptions.map((option, index) => (
                <RadioButton 
                  key={index} 
                  label={option} 
                  selected={selectedSort === option} 
                  onChange={() => handleSortChange(option)} 
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Contact */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className='mt-4 p-5 rounded-2xl text-white'
          style={{ backgroundColor: THEME.colors.primary }}
        >
          <p className='font-semibold mb-2'>Need Help?</p>
          <p className='text-sm opacity-90 mb-3'>Our hosts {BRAND.hosts.names} are happy to assist with your booking.</p>
          <a 
            href={`tel:${BRAND.phone}`} 
            className='inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90'
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
            </svg>
            Call Now
          </a>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default AllRooms
