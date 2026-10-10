import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppContext } from '../../context/AppContext'
import { BRAND, THEME, CURRENCY } from '../../config/theme'
import toast from 'react-hot-toast'

const ListRoom = () => {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [editingRoom, setEditingRoom] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    roomType: '',
    roomNumber: '',
    description: '',
    pricePerNight: '',
    minNegotiablePrice: '',
    capacity: '',
    floor: '',
    view: 'mountain',
    bedType: 'double',
    amenitiesText: '',
    isAvailable: true,
    images: []
  })

  const { axios, getToken, user } = useAppContext()

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/rooms/admin', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        setRooms(data.rooms)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async (roomId) => {
    try {
      const { data } = await axios.post('/api/rooms/toggle-availability', { roomId }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        toast.success('Room availability updated')
        fetchRooms()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const deleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) return
    
    try {
      const { data } = await axios.delete(`/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        toast.success('Room deleted successfully')
        fetchRooms()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const openEditModal = (room) => {
    setEditingRoom(room)
    setEditForm({
      roomType: room.roomType || '',
      roomNumber: room.roomNumber || '',
      description: room.description || '',
      pricePerNight: room.pricePerNight ?? '',
      minNegotiablePrice: room.minNegotiablePrice ?? '',
      capacity: room.capacity ?? '',
      floor: room.floor ?? '',
      view: room.view || 'mountain',
      bedType: room.bedType || 'double',
      amenitiesText: (room.amenities || []).join(', '),
      isAvailable: !!room.isAvailable,
      images: []
    })
  }

  const closeEditModal = () => {
    setEditingRoom(null)
    setIsSaving(false)
    setEditForm({
      roomType: '',
      roomNumber: '',
      description: '',
      pricePerNight: '',
      minNegotiablePrice: '',
      capacity: '',
      floor: '',
      view: 'mountain',
      bedType: 'double',
      amenitiesText: '',
      isAvailable: true,
      images: []
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingRoom) return

    if (!editForm.roomType?.trim() || !editForm.roomNumber?.trim()) {
      toast.error('Room type and room number are required')
      return
    }

    if (+editForm.pricePerNight < 0) {
      toast.error('Price cannot be negative')
      return
    }

    if (+editForm.minNegotiablePrice > +editForm.pricePerNight) {
      toast.error('Minimum negotiable price cannot exceed base price')
      return
    }

    try {
      setIsSaving(true)
      const formData = new FormData()
      formData.append('roomType', editForm.roomType.trim())
      formData.append('roomNumber', editForm.roomNumber.trim())
      formData.append('description', editForm.description || '')
      formData.append('pricePerNight', String(editForm.pricePerNight))
      formData.append('minNegotiablePrice', String(editForm.minNegotiablePrice))
      formData.append('capacity', String(editForm.capacity))
      formData.append('floor', String(editForm.floor))
      formData.append('view', editForm.view)
      formData.append('bedType', editForm.bedType)
      formData.append('isAvailable', String(editForm.isAvailable))

      const amenities = (editForm.amenitiesText || '')
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean)
      formData.append('amenities', JSON.stringify(amenities))

      if (editForm.images?.length) {
        Array.from(editForm.images).forEach((file) => {
          formData.append('images', file)
        })
      }

      const { data } = await axios.put(`/api/rooms/${editingRoom._id}`, formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      })

      if (data.success) {
        toast.success('Room updated successfully')
        closeEditModal()
        fetchRooms()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchRooms()
    }
  }, [user])

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.roomType?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || room.roomType === filterType
    return matchesSearch && matchesType
  })

  const roomTypes = [...new Set(rooms.map(r => r.roomType))]

  // Stats
  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.isAvailable).length,
    unavailable: rooms.filter(r => !r.isAvailable).length,
    avgPrice: rooms.length > 0 ? Math.round(rooms.reduce((sum, r) => sum + r.pricePerNight, 0) / rooms.length) : 0
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: THEME.fonts.heading }}>
            Room Management
          </h1>
          <p className="text-gray-500 mt-1">Manage all rooms at {BRAND.name}</p>
        </div>
        <Link 
          to="/admin/add-room"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium transition-all hover:opacity-90 hover:shadow-lg"
          style={{ backgroundColor: THEME.colors.primary }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Room
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Rooms</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Available</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.available}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Unavailable</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{stats.unavailable}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Avg. Price</p>
          <p className="text-2xl font-bold mt-1" style={{ color: THEME.colors.accent }}>{CURRENCY.display(stats.avgPrice)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all"
            style={{ '--tw-ring-color': THEME.colors.primary }}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2"
        >
          <option value="all">All Types</option>
          {roomTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Room Grid */}
      {filteredRooms.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white rounded-2xl border border-gray-100"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-gray-500">No rooms found</p>
          <Link to="/admin/add-room" className="inline-block mt-4 text-sm font-medium" style={{ color: THEME.colors.primary }}>
            + Add your first room
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
          {filteredRooms.map((room, index) => (
            <motion.div 
              key={room._id} 
              layout
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)" }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden group">
              {/* Room Image */}
              <div className="relative h-48 bg-gray-100">
                {room.images?.[0] ? (
                  <img src={room.images[0]} alt={room.roomType} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${THEME.colors.primary}10` }}>
                    <svg className="w-12 h-12" style={{ color: THEME.colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Status Badge */}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
                  room.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {room.isAvailable ? 'Available' : 'Unavailable'}
                </div>
                {/* Room Number Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
                  Room {room.roomNumber}
                </div>
              </div>

              {/* Room Details */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{room.roomType}</h3>
                    <p className="text-sm text-gray-500">Capacity: {room.capacity} guests</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: THEME.colors.primary }}>{CURRENCY.display(room.pricePerNight)}</p>
                    <p className="text-xs text-gray-400">per night</p>
                  </div>
                </div>

                {/* Amenities */}
                {room.amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {room.amenities.slice(0, 3).map((amenity, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                        +{room.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(room)}
                    className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleAvailability(room._id)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      room.isAvailable 
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {room.isAvailable ? 'Set Unavailable' : 'Set Available'}
                  </button>
                  <button
                    onClick={() => deleteRoom(room._id)}
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Edit Room Modal */}
      <AnimatePresence>
        {editingRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 16, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto my-8 bg-white rounded-2xl border border-gray-100 shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Edit Room</h2>
                  <p className="text-sm text-gray-500">Update full room details and save changes.</p>
                </div>
                <button
                  onClick={closeEditModal}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Room Type</label>
                    <input
                      type="text"
                      value={editForm.roomType}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, roomType: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Room Number</label>
                    <input
                      type="text"
                      value={editForm.roomNumber}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, roomNumber: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2"
                    placeholder="Write room description..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Price / Night</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.pricePerNight}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, pricePerNight: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Negotiable</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.minNegotiablePrice}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, minNegotiablePrice: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Capacity</label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.capacity}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, capacity: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Floor</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.floor}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, floor: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">View</label>
                    <select
                      value={editForm.view}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, view: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2"
                    >
                      <option value="mountain">Mountain</option>
                      <option value="garden">Garden</option>
                      <option value="valley">Valley</option>
                      <option value="city">City</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Bed Type</label>
                    <select
                      value={editForm.bedType}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, bedType: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2"
                    >
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="queen">Queen</option>
                      <option value="king">King</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl w-full cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.isAvailable}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, isAvailable: e.target.checked }))}
                      />
                      <span className="text-sm text-gray-700">Available</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Amenities (comma separated)</label>
                  <input
                    type="text"
                    value={editForm.amenitiesText}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, amenitiesText: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2"
                    placeholder="WiFi, AC, Hot Water, Balcony"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Replace Images (optional)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setEditForm((prev) => ({ ...prev, images: e.target.files }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">If you upload new images, existing ones will be replaced.</p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl text-white font-medium disabled:opacity-70"
                    style={{ backgroundColor: THEME.colors.primary }}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ListRoom
