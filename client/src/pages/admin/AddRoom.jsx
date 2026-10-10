import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import { BRAND, THEME, CURRENCY } from '../../config/theme'
import toast from 'react-hot-toast'

const AddRoom = () => {
  const { axios, getToken } = useAppContext()
  const navigate = useNavigate()

  const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
  const [inputs, setInputs] = useState({
    roomType: '',
    roomNumber: '',
    description: '',
    pricePerNight: '',
    minNegotiablePrice: '',
    capacity: 2,
    floor: 1,
    view: 'mountain',
    bedType: 'double',
    amenities: {
      'Free WiFi': false,
      'Free Breakfast': false,
      'Room Service': false,
      'Mountain View': false,
      'Private Balcony': false,
      'Hot Water': false,
      'Air Conditioning': false,
      'Mini Bar': false,
      'Safe': false,
      'TV': false,
    }
  })
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    if (!inputs.roomType || !inputs.roomNumber || !inputs.pricePerNight) {
      toast.error("Please fill in all required fields")
      return
    }

    if (Number(inputs.pricePerNight) <= 0) {
      toast.error("Price must be greater than 0")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('roomType', inputs.roomType)
      formData.append('roomNumber', inputs.roomNumber)
      formData.append('description', inputs.description)
      formData.append('pricePerNight', inputs.pricePerNight)
      formData.append('minNegotiablePrice', inputs.minNegotiablePrice || Math.round(inputs.pricePerNight * 0.8))
      formData.append('capacity', inputs.capacity)
      formData.append('floor', inputs.floor)
      formData.append('view', inputs.view)
      formData.append('bedType', inputs.bedType)

      const amenities = Object.keys(inputs.amenities).filter(key => inputs.amenities[key])
      formData.append('amenities', JSON.stringify(amenities))

      Object.keys(images).forEach((key) => {
        images[key] && formData.append('images', images[key])
      })

      const { data } = await axios.post('/api/rooms', formData, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        toast.success('Room added successfully!')
        navigate('/admin/list-room')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link to="/admin/list-room" className="hover:text-gray-700">Rooms</Link>
            <span>/</span>
            <span>Add New</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: THEME.fonts.heading }}>
            Add New Room
          </h1>
          <p className="text-gray-500 mt-1">Create a new room listing for {BRAND.name}</p>
        </div>
      </div>

      <form onSubmit={onSubmitHandler} className="max-w-4xl">
        {/* Images Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Room Photos</h2>
          <p className="text-sm text-gray-500 mb-4">Upload up to 4 images. First image will be the cover photo.</p>
          
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {Object.keys(images).map((key) => (
              <label 
                htmlFor={`roomImages${key}`} 
                key={key}
                className="relative aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400 transition-colors cursor-pointer overflow-hidden group"
              >
                {images[key] ? (
                  <>
                    <img
                      className='w-full h-full object-cover'
                      src={URL.createObjectURL(images[key])}
                      alt=""
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm">Change</span>
                    </div>
                    {key === '1' && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded-lg">
                        Cover
                      </span>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs">Upload</span>
                  </div>
                )}
                <input
                  type='file'
                  accept='image/*'
                  id={`roomImages${key}`}
                  hidden
                  onChange={(e) => setImages({ ...images, [key]: e.target.files[0] })}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>Room Type *</label>
              <select 
                value={inputs.roomType} 
                onChange={e => setInputs({...inputs, roomType: e.target.value})}
                className={inputClass}
                style={{ '--tw-ring-color': THEME.colors.primary }}
                required
              >
                <option value="">Select Room Type</option>
                <option value="Standard">Standard Room</option>
                <option value="Deluxe">Deluxe Room</option>
                <option value="Suite">Suite</option>
                <option value="Family Suite">Family Suite</option>
                <option value="Honeymoon Suite">Honeymoon Suite</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>Room Number *</label>
              <input 
                type="text" 
                placeholder='e.g., 101' 
                className={inputClass}
                value={inputs.roomNumber} 
                onChange={e => setInputs({...inputs, roomNumber: e.target.value})}
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Price per Night ({CURRENCY.code}) *
              </label>
              <input 
                type="number" 
                placeholder='8500' 
                min="1"
                className={inputClass}
                value={inputs.pricePerNight} 
                onChange={e => setInputs({...inputs, pricePerNight: e.target.value})}
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Min Negotiable Price ({CURRENCY.code})
                <span className="text-xs text-gray-400 ml-1">(for AI chatbot)</span>
              </label>
              <input 
                type="number" 
                placeholder='Auto: 80% of price' 
                min="1"
                className={inputClass}
                value={inputs.minNegotiablePrice} 
                onChange={e => setInputs({...inputs, minNegotiablePrice: e.target.value})}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>Max Guests</label>
              <input 
                type="number" 
                min="1"
                max="10"
                className={inputClass}
                value={inputs.capacity} 
                onChange={e => setInputs({...inputs, capacity: e.target.value})}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>Floor</label>
              <input 
                type="number" 
                min="1"
                max="10"
                className={inputClass}
                value={inputs.floor} 
                onChange={e => setInputs({...inputs, floor: e.target.value})}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>View</label>
              <select 
                value={inputs.view} 
                onChange={e => setInputs({...inputs, view: e.target.value})}
                className={inputClass}
              >
                <option value="mountain">Mountain View</option>
                <option value="garden">Garden View</option>
                <option value="pool">Pool View</option>
                <option value="city">City View</option>
                <option value="none">No View</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>Bed Type</label>
              <select 
                value={inputs.bedType} 
                onChange={e => setInputs({...inputs, bedType: e.target.value})}
                className={inputClass}
              >
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="queen">Queen</option>
                <option value="king">King</option>
                <option value="twin">Twin</option>
              </select>
            </div>
          </div>

          <div className='mt-6'>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>Description</label>
            <textarea 
              placeholder='Describe the room, its features, and what makes it special...' 
              className={`${inputClass} resize-none`}
              rows={4}
              value={inputs.description} 
              onChange={e => setInputs({...inputs, description: e.target.value})}
            />
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
          <p className="text-sm text-gray-500 mb-4">Select all amenities available in this room</p>
          
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
            {Object.keys(inputs.amenities).map((amenity, index) => (
              <label 
                key={index} 
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  inputs.amenities[amenity] 
                    ? 'border-2 bg-opacity-5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ 
                  borderColor: inputs.amenities[amenity] ? THEME.colors.primary : undefined,
                  backgroundColor: inputs.amenities[amenity] ? `${THEME.colors.primary}08` : undefined
                }}
              >
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded"
                  style={{ accentColor: THEME.colors.primary }}
                  checked={inputs.amenities[amenity]} 
                  onChange={() => setInputs({
                    ...inputs,
                    amenities: { ...inputs.amenities, [amenity]: !inputs.amenities[amenity] }
                  })} 
                />
                <span className="text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button 
            type="submit"
            className='px-8 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
            style={{ backgroundColor: THEME.colors.primary }}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Adding Room...
              </span>
            ) : "Add Room"}
          </button>
          <Link 
            to="/admin/list-room"
            className="px-8 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

export default AddRoom
