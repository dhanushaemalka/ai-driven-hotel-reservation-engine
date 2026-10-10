import React, { useState, useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import { BRAND, THEME } from '../../config/theme'
import toast from 'react-hot-toast'

const ManageReviews = () => {
  const { axios, getToken } = useAppContext()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [respondingTo, setRespondingTo] = useState(null)
  const [response, setResponse] = useState('')
  const [filter, setFilter] = useState('all')

  // Sample data for UI demo
  const sampleReviews = [
    {
      _id: '1',
      user: { username: 'Sarah Johnson', email: 'sarah@email.com' },
      room: { roomType: 'Deluxe Room', roomNumber: 'R201' },
      rating: 5,
      title: 'Absolutely magical stay!',
      comment: 'The views from Cloudy Hill Cottage are breathtaking! Waking up to see the mist rolling over Ella Gap was unforgettable. Renu\'s cooking class was the highlight - I learned to make the most amazing jackfruit curry. Highly recommend!',
      cleanlinessRating: 5,
      serviceRating: 5,
      locationRating: 5,
      valueRating: 5,
      foodRating: 5,
      helpfulVotes: 24,
      isApproved: true,
      createdAt: '2026-02-15T10:30:00Z',
      adminResponse: 'Thank you so much Sarah! We loved having you and are thrilled you enjoyed the cooking class. Hope to see you again soon!',
      adminResponseDate: '2026-02-16T08:00:00Z'
    },
    {
      _id: '2',
      user: { username: 'Mike Chen', email: 'mike@email.com' },
      room: { roomType: 'Honeymoon Suite', roomNumber: 'R401' },
      rating: 5,
      title: 'Perfect honeymoon destination',
      comment: 'We spent our honeymoon here and it was perfect. The private jacuzzi, the stunning sunsets, and the warm hospitality made it an unforgettable experience.',
      cleanlinessRating: 5,
      serviceRating: 5,
      locationRating: 5,
      valueRating: 4,
      foodRating: 5,
      helpfulVotes: 18,
      isApproved: true,
      createdAt: '2026-02-10T14:20:00Z',
      adminResponse: null
    },
    {
      _id: '3',
      user: { username: 'Emma Wilson', email: 'emma@email.com' },
      room: { roomType: 'Family Suite', roomNumber: 'R301' },
      rating: 4,
      title: 'Great family getaway',
      comment: 'Traveled with kids and they loved it! The family suite was spacious and comfortable. The Nine Arch Bridge tour was fantastic. Only minor issue was the WiFi was a bit slow.',
      cleanlinessRating: 4,
      serviceRating: 5,
      locationRating: 5,
      valueRating: 4,
      foodRating: 5,
      helpfulVotes: 12,
      isApproved: true,
      createdAt: '2026-02-05T09:15:00Z',
      adminResponse: null
    },
    {
      _id: '4',
      user: { username: 'John Doe', email: 'john@email.com' },
      room: { roomType: 'Standard Room', roomNumber: 'R102' },
      rating: 3,
      title: 'Good but could be better',
      comment: 'The location and views are amazing, but the room was smaller than expected. Breakfast was great though!',
      cleanlinessRating: 3,
      serviceRating: 4,
      locationRating: 5,
      valueRating: 3,
      foodRating: 4,
      helpfulVotes: 5,
      isApproved: false,
      createdAt: '2026-02-18T11:00:00Z',
      adminResponse: null
    }
  ]

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get('/api/reviews', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success && data.reviews.length > 0) {
        setReviews(data.reviews)
      } else {
        setReviews(sampleReviews)
      }
    } catch (error) {
      setReviews(sampleReviews)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleRespond = async (reviewId) => {
    if (!response.trim()) {
      toast.error('Please enter a response')
      return
    }

    try {
      const { data } = await axios.put(`/api/reviews/${reviewId}/respond`, 
        { adminResponse: response },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      )
      if (data.success) {
        toast.success('Response added successfully!')
        setRespondingTo(null)
        setResponse('')
        fetchReviews()
      }
    } catch (error) {
      // Demo mode
      const updated = reviews.map(r => 
        r._id === reviewId 
          ? { ...r, adminResponse: response, adminResponseDate: new Date().toISOString() }
          : r
      )
      setReviews(updated)
      toast.success('Response added! (Demo)')
      setRespondingTo(null)
      setResponse('')
    }
  }

  const handleDelete = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      const { data } = await axios.delete(`/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        toast.success('Review deleted')
        fetchReviews()
      }
    } catch (error) {
      // Demo mode
      setReviews(reviews.filter(r => r._id !== reviewId))
      toast.success('Review deleted! (Demo)')
    }
  }

  const toggleApproval = async (reviewId, currentStatus) => {
    // Demo mode - just toggle locally
    const updated = reviews.map(r => 
      r._id === reviewId ? { ...r, isApproved: !currentStatus } : r
    )
    setReviews(updated)
    toast.success(`Review ${!currentStatus ? 'approved' : 'hidden'}! (Demo)`)
  }

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`${i < rating ? 'text-amber-600' : 'text-slate-300'}`}>★</span>
    ))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredReviews = filter === 'all' 
    ? reviews 
    : filter === 'pending' 
      ? reviews.filter(r => !r.adminResponse)
      : filter === 'responded'
        ? reviews.filter(r => r.adminResponse)
        : filter === 'hidden'
          ? reviews.filter(r => !r.isApproved)
          : reviews

  // Stats
  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => !r.adminResponse).length,
    avgRating: reviews.length > 0 
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : 0
  }

  if (loading) {
    return (
      <div className='p-6 flex justify-center items-center h-64'>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className='p-6 space-y-6 text-slate-900'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-slate-900' style={{ fontFamily: THEME.fonts.heading }}>
          Review Management
        </h1>
        <p className='text-slate-600 mt-1 font-medium'>
          Monitor and respond to guest feedback at {BRAND.name}. Review text can only be changed by the guest who
          wrote it.
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white rounded-2xl border border-slate-200 shadow-sm p-5'>
          <p className='text-slate-600 text-sm font-medium'>Total Reviews</p>
          <p className='text-3xl font-bold text-slate-900 mt-1'>{stats.total}</p>
        </div>
        <div className='bg-white rounded-2xl border border-slate-200 shadow-sm p-5'>
          <p className='text-slate-600 text-sm font-medium'>Average Rating</p>
          <p className='text-3xl font-bold mt-1 text-amber-800'>{stats.avgRating} ★</p>
        </div>
        <div className='bg-white rounded-2xl border border-slate-200 shadow-sm p-5'>
          <p className='text-slate-600 text-sm font-medium'>Pending Response</p>
          <p className='text-3xl font-bold text-amber-800 mt-1'>{stats.pending}</p>
        </div>
        <div className='bg-white rounded-2xl border border-slate-200 shadow-sm p-5'>
          <p className='text-slate-600 text-sm font-medium'>Response Rate</p>
          <p className='text-3xl font-bold text-emerald-800 mt-1'>
            {stats.total > 0 ? Math.round(((stats.total - stats.pending) / stats.total) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex gap-2 flex-wrap'>
        {[
          { id: 'all', label: 'All Reviews', count: reviews.length },
          { id: 'pending', label: 'Needs Response', count: reviews.filter(r => !r.adminResponse).length },
          { id: 'responded', label: 'Responded', count: reviews.filter(r => r.adminResponse).length },
          { id: 'hidden', label: 'Hidden', count: reviews.filter(r => !r.isApproved).length }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
              filter === f.id
                ? 'text-white shadow-md border-transparent'
                : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200 hover:border-slate-400'
            }`}
            style={{ backgroundColor: filter === f.id ? THEME.colors.primary : undefined }}
          >
            {f.label} <span className={`ml-1 ${filter === f.id ? 'text-white/90' : 'text-slate-600'}`}>({f.count})</span>
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className='space-y-4'>
        {filteredReviews.map((review) => (
          <div
            key={review._id}
            className={`bg-white rounded-xl border border-slate-200 shadow-sm p-6 ${!review.isApproved ? 'border-l-4 border-l-red-500' : ''}`}
          >
            {/* Header */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-white font-semibold'>
                  {review.user?.username?.charAt(0) || 'G'}
                </div>
                <div>
                  <p className='font-semibold text-slate-900'>{review.user?.username}</p>
                  <p className='text-sm text-slate-600'>{review.user?.email}</p>
                </div>
              </div>
              <div className='flex items-center gap-4'>
                <div className='text-right'>
                  <div className='flex justify-end'>{renderStars(review.rating)}</div>
                  <p className='text-xs text-slate-600 font-medium'>{formatDate(review.createdAt)}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    review.isApproved
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  {review.isApproved ? 'Visible' : 'Hidden'}
                </span>
              </div>
            </div>

            {/* Room Info */}
            <p className='text-sm text-slate-700 font-medium mb-2'>
              {review.room?.roomType} - Room {review.room?.roomNumber}
            </p>

            {/* Review content (only the author can change this; not editable here) */}
            <h4 className='font-semibold text-slate-900'>{review.title}</h4>
            <p className='text-slate-700 mt-1 leading-relaxed'>{review.comment}</p>

            <div className='flex flex-wrap gap-2 mt-3'>
              {[
                ['Cleanliness', review.cleanlinessRating],
                ['Service', review.serviceRating],
                ['Location', review.locationRating],
                ['Value', review.valueRating],
                ['Food', review.foodRating],
              ].map(([label, val]) => (
                <span
                  key={label}
                  className='text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-1 rounded-md'
                >
                  {label}: {val}/5
                </span>
              ))}
            </div>

            {/* Admin Response */}
            {review.adminResponse && (
              <div className='mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='bg-blue-700 text-white text-xs font-semibold px-2 py-1 rounded'>Your Response</span>
                  <span className='text-xs text-slate-600'>{formatDate(review.adminResponseDate)}</span>
                </div>
                <p className='text-slate-800 text-sm leading-relaxed'>{review.adminResponse}</p>
              </div>
            )}

            {/* Response Form */}
            {respondingTo === review._id && (
              <div className='mt-4 bg-gray-50 rounded-lg p-4'>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder='Write your response to this review...'
                  className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none'
                  rows={3}
                  maxLength={500}
                />
                <div className='flex justify-between items-center mt-2'>
                  <span className='text-xs text-gray-400'>{response.length}/500</span>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => { setRespondingTo(null); setResponse(''); }}
                      className='px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm'
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRespond(review._id)}
                      className='px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dull'
                    >
                      Submit Response
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className='flex gap-3 mt-4 pt-4 border-t border-slate-200'>
              {!review.adminResponse && respondingTo !== review._id && (
                <button
                  onClick={() => setRespondingTo(review._id)}
                  className='text-sm text-primary hover:text-primary-dull font-medium'
                >
                  Respond
                </button>
              )}
              <button
                onClick={() => toggleApproval(review._id, review.isApproved)}
                className={`text-sm font-medium ${
                  review.isApproved ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'
                }`}
              >
                {review.isApproved ? 'Hide Review' : 'Approve Review'}
              </button>
              <button
                onClick={() => handleDelete(review._id)}
                className='text-sm text-red-600 hover:text-red-700 font-medium'
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className='text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm'>
          <p className='text-slate-600 font-medium'>No reviews found.</p>
        </div>
      )}
    </div>
  )
}

export default ManageReviews
