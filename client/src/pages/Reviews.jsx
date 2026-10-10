import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Title from '../components/Title'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const PAGE_SIZE = 6
const COMMENT_PREVIEW = 280

const Reviews = () => {
  const navigate = useNavigate()
  const { axios } = useAppContext()
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [expandedComments, setExpandedComments] = useState({})
  const [markedHelpful, setMarkedHelpful] = useState({})

  const firstLoadRef = useRef(true)

  const sampleReviews = [
    {
      _id: '1',
      user: { username: 'Sarah Johnson', image: null },
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
      createdAt: '2026-02-15T10:30:00Z',
      adminResponse: 'Thank you so much Sarah! We loved having you and are thrilled you enjoyed the cooking class. Hope to see you again soon!',
      adminResponseDate: '2026-02-16T08:00:00Z'
    },
    {
      _id: '2',
      user: { username: 'Mike Chen', image: null },
      room: { roomType: 'Honeymoon Suite', roomNumber: 'R401' },
      rating: 5,
      title: 'Perfect honeymoon destination',
      comment: 'We spent our honeymoon here and it was perfect. The private jacuzzi, the stunning sunsets, and the warm hospitality made it an unforgettable experience. The Ella Rock sunrise hike arranged by the cottage was amazing!',
      cleanlinessRating: 5,
      serviceRating: 5,
      locationRating: 5,
      valueRating: 4,
      foodRating: 5,
      helpfulVotes: 18,
      createdAt: '2026-02-10T14:20:00Z',
      adminResponse: null
    },
    {
      _id: '3',
      user: { username: 'Emma Wilson', image: null },
      room: { roomType: 'Family Suite', roomNumber: 'R301' },
      rating: 4,
      title: 'Great family getaway',
      comment: 'Traveled with kids and they loved it! The family suite was spacious and comfortable. The Nine Arch Bridge tour was fantastic. Only minor issue was the WiFi was a bit slow, but honestly we didn\'t need it much with all the activities.',
      cleanlinessRating: 4,
      serviceRating: 5,
      locationRating: 5,
      valueRating: 4,
      foodRating: 5,
      helpfulVotes: 12,
      createdAt: '2026-02-05T09:15:00Z',
      adminResponse: 'Thank you Emma! We\'re glad the kids had fun. We\'ve upgraded our WiFi since your visit - hope to host your family again!',
      adminResponseDate: '2026-02-06T10:30:00Z'
    },
    {
      _id: '4',
      user: { username: 'David Park', image: null },
      room: { roomType: 'Standard Room', roomNumber: 'R101' },
      rating: 5,
      title: 'Best value in Ella',
      comment: 'For the price, you can\'t beat this place. Clean rooms, amazing breakfast included, and the hosts go above and beyond. The tea plantation tour they arranged was a highlight of my Sri Lanka trip.',
      cleanlinessRating: 5,
      serviceRating: 5,
      locationRating: 4,
      valueRating: 5,
      foodRating: 5,
      helpfulVotes: 31,
      createdAt: '2026-01-28T16:45:00Z',
      adminResponse: null
    },
    {
      _id: '5',
      user: { username: 'Lisa Anderson', image: null },
      room: { roomType: 'Deluxe Room', roomNumber: 'R202' },
      rating: 4,
      title: 'Peaceful retreat with stunning views',
      comment: 'The location is perfect - away from the busy town but still accessible. Loved sitting on the balcony with my morning tea watching the clouds roll by. The food was exceptional, especially the hoppers for breakfast!',
      cleanlinessRating: 5,
      serviceRating: 4,
      locationRating: 5,
      valueRating: 4,
      foodRating: 5,
      helpfulVotes: 8,
      createdAt: '2026-01-20T11:00:00Z',
      adminResponse: null
    }
  ]

  const sampleStats = {
    averageRating: '4.6',
    averageCleanliness: '4.8',
    averageService: '4.8',
    averageLocation: '4.8',
    averageValue: '4.4',
    averageFood: '5.0',
    totalReviews: 5
  }

  const fetchReviews = async () => {
    setRefreshing(true)
    try {
      const { data } = await axios.get('/api/reviews/cottage')
      if (data?.success && data?.reviews) {
        setReviews(data.reviews)
        setStats(data.stats || sampleStats)
      } else {
        setReviews(sampleReviews)
        setStats(sampleStats)
      }
      if (!firstLoadRef.current) {
        toast.success('Reviews updated')
      }
    } catch {
      setReviews(sampleReviews)
      setStats(sampleStats)
      if (!firstLoadRef.current) {
        toast.error('Using offline preview data')
      }
    } finally {
      firstLoadRef.current = false
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [filter, searchQuery, sortBy])

  const ratingDistribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    for (const r of reviews) {
      const n = Number(r.rating)
      if (n >= 1 && n <= 5) counts[n] += 1
    }
    const total = reviews.length || 1
    return { counts, total }
  }, [reviews])

  const processedReviews = useMemo(() => {
    let list = [...reviews]

    if (filter !== 'all') {
      const n = parseInt(filter, 10)
      list = list.filter((r) => r.rating === n)
    }

    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter((r) => {
        const user = r.user?.username || ''
        const room = `${r.room?.roomType || ''} ${r.room?.roomNumber || ''}`
        const title = r.title || ''
        const comment = r.comment || ''
        return (
          user.toLowerCase().includes(q) ||
          room.toLowerCase().includes(q) ||
          title.toLowerCase().includes(q) ||
          comment.toLowerCase().includes(q)
        )
      })
    }

    list.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime()
      const tb = new Date(b.createdAt).getTime()
      switch (sortBy) {
        case 'oldest':
          return ta - tb
        case 'rating_high':
          return (b.rating || 0) - (a.rating || 0) || tb - ta
        case 'helpful':
          return (b.helpfulVotes || 0) - (a.helpfulVotes || 0) || tb - ta
        case 'newest':
        default:
          return tb - ta
      }
    })

    return list
  }, [reviews, filter, searchQuery, sortBy])

  const displayedReviews = useMemo(
    () => processedReviews.slice(0, visibleCount),
    [processedReviews, visibleCount]
  )

  const hasMore = processedReviews.length > visibleCount

  const toggleExpanded = (id) => {
    const key = String(id)
    setExpandedComments((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleHelpful = async (review) => {
    const id = review._id
    if (!id || markedHelpful[id]) return
    try {
      const { data } = await axios.post(`/api/reviews/${id}/helpful`)
      if (data?.success) {
        setMarkedHelpful((prev) => ({ ...prev, [id]: true }))
        setReviews((prev) =>
          prev.map((r) =>
            String(r._id) === String(id) ? { ...r, helpfulVotes: data.helpfulVotes } : r
          )
        )
        toast.success('Marked as helpful')
      } else {
        toast.error(data?.message || 'Could not save')
      }
    } catch {
      toast.error('Could not record vote')
    }
  }

  const clearFilters = () => {
    setFilter('all')
    setSearchQuery('')
    setSortBy('newest')
  }

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`text-sm ${i < rating ? 'text-amber-600' : 'text-slate-200'}`} aria-hidden>
        ★
      </span>
    ))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="py-28 md:py-32 px-4 md:px-16 lg:px-24 max-w-6xl mx-auto">
        <div className="h-8 w-48 bg-slate-200 rounded-md animate-pulse mb-3" />
        <div className="h-4 w-full max-w-xl bg-slate-100 rounded animate-pulse mb-10" />
        <div className="rounded-xl border border-slate-200 p-8 space-y-6 animate-pulse">
          <div className="flex gap-8">
            <div className="h-20 w-24 bg-slate-200 rounded" />
            <div className="flex-1 grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-6 animate-pulse space-y-4">
              <div className="flex gap-4">
                <div className="h-11 w-11 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-slate-200 rounded" />
                  <div className="h-3 w-64 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="h-4 w-3/4 max-w-md bg-slate-100 rounded" />
              <div className="h-20 bg-slate-50 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative py-28 md:py-32 px-4 md:px-16 lg:px-24 max-w-7xl mx-auto overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full bg-violet-200/30 blur-3xl" />
      <div className="pointer-events-none absolute top-24 -right-20 w-80 h-80 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="flex-1 min-w-0">
          <Title
            title="Guest Reviews"
            subTitle="Read what our guests have to say about their stay at Cloudy Hill Cottage"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => navigate('/my-reviews')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white/95 border border-slate-200 rounded-lg hover:bg-white hover:border-slate-300 transition-colors shadow-sm backdrop-blur"
          >
            My reviews
          </button>
          <button
            type="button"
            onClick={() => fetchReviews()}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white/95 border border-slate-200 rounded-lg hover:bg-white hover:border-slate-300 transition-colors disabled:opacity-60 disabled:pointer-events-none shadow-sm backdrop-blur"
          >
            <svg
              className={`w-4 h-4 text-slate-600 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Updating…' : 'Refresh'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/add-review')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-emerald-500 hover:from-primary-dull hover:to-emerald-600 rounded-lg transition-all shadow-md"
          >
            <svg className="w-4 h-4 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Write a review
          </button>
        </div>
      </div>

      {stats && (
        <div className="mt-8 rounded-2xl border border-white/70 bg-white/85 p-6 md:p-8 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-stretch gap-8">
            <div className="text-center md:text-left md:border-r md:border-slate-200 md:pr-8 shrink-0">
              <div className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 tabular-nums">
                {stats.averageRating}
              </div>
              <div className="flex justify-center md:justify-start mt-2 gap-0.5">
                {renderStars(Math.round(parseFloat(stats.averageRating)))}
              </div>
              <p className="text-sm text-slate-500 mt-2">{stats.totalReviews} verified guest reviews</p>
            </div>

            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-2">
              {[
                { label: 'Cleanliness', value: stats.averageCleanliness },
                { label: 'Service', value: stats.averageService },
                { label: 'Location', value: stats.averageLocation },
                { label: 'Value', value: stats.averageValue },
                { label: 'Food', value: stats.averageFood },
              ].map(({ label, value }) => (
                <div key={label} className="text-center md:text-left px-2 py-2 rounded-lg bg-gradient-to-b from-white to-slate-50 border border-slate-200/80 shadow-sm">
                  <p className="text-lg font-semibold text-slate-800 tabular-nums">{value}</p>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Rating breakdown</p>
            <div className="space-y-2 max-w-md">
              {[5, 4, 3, 2, 1].map((star) => {
                const n = ratingDistribution.counts[star] || 0
                const pct = Math.round((n / ratingDistribution.total) * 100)
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFilter(String(star))}
                    className={`w-full flex items-center gap-3 text-left rounded-lg px-2 py-1.5 -mx-2 transition-colors ${
                      filter === String(star) ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-medium text-slate-600 w-8 tabular-nums">{star}★</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500/90 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 tabular-nums w-10 text-right">{n}</span>
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="mt-3 text-xs font-medium text-primary hover:text-primary-dull"
            >
              Show all ratings
            </button>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-20 -mx-2 px-2 py-3 mt-8 mb-2 bg-white/85 backdrop-blur-xl border border-white/70 rounded-xl shadow-[0_12px_35px_-22px_rgba(15,23,42,0.55)]">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1 min-w-0">
            <label htmlFor="reviews-search" className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1.5">
              Search
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="reviews-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Guest name, room, title, or keywords…"
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
                autoComplete="off"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="reviews-sort" className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1.5">
                Sort
              </label>
              <select
                id="reviews-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm font-medium text-slate-800 border border-slate-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 min-w-[200px]"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="rating_high">Highest rated</option>
                <option value="helpful">Most helpful</option>
              </select>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Quick</p>
              <div className="inline-flex flex-wrap p-1 rounded-lg bg-slate-100/90 border border-slate-200/80 gap-1">
                {['all', '5', '4', '3', '2', '1'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      filter === f
                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                    }`}
                  >
                    {f === 'all' ? 'All' : `${f}★`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500" aria-live="polite">
          Showing <span className="font-semibold text-slate-700 tabular-nums">{displayedReviews.length}</span> of{' '}
          <span className="tabular-nums">{processedReviews.length}</span> matching reviews
        </p>
      </div>

      <div className="mt-6 space-y-6">
        {displayedReviews.map((review) => {
          const userInfo = review.user || { username: 'Guest', image: null }
          const roomInfo = review.room || { roomType: 'Room', roomNumber: 'N/A' }
          const comment = review.comment || ''
          const idKey = String(review._id)
          const isLong = comment.length > COMMENT_PREVIEW
          const expanded = !!expandedComments[idKey]
          const shownComment =
            !isLong || expanded ? comment : `${comment.slice(0, COMMENT_PREVIEW).trim()}…`

          return (
            <article
              key={idKey}
              className="bg-white/95 rounded-2xl border border-slate-200/90 p-6 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.45)] hover:shadow-[0_20px_45px_-24px_rgba(15,23,42,0.5)] hover:border-slate-300/90 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 shrink-0 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-sm ring-2 ring-white shadow-sm">
                    {userInfo?.username?.charAt?.(0) || 'G'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{userInfo?.username || 'Guest'}</h3>
                    <p className="text-sm text-slate-500 truncate">
                      {roomInfo?.roomType || 'Room'} · {roomInfo?.roomNumber || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex justify-end gap-0.5" title={`${review.rating} out of 5`}>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 tabular-nums">{formatDate(review.createdAt)}</p>
                  {review.isVerified ? (
                    <span className="inline-flex mt-2 items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                      Verified stay
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-base text-slate-900 leading-snug">{review.title}</h4>
                <p className="text-slate-600 mt-2 text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap">
                  {shownComment}
                </p>
                {isLong ? (
                  <button
                    type="button"
                    onClick={() => toggleExpanded(idKey)}
                    className="mt-2 text-sm font-medium text-primary hover:text-primary-dull"
                  >
                    {expanded ? 'Show less' : 'Read full review'}
                  </button>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {review.cleanlinessRating ? (
                  <span className="text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-md">
                    Cleanliness {review.cleanlinessRating}/5
                  </span>
                ) : null}
                {review.serviceRating ? (
                  <span className="text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-md">
                    Service {review.serviceRating}/5
                  </span>
                ) : null}
                {review.locationRating ? (
                  <span className="text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-md">
                    Location {review.locationRating}/5
                  </span>
                ) : null}
                {review.valueRating ? (
                  <span className="text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-md">
                    Value {review.valueRating}/5
                  </span>
                ) : null}
                {review.foodRating ? (
                  <span className="text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-md">
                    Food {review.foodRating}/5
                  </span>
                ) : null}
              </div>

              {review.adminResponse ? (
                <div className="mt-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-white p-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700 bg-white border border-indigo-200 px-2 py-0.5 rounded">
                      Host response
                    </span>
                    {review.adminResponseDate ? (
                      <span className="text-xs text-slate-400">{formatDate(review.adminResponseDate)}</span>
                    ) : null}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{review.adminResponse}</p>
                </div>
              ) : null}

              <div className="mt-4 flex items-center pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleHelpful(review)}
                  disabled={!!markedHelpful[review._id]}
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50/80 hover:bg-slate-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  {markedHelpful[review._id] ? 'Marked helpful' : 'Helpful'} · {review.helpfulVotes ?? 0}
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {hasMore ? (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
          >
            Load more ({processedReviews.length - visibleCount} remaining)
          </button>
        </div>
      ) : null}

      {processedReviews.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
          <p className="text-slate-700 font-medium">No reviews match your filters</p>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Try clearing search, choosing “All” ratings, or refreshing the list.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dull rounded-lg"
          >
            Clear filters
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default Reviews
