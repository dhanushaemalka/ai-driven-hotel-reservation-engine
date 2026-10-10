import React, { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const AddExperience = () => {
  const { axios, getToken, navigate } = useAppContext()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    category: 'adventure',
    duration: '',
    price: '',
    maxParticipants: 6,
    difficulty: 'easy',
    highlights: [''],
    priceIncludes: [''],
    whatToBring: [''],
    scheduleStartTime: '',
    scheduleEndTime: '',
    availableDays: []
    ,
    images: ['']
  })

  const categories = [
    { value: 'cooking', label: 'Cooking Class' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'nature', label: 'Nature' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'photography', label: 'Photography' }
  ]

  const difficulties = [
    { value: 'easy', label: 'Easy - Suitable for everyone' },
    { value: 'moderate', label: 'Moderate - Some fitness required' },
    { value: 'challenging', label: 'Challenging - Good fitness required' }
  ]

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Daily']

  const handleArrayChange = (field, index, value) => {
    const updated = [...formData[field]]
    updated[index] = value
    setFormData({ ...formData, [field]: updated })
  }

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] })
  }

  const removeArrayItem = (field, index) => {
    const updated = formData[field].filter((_, i) => i !== index)
    setFormData({ ...formData, [field]: updated.length ? updated : [''] })
  }

  const handleDayToggle = (day) => {
    const updated = formData.availableDays.includes(day)
      ? formData.availableDays.filter(d => d !== day)
      : [...formData.availableDays, day]
    setFormData({ ...formData, availableDays: updated })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        shortDescription: formData.shortDescription,
        category: formData.category,
        duration: formData.duration,
        price: Number(formData.price),
        maxParticipants: Number(formData.maxParticipants),
        difficulty: formData.difficulty,
        highlights: formData.highlights.filter(h => h.trim()),
        priceIncludes: formData.priceIncludes.filter(p => p.trim()),
        whatToBring: formData.whatToBring.filter(w => w.trim()),
        schedule: {
          startTime: formData.scheduleStartTime,
          endTime: formData.scheduleEndTime,
          availableDays: formData.availableDays
        },
        images: formData.images.filter(img => img.trim()),
        isActive: true
      }

      const { data } = await axios.post('/api/experiences', payload, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        toast.success('Experience created successfully!')
        navigate('/admin/experiences')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create experience')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='p-6 max-w-4xl'>
      <h1 className='text-2xl font-semibold mb-6'>Add New Experience</h1>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Basic Info */}
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-lg font-medium mb-4'>Basic Information</h2>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Experience Name *</label>
              <input
                type='text'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none'
                placeholder='e.g., Traditional Sri Lankan Cooking Class'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none'
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Difficulty *</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none'
                required
              >
                {difficulties.map(diff => (
                  <option key={diff.value} value={diff.value}>{diff.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Price (LKR) *</label>
              <input
                type='number'
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none'
                placeholder='e.g., 4500'
                min='0'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Max Participants *</label>
              <input
                type='number'
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none'
                min='1'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Duration *</label>
              <input
                type='text'
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none'
                placeholder='e.g., 3-4 hours'
                required
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-lg font-medium mb-4'>Description</h2>
          
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Short Description *</label>
              <input
                type='text'
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none'
                placeholder='Brief description for cards (max 100 chars)'
                maxLength={100}
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Full Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-32'
                placeholder='Detailed description of the experience...'
                required
              />
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-lg font-medium mb-4'>Highlights</h2>
          
          {formData.highlights.map((highlight, index) => (
            <div key={index} className='flex gap-2 mb-2'>
              <input
                type='text'
                value={highlight}
                onChange={(e) => handleArrayChange('highlights', index, e.target.value)}
                className='flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none'
                placeholder='e.g., Learn 3 traditional recipes'
              />
              <button
                type='button'
                onClick={() => removeArrayItem('highlights', index)}
                className='px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg'
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type='button'
            onClick={() => addArrayItem('highlights')}
            className='text-primary hover:text-primary-dull text-sm'
          >
            + Add Highlight
          </button>
        </div>

        {/* Images */}
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-lg font-medium mb-4'>Image URLs</h2>
          <p className='text-sm text-gray-500 mb-3'>
            Paste Cloudinary secure URLs (or any public image URLs).
          </p>

          {formData.images.map((image, index) => (
            <div key={index} className='flex gap-2 mb-2'>
              <input
                type='url'
                value={image}
                onChange={(e) => handleArrayChange('images', index, e.target.value)}
                className='flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none'
                placeholder='https://res.cloudinary.com/...'
              />
              <button
                type='button'
                onClick={() => removeArrayItem('images', index)}
                className='px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg'
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type='button'
            onClick={() => addArrayItem('images')}
            className='text-primary hover:text-primary-dull text-sm'
          >
            + Add Image URL
          </button>
        </div>

        {/* Price Includes */}
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-lg font-medium mb-4'>What's Included in Price</h2>
          
          {formData.priceIncludes.map((item, index) => (
            <div key={index} className='flex gap-2 mb-2'>
              <input
                type='text'
                value={item}
                onChange={(e) => handleArrayChange('priceIncludes', index, e.target.value)}
                className='flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none'
                placeholder='e.g., All ingredients and materials'
              />
              <button
                type='button'
                onClick={() => removeArrayItem('priceIncludes', index)}
                className='px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg'
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type='button'
            onClick={() => addArrayItem('priceIncludes')}
            className='text-primary hover:text-primary-dull text-sm'
          >
            + Add Item
          </button>
        </div>

        {/* What to Bring */}
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-lg font-medium mb-4'>What Guests Should Bring</h2>
          
          {formData.whatToBring.map((item, index) => (
            <div key={index} className='flex gap-2 mb-2'>
              <input
                type='text'
                value={item}
                onChange={(e) => handleArrayChange('whatToBring', index, e.target.value)}
                className='flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none'
                placeholder='e.g., Comfortable walking shoes'
              />
              <button
                type='button'
                onClick={() => removeArrayItem('whatToBring', index)}
                className='px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg'
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type='button'
            onClick={() => addArrayItem('whatToBring')}
            className='text-primary hover:text-primary-dull text-sm'
          >
            + Add Item
          </button>
        </div>

        {/* Schedule */}
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-lg font-medium mb-4'>Schedule</h2>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Start Time</label>
              <input
                type='text'
                value={formData.scheduleStartTime}
                onChange={(e) => setFormData({ ...formData, scheduleStartTime: e.target.value })}
                className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none'
                placeholder='e.g., 9:00 AM'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>End Time</label>
              <input
                type='text'
                value={formData.scheduleEndTime}
                onChange={(e) => setFormData({ ...formData, scheduleEndTime: e.target.value })}
                className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none'
                placeholder='e.g., 1:00 PM'
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Available Days</label>
            <div className='flex flex-wrap gap-2'>
              {daysOfWeek.map(day => (
                <button
                  key={day}
                  type='button'
                  onClick={() => handleDayToggle(day)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.availableDays.includes(day)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className='flex gap-4'>
          <button
            type='submit'
            disabled={loading}
            className='bg-primary hover:bg-primary-dull text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-colors'
          >
            {loading ? 'Creating...' : 'Create Experience'}
          </button>
          <button
            type='button'
            onClick={() => navigate('/admin/experiences')}
            className='px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors'
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddExperience
