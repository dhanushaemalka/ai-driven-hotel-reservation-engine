import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { assets, facilityIcons, roomCommonData } from '../assets/assets'
import StarRating from '../components/StarRating'
import { useAppContext } from '../context/AppContext'
import { BRAND, THEME, CURRENCY } from '../config/theme'
import toast from 'react-hot-toast'

const RoomDetails = () => {
  const { id } = useParams()
  const { axios, rooms, currency, getToken, user, navigate } = useAppContext()
  const [room, setRoom] = useState(null)
  const [mainImage, setMainImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookingData, setBookingData] = useState({
    checkInDate: '',
    checkOutDate: '',
    guests: 1,
    paymentMethod: 'pay_at_cottage'
  })
  const [checking, setChecking] = useState(false)

  const fetchRoom = async () => {
    try {
      // First try to find in existing rooms data
      const foundRoom = rooms.find(r => r._id === id)
      if (foundRoom) {
        setRoom(foundRoom)
        setMainImage(foundRoom.images?.[0] || null)
        setLoading(false)
        return
      }
      
      // If not found, fetch from API
      const { data } = await axios.get(`/api/rooms/${id}`)
      if (data.success) {
        setRoom(data.room)
        setMainImage(data.room.images?.[0] || null)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoom()
  }, [id, rooms])

  const handleBooking = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please login to book a room')
      return
    }

    if (!bookingData.checkInDate || !bookingData.checkOutDate) {
      toast.error('Please select check-in and check-out dates')
      return
    }

    if (new Date(bookingData.checkOutDate) <= new Date(bookingData.checkInDate)) {
      toast.error('Check-out date must be after check-in date')
      return
    }

    if (bookingData.guests > room.capacity) {
      toast.error(`Maximum capacity for this room is ${room.capacity} guests`)
      return
    }

    setChecking(true)
    try {
      // Check availability first
      const { data: availData } = await axios.post('/api/bookings/check-availability', {
        room: id,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate
      })

      if (!availData.success || !availData.isAvailable) {
        toast.error('Room is not available for selected dates')
        return
      }

      // Create booking
      const { data } = await axios.post('/api/bookings/book', {
        room: id,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        guests: bookingData.guests,
        paymentMethod: bookingData.paymentMethod,
        guestName: user.fullName || user.firstName,
        guestEmail: user.emailAddresses?.[0]?.emailAddress
      }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        toast.success('Booking created successfully!')
        navigate('/my-bookings')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setChecking(false)
    }
  }

  // Calculate total price
  const calculateTotal = () => {
    if (!bookingData.checkInDate || !bookingData.checkOutDate || !room) return 0
    const checkIn = new Date(bookingData.checkInDate)
    const checkOut = new Date(bookingData.checkOutDate)
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
    return nights > 0 ? nights * room.pricePerNight : 0
  }

  if (loading) {
    return (
      <div className='py-28 md:py-36 px-4 md:px-16 lg:px-24 xl:px-32 flex justify-center items-center min-h-[60vh]'>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className='w-10 h-10 border-4 rounded-full'
          style={{ borderColor: `${THEME.colors.primary}20`, borderTopColor: THEME.colors.primary }}
        />
      </div>
    )
  }

  return room && (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className='py-28 md:py-36 px-4 md:px-16 lg:px-24 xl:px-32'
    >
      {/*Room Details*/}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className='flex flex-col md:flex-row items-start md:items-center gap-3'
      >
        <h1 className='text-3xl md:text-4xl font-bold' style={{ fontFamily: THEME.fonts.heading }}>
          {room.roomType}
          <span className='text-sm ml-2 text-gray-500 font-normal'>Room {room.roomNumber}</span>
        </h1>
        {room.isAvailable && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className='inline-flex items-center gap-1.5 text-xs font-medium py-1.5 px-3 text-white rounded-full'
            style={{ backgroundColor: THEME.colors.success }}
          >
            <span className='w-1.5 h-1.5 rounded-full bg-white animate-pulse'></span>
            Available Now
          </motion.span>
        )}
      </motion.div>

      {/*Room Rating*/}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='flex items-center gap-2 mt-3'
      >
        <StarRating />
        <p className='text-sm ml-2' style={{ color: THEME.colors.primary }}>{BRAND.name}</p>
      </motion.div>

      {/*Room Address*/}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className='flex items-center gap-1.5 text-gray-500 mt-2'
      >
        <img src={assets.locationIcon} alt="location" className='w-4 h-4' />
        <span>{BRAND.address}</span>
      </motion.div>

      {/*Room Images*/}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className='flex flex-col lg:flex-row mt-8 gap-6'
      >
        <div className='lg:w-1/2 w-full overflow-hidden rounded-2xl'>
          <AnimatePresence mode="wait">
            {mainImage ? (
              <motion.img
                key={mainImage}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                src={mainImage}
                alt="Room Main"
                className='w-full rounded-2xl shadow-lg object-cover h-80'
              />
            ) : (
              <div className='w-full h-80 rounded-2xl flex items-center justify-center'
                style={{ background: `linear-gradient(135deg, ${THEME.colors.primary}30, ${THEME.colors.accent}30)` }}>
                <span className='text-6xl'>🏠</span>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className='grid grid-cols-2 gap-4 lg:w-1/2 w-full'>
          {room?.images?.length > 1 && room.images.map((image, index) => (
            <motion.img
              onClick={() => setMainImage(image)}
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              src={image}
              alt={`Room ${index + 1}`}
              className={`w-full h-36 rounded-xl shadow-md object-cover cursor-pointer transition-all ${
                mainImage === image ? 'ring-2 ring-offset-2' : 'hover:shadow-lg'
              }`}
              style={{ ringColor: mainImage === image ? THEME.colors.primary : 'transparent' }}
            />
          ))}
        </div>
      </motion.div>

      {/* Room Highlights */}
      <div className='flex flex-col md:flex-row md:justify-between mt-10'>
        <div className='flex flex-col'>
          <h1 className='text-3xl md:text-4xl font-playfair'>Experience Comfort & Serenity</h1>
          <div className='flex flex-wrap items-center mt-3 mb-6 gap-4'>
            {room.amenities?.map((item, index) => (
              <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100'>
                {facilityIcons[item] && <img src={facilityIcons[item]} alt={item} className='w-5 h-5' />}
                <p className='text-xs'>{item}</p>
              </div>
            ))}
          </div>
          {room.capacity && (
            <p className='text-gray-600'>
              <span className='font-medium'>Max Guests:</span> {room.capacity} persons
            </p>
          )}
        </div>
        <div className='text-right'>
          <p className='text-3xl font-semibold text-primary'>{currency} {room.pricePerNight?.toLocaleString()}</p>
          <p className='text-gray-500'>per night</p>
        </div>
      </div>

      {/*Room Description*/}
      {room.description && (
        <div className='max-w-3xl border-y border-gray-300 my-10 py-10 text-gray-600'>
          <p>{room.description}</p>
        </div>
      )}

      {/*Check-in / Check-out Form*/}
      <form onSubmit={handleBooking} className='flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-10 max-w-6xl'>
        <div className='flex flex-col flex-wrap md:flex-row items-start md:items-center gap-4 md:gap-10 text-gray-500'>
          <div className='flex flex-col'>
            <label htmlFor="checkInDate" className='font-medium'>Check-In</label>
            <input 
              type="date" 
              id='checkInDate' 
              value={bookingData.checkInDate}
              onChange={(e) => setBookingData({...bookingData, checkInDate: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
              className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none' 
              required 
            />
          </div>

          <div className='w-px h-16 bg-gray-300/70 max-md:hidden'></div>

          <div className='flex flex-col'>
            <label htmlFor="checkOutDate" className='font-medium'>Check-Out</label>
            <input 
              type="date" 
              id='checkOutDate' 
              value={bookingData.checkOutDate}
              onChange={(e) => setBookingData({...bookingData, checkOutDate: e.target.value})}
              min={bookingData.checkInDate || new Date().toISOString().split('T')[0]}
              className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none' 
              required 
            />
          </div>

          <div className='w-px h-16 bg-gray-300/70 max-md:hidden'></div>

          <div className='flex flex-col'>
            <label htmlFor="guests" className='font-medium'>Guests</label>
            <input 
              type="number" 
              id='guests' 
              value={bookingData.guests}
              onChange={(e) => setBookingData({...bookingData, guests: parseInt(e.target.value) || 1})}
              min={1}
              max={room.capacity || 4}
              className='w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none' 
              required 
            />
          </div>

          <div className='w-px h-16 bg-gray-300/70 max-md:hidden'></div>

          <div className='flex flex-col min-w-[180px]'>
            <label htmlFor="paymentMethod" className='font-medium'>Payment Method</label>
            <select
              id='paymentMethod'
              value={bookingData.paymentMethod}
              onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value })}
              className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none bg-white'
              required
            >
              <option value='pay_at_cottage'>Pay at cottage</option>
              <option value='card'>Card</option>
              <option value='bank_transfer'>Bank transfer</option>
              <option value='online'>Online payment</option>
            </select>
          </div>

          {calculateTotal() > 0 && (
            <>
              <div className='w-px h-16 bg-gray-300/70 max-md:hidden'></div>
              <div className='flex flex-col'>
                <p className='font-medium'>Total</p>
                <p className='text-xl font-semibold text-primary mt-1'>{currency} {calculateTotal().toLocaleString()}</p>
              </div>
            </>
          )}
        </div>

        <button 
          type='submit' 
          disabled={checking || !room.isAvailable}
          className='bg-primary hover:bg-primary-dull active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-8 py-3 md:py-4 text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {checking ? 'Booking...' : room.isAvailable ? 'Book Now' : 'Not Available'}
        </button>
      </form>

      {/*Common specifications*/}
      <div className='mt-20 space-y-4'>
        {roomCommonData?.map((spec, index) => (
          <div key={index} className='flex items-start gap-2'>
            <img src={spec.icon} alt={`${spec.title} icon`} className='w-6' />
            <div>
              <p className='text-base'>{spec.title}</p>
              <p className='text-gray-500'>{spec.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/*Hosted by*/}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className='flex flex-col items-start gap-4 mt-10 pt-10 border-t border-gray-200'
      >
        <div className='flex gap-4 items-center'>
          <div className='h-16 w-16 rounded-full flex items-center justify-center'
            style={{ background: `linear-gradient(135deg, ${THEME.colors.primary}, ${THEME.colors.accent})` }}>
            <span className='text-3xl'>🏡</span>
          </div>
          <div className='flex flex-col'>
            <p className='text-lg md:text-xl font-semibold' style={{ fontFamily: THEME.fonts.heading }}>
              Hosted by {BRAND.name}
            </p>
            <p className='text-sm text-gray-600'>{BRAND.address}</p>
          </div>
        </div>
        <p className='text-gray-600 max-w-2xl'>
          {BRAND.description}
        </p>
        <motion.a 
          href={`tel:${BRAND.phone}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className='inline-flex items-center gap-2 px-6 py-2.5 mt-2 rounded-xl text-white transition-all cursor-pointer'
          style={{ backgroundColor: THEME.colors.primary }}
        >
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
          </svg>
          Contact Host
        </motion.a>
      </motion.div>
    </motion.div>
  )
}

export default RoomDetails
