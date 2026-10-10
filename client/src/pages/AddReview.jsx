import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Title from '../components/Title'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const AddReview = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { axios, getToken, user } = useAppContext()
  const [loading, setLoading] = useState(false)
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [bookingOptions, setBookingOptions] = useState([])
  const [selectedBookingId, setSelectedBookingId] = useState('')
  const [bookingLoadError, setBookingLoadError] = useState('')

  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    cleanlinessRating: 5,
    serviceRating: 5,
    locationRating: 5,
    valueRating: 5,
    foodRating: 5
  })

  const selectedBooking = useMemo(() => {
    if (!selectedBookingId) return null
    return bookingOptions.find((b) => String(b._id) === String(selectedBookingId)) || null
  }, [bookingOptions, selectedBookingId])

  useEffect(() => {
    const fetchEligibleBookings = async () => {
      setLoadingBookings(true)
      setBookingLoadError('')
      try {
        const token = await getToken()
        if (!token) {
          setBookingOptions([])
          setSelectedBookingId('')
          setBookingLoadError('Please sign in again to load your stays.')
          return
        }
        const { data } = await axios.get('/api/bookings/user', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const bookings = data?.success && Array.isArray(data.bookings) ? data.bookings : []
        const now = new Date()
        const eligible = bookings.filter((b) => {
          const completed = b?.status === 'completed'
          const checkout = b?.checkOutDate ? new Date(b.checkOutDate) : null
          return completed && checkout && checkout < now && b?.room?._id
        })

        if (eligible.length > 0) {
          setBookingOptions(eligible)
          const initialId =
            bookingId && bookingId !== 'demo'
              ? eligible.find((b) => String(b._id) === String(bookingId))?._id
              : eligible[0]._id
          setSelectedBookingId(String(initialId || eligible[0]._id))
        } else {
          setBookingOptions([])
          setSelectedBookingId('')
        }
      } catch {
        setBookingOptions([])
        setSelectedBookingId('')
        setBookingLoadError('Could not load your bookings right now. Please refresh and try again.')
      } finally {
        setLoadingBookings(false)
      }
    }
    fetchEligibleBookings()
  }, [axios, bookingId, getToken])

  const handleRatingClick = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const RatingInput = ({ label, field, value }) => (
    <div className='mb-4'>
      <label className='block text-sm font-medium text-gray-700 mb-2'>{label}</label>
      <div className='flex gap-2'>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type='button'
            onClick={() => handleRatingClick(field, star)}
            className={`text-3xl transition-all hover:scale-110 ${
              star <= value ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </button>
        ))}
        <span className='ml-2 text-gray-600 self-center'>{value}/5</span>
      </div>
    </div>
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Please add a title for your review')
      return
    }
    if (!formData.comment.trim()) {
      toast.error('Please write your review')
      return
    }

    if (!selectedBookingId) {
      toast.error('Please select the room you stayed in')
      return
    }

    if (!user) {
      toast.error('Please sign in to submit a review')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        bookingId: selectedBookingId
      }
      const token = await getToken()
      if (!token) {
        toast.error('Could not verify your session — please sign in again')
        return
      }
      const response = await axios.post('/api/reviews', payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response?.data?.success === true) {
        toast.success('✅ Review submitted successfully!')
        setTimeout(() => navigate('/reviews'), 1000)
      } else {
        toast.error(response?.data?.message || 'Could not submit review')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='py-28 md:py-32 px-4 md:px-16 lg:px-24 max-w-4xl mx-auto'>
      <Title 
        title='Write a Review' 
        subTitle='Share your experience at Cloudy Hill Cottage'
      />

      {/* Booking / Room Selection */}
      <div className='bg-gray-50 rounded-xl p-6 mt-8'>
        <div className='mb-4'>
          <label className='block text-sm font-semibold text-gray-700 mb-2'>
            Select the room you stayed in
          </label>
          <select
            value={selectedBookingId}
            onChange={(e) => setSelectedBookingId(e.target.value)}
            disabled={loadingBookings}
            className='w-full md:w-[420px] border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-100'
          >
            {loadingBookings ? (
              <option>Loading your stays...</option>
            ) : bookingOptions.length === 0 ? (
              <option>No completed stays available for review</option>
            ) : (
              bookingOptions.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.room?.roomType || 'Room'} - Room {b.room?.roomNumber || 'N/A'} ({new Date(b.checkInDate).toLocaleDateString()} to {new Date(b.checkOutDate).toLocaleDateString()})
                </option>
              ))
            )}
          </select>
          {!loadingBookings && bookingLoadError && (
            <p className='text-sm text-red-600 mt-2'>{bookingLoadError}</p>
          )}
          {!loadingBookings && !bookingLoadError && bookingOptions.length === 0 && (
            <p className='text-sm text-amber-700 mt-2'>
              You can review only completed bookings after checkout. Complete a stay first, then come back.
            </p>
          )}
        </div>

      {selectedBooking && (
        <div className='flex flex-col md:flex-row gap-6 items-center'>
          <img 
            src={selectedBooking.room?.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400'} 
            alt='Room' 
            className='w-32 h-24 object-cover rounded-lg'
          />
          <div>
            <h3 className='font-semibold text-lg'>{selectedBooking.room?.roomType}</h3>
            <p className='text-gray-500'>Room {selectedBooking.room?.roomNumber}</p>
            <p className='text-sm text-gray-400 mt-1'>
              {new Date(selectedBooking.checkInDate).toLocaleDateString()} - {new Date(selectedBooking.checkOutDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
      </div>

      {/* Review Form */}
      <form onSubmit={handleSubmit} className='mt-8 space-y-6'>
        {/* Overall Rating */}
        <div className='bg-white rounded-xl shadow-md p-6'>
          <h3 className='font-semibold text-lg mb-4'>Overall Rating</h3>
          <div className='flex items-center gap-4'>
            <div className='flex gap-1'>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type='button'
                  onClick={() => handleRatingClick('rating', star)}
                  className={`text-4xl transition-all hover:scale-110 ${
                    star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <span className='text-2xl font-semibold text-gray-700'>{formData.rating}/5</span>
          </div>
        </div>

        {/* Category Ratings */}
        <div className='bg-white rounded-xl shadow-md p-6'>
          <h3 className='font-semibold text-lg mb-4'>Rate by Category</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <RatingInput label='Cleanliness' field='cleanlinessRating' value={formData.cleanlinessRating} />
            <RatingInput label='Service' field='serviceRating' value={formData.serviceRating} />
            <RatingInput label='Location' field='locationRating' value={formData.locationRating} />
            <RatingInput label='Value for Money' field='valueRating' value={formData.valueRating} />
            <RatingInput label='Food & Dining' field='foodRating' value={formData.foodRating} />
          </div>
        </div>

        {/* Review Content */}
        <div className='bg-white rounded-xl shadow-md p-6'>
          <h3 className='font-semibold text-lg mb-4'>Your Review</h3>
          
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Review Title *</label>
            <input
              type='text'
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder='Summarize your experience in a few words'
              className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none'
              maxLength={100}
            />
            <p className='text-xs text-gray-400 mt-1'>{formData.title.length}/100 characters</p>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Your Experience *</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder='Tell us about your stay. What did you love? Any suggestions for improvement?'
              className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-40 resize-none'
              maxLength={1000}
            />
            <p className='text-xs text-gray-400 mt-1'>{formData.comment.length}/1000 characters</p>
          </div>
        </div>

        {/* Tips */}
        <div className='bg-blue-50 rounded-xl p-6'>
          <h4 className='font-medium text-blue-800 mb-2'>Tips for a helpful review:</h4>
          <ul className='text-sm text-blue-700 space-y-1'>
            <li>• Be specific about what you liked or didn't like</li>
            <li>• Mention the highlights of your stay</li>
            <li>• Share any experiences or activities you enjoyed</li>
            <li>• Keep it honest and constructive</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className='flex gap-4'>
          <button
            type='submit'
            disabled={loading}
            className='flex-1 bg-primary hover:bg-primary-dull text-white py-4 rounded-xl font-semibold transition-colors disabled:opacity-50'
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className='px-8 py-4 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors'
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddReview
