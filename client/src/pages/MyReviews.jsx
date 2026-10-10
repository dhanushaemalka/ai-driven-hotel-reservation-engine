import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import Title from '../components/Title'
import toast from 'react-hot-toast'

const defaultForm = {
  rating: 5,
  title: '',
  comment: '',
  cleanlinessRating: 5,
  serviceRating: 5,
  locationRating: 5,
  valueRating: 5,
  foodRating: 5,
}

const MyReviews = () => {
  const { axios, getToken, user, navigate } = useAppContext()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  const fetchMyReviews = async () => {
    try {
      const { data } = await axios.get('/api/reviews/user', {
        headers: { Authorization: `Bearer ${await getToken()}` },
      })
      if (data?.success) {
        setReviews(data.reviews || [])
      } else {
        toast.error(data?.message || 'Could not load your reviews')
      }
    } catch {
      toast.error('Could not load your reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetchMyReviews()
  }, [user])

  const openEdit = (review) => {
    setEditingId(review._id)
    setForm({
      rating: review.rating || 5,
      title: review.title || '',
      comment: review.comment || '',
      cleanlinessRating: review.cleanlinessRating || review.rating || 5,
      serviceRating: review.serviceRating || review.rating || 5,
      locationRating: review.locationRating || review.rating || 5,
      valueRating: review.valueRating || review.rating || 5,
      foodRating: review.foodRating || review.rating || 5,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(defaultForm)
  }

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const saveReview = async (reviewId) => {
    if (!form.title.trim() || !form.comment.trim()) {
      toast.error('Title and comment are required')
      return
    }
    setSaving(true)
    try {
      const { data } = await axios.put(`/api/reviews/${reviewId}`, form, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      })
      if (!data?.success) {
        toast.error(data?.message || 'Could not save changes')
        return
      }

      setReviews((prev) =>
        prev.map((r) =>
          String(r._id) === String(reviewId)
            ? { ...r, ...form, updatedAt: new Date().toISOString() }
            : r
        )
      )
      toast.success('Review updated')
      cancelEdit()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save changes')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className='py-28 md:py-32 px-4 md:px-16 lg:px-24 max-w-4xl mx-auto'>
        <Title title='My Reviews' subTitle='Sign in to view and edit your own reviews.' />
        <div className='mt-8 rounded-xl border border-slate-200 bg-white p-6'>
          <p className='text-slate-600'>You need to sign in first.</p>
          <button
            type='button'
            onClick={() => navigate('/reviews')}
            className='mt-4 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dull'
          >
            Back to reviews
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='py-28 md:py-32 px-4 md:px-16 lg:px-24 max-w-5xl mx-auto'>
      <Title
        title='My Reviews'
        subTitle='You can edit only reviews that you posted. Admin can respond, hide, or delete for moderation.'
      />

      {loading ? (
        <div className='mt-8 space-y-4'>
          {[1, 2].map((i) => (
            <div key={i} className='rounded-xl border border-slate-200 bg-white p-6 animate-pulse space-y-3'>
              <div className='h-5 w-48 bg-slate-200 rounded' />
              <div className='h-4 w-full bg-slate-100 rounded' />
              <div className='h-4 w-3/4 bg-slate-100 rounded' />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className='mt-8 text-center py-14 rounded-xl border border-dashed border-slate-300 bg-white/70'>
          <p className='text-slate-700 font-medium'>You have not posted any reviews yet.</p>
          <button
            type='button'
            onClick={() => navigate('/add-review')}
            className='mt-4 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dull'
          >
            Add your first review
          </button>
        </div>
      ) : (
        <div className='mt-8 space-y-5'>
          {reviews.map((review) => (
            <article key={review._id} className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
              <div className='flex flex-wrap justify-between gap-3'>
                <div>
                  <h3 className='text-lg font-semibold text-slate-900'>{review.title}</h3>
                  <p className='text-sm text-slate-500 mt-1'>
                    {review.room?.roomType || 'Room'} · {review.room?.roomNumber || 'N/A'}
                  </p>
                </div>
                <span className='text-sm text-slate-600'>Overall: {review.rating}/5</span>
              </div>

              {editingId === review._id ? (
                <div className='mt-4 space-y-3'>
                  <label className='block'>
                    <span className='text-sm font-medium text-slate-700'>Title</span>
                    <input
                      type='text'
                      value={form.title}
                      onChange={(e) => updateForm('title', e.target.value)}
                      className='mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm'
                      maxLength={100}
                    />
                  </label>
                  <label className='block'>
                    <span className='text-sm font-medium text-slate-700'>Comment</span>
                    <textarea
                      value={form.comment}
                      onChange={(e) => updateForm('comment', e.target.value)}
                      className='mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none'
                      rows={4}
                      maxLength={1000}
                    />
                  </label>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                    {[
                      ['rating', 'Overall'],
                      ['cleanlinessRating', 'Cleanliness'],
                      ['serviceRating', 'Service'],
                      ['locationRating', 'Location'],
                      ['valueRating', 'Value'],
                      ['foodRating', 'Food'],
                    ].map(([key, label]) => (
                      <label key={key} className='block'>
                        <span className='text-xs font-medium text-slate-600'>{label}</span>
                        <input
                          type='number'
                          min='1'
                          max='5'
                          value={form[key]}
                          onChange={(e) => updateForm(key, parseInt(e.target.value || '1', 10))}
                          className='mt-1 w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm'
                        />
                      </label>
                    ))}
                  </div>
                  <div className='flex gap-2 justify-end'>
                    <button
                      type='button'
                      onClick={cancelEdit}
                      className='px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm'
                    >
                      Cancel
                    </button>
                    <button
                      type='button'
                      onClick={() => saveReview(review._id)}
                      disabled={saving}
                      className='px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-60'
                    >
                      {saving ? 'Saving...' : 'Save changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className='text-slate-700 mt-3 whitespace-pre-wrap'>{review.comment}</p>
                  <div className='mt-4 flex flex-wrap gap-2'>
                    {[
                      ['Cleanliness', review.cleanlinessRating],
                      ['Service', review.serviceRating],
                      ['Location', review.locationRating],
                      ['Value', review.valueRating],
                      ['Food', review.foodRating],
                    ].map(([label, value]) => (
                      <span
                        key={label}
                        className='text-xs text-slate-700 bg-slate-100 border border-slate-300 px-2 py-1 rounded-md'
                      >
                        {label}: {value}/5
                      </span>
                    ))}
                  </div>
                  <div className='mt-4 pt-4 border-t border-slate-200 flex items-center justify-between'>
                    <span className='text-xs text-slate-500'>
                      {review.updatedAt ? 'Last updated' : 'Created'}:{' '}
                      {new Date(review.updatedAt || review.createdAt).toLocaleDateString('en-US')}
                    </span>
                    <button
                      type='button'
                      onClick={() => openEdit(review)}
                      className='text-sm font-medium text-primary hover:text-primary-dull'
                    >
                      Edit my review
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyReviews
