import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppContext } from '../../context/AppContext'
import { BRAND, THEME, CURRENCY } from '../../config/theme'
import toast from 'react-hot-toast'

const ListExperiences = () => {
  const { axios, getToken } = useAppContext()
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  const fetchExperiences = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/experiences/admin/all', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        setExperiences(data.experiences)
      } else {
        toast.error(data.message || 'Failed to fetch experiences')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch experiences')
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (id, currentStatus) => {
    try {
      const { data } = await axios.put(`/api/experiences/${id}/toggle`, 
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      )
      if (data.success) {
        toast.success(`Experience ${!currentStatus ? 'activated' : 'deactivated'}`)
        fetchExperiences()
      } else {
        toast.error(data.message || 'Failed to update status')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update status')
    }
  }

  const deleteExperience = async (id) => {
    if (!confirm('Are you sure you want to delete this experience?')) return
    
    try {
      const { data } = await axios.delete(`/api/experiences/${id}`, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        toast.success('Experience deleted')
        fetchExperiences()
      }
    } catch (error) {
      toast.error('Failed to delete experience')
    }
  }

  useEffect(() => {
    fetchExperiences()
  }, [])

  const categoryIcons = {
    cooking: '🍳',
    adventure: '🏔️',
    nature: '🌿',
    cultural: '🎭',
    wellness: '🧘',
    photography: '📸',
    romantic: '💕',
    family: '👨‍👩‍👧‍👦',
  }

  const categoryColors = {
    cooking: { bg: '#FFF7ED', text: '#C2410C', border: '#FB923C' },
    adventure: { bg: '#FEF2F2', text: '#B91C1C', border: '#F87171' },
    nature: { bg: '#F0FDF4', text: '#15803D', border: '#4ADE80' },
    cultural: { bg: '#FAF5FF', text: '#7E22CE', border: '#C084FC' },
    wellness: { bg: '#EFF6FF', text: '#1D4ED8', border: '#60A5FA' },
    photography: { bg: '#FDF2F8', text: '#BE185D', border: '#F472B6' },
    romantic: { bg: '#FDF2F8', text: '#BE185D', border: '#F472B6' },
    family: { bg: '#ECFDF5', text: '#047857', border: '#34D399' },
  }

  const filteredExperiences = experiences.filter(exp => {
    const matchesSearch = exp.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || exp.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(experiences.map(e => e.category))]
  const stats = {
    total: experiences.length,
    active: experiences.filter(e => e.isActive).length,
    avgPrice: experiences.length > 0 ? Math.round(experiences.reduce((sum, e) => sum + e.price, 0) / experiences.length) : 0
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>)}
        </div>
      </div>
    )
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900' style={{ fontFamily: THEME.fonts.heading }}>
            Experience Management
          </h1>
          <p className='text-gray-500 mt-1'>Curate unforgettable experiences at {BRAND.name}</p>
        </div>
        <Link 
          to="/admin/add-experience"
          className='inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium transition-all hover:opacity-90 hover:shadow-lg'
          style={{ backgroundColor: THEME.colors.primary }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Experience
        </Link>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-white rounded-xl p-4 border border-gray-100'>
          <p className='text-sm text-gray-500'>Total Experiences</p>
          <p className='text-2xl font-bold text-gray-900 mt-1'>{stats.total}</p>
        </div>
        <div className='bg-white rounded-xl p-4 border border-gray-100'>
          <p className='text-sm text-gray-500'>Active</p>
          <p className='text-2xl font-bold text-emerald-600 mt-1'>{stats.active}</p>
        </div>
        <div className='bg-white rounded-xl p-4 border border-gray-100'>
          <p className='text-sm text-gray-500'>Avg. Price</p>
          <p className='text-2xl font-bold mt-1' style={{ color: THEME.colors.accent }}>{CURRENCY.display(stats.avgPrice)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1 max-w-xs'>
          <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
          </svg>
          <input
            type='text'
            placeholder='Search experiences...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2'
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className='px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2'
        >
          <option value='all'>All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{categoryIcons[cat]} {cat}</option>
          ))}
        </select>
      </div>

      {/* Experiences Grid */}
      {filteredExperiences.length === 0 ? (
        <div className='text-center py-16 bg-white rounded-2xl border border-gray-100'>
          <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center text-2xl'>
            🎯
          </div>
          <p className='text-gray-500'>No experiences found</p>
          <Link to='/admin/add-experience' className='inline-block mt-4 text-sm font-medium' style={{ color: THEME.colors.primary }}>
            + Add your first experience
          </Link>
        </div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
          }}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        >
          <AnimatePresence>
          {filteredExperiences.map((exp, index) => {
            const catColor = categoryColors[exp.category] || { bg: '#F3F4F6', text: '#374151', border: '#9CA3AF' }
            return (
              <motion.div 
                key={exp._id} 
                layout
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)" }}
                transition={{ duration: 0.3 }}
                className='bg-white rounded-2xl border border-gray-100 overflow-hidden'>
                {/* Image */}
                <div className='relative h-40 bg-gray-100'>
                  {exp.images?.[0] ? (
                    <img src={exp.images[0]} alt={exp.name} className='w-full h-full object-cover' />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center' style={{ background: `linear-gradient(135deg, ${THEME.colors.primary}20, ${THEME.colors.accent}20)` }}>
                      <span className='text-4xl'>{categoryIcons[exp.category] || '🎯'}</span>
                    </div>
                  )}
                  {/* Category Badge */}
                  <div 
                    className='absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium border'
                    style={{ backgroundColor: catColor.bg, color: catColor.text, borderColor: catColor.border }}
                  >
                    {categoryIcons[exp.category]} {exp.category}
                  </div>
                  {/* Status */}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                    exp.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {exp.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {/* Content */}
                <div className='p-5'>
                  <h3 className='font-semibold text-gray-900 text-lg'>{exp.name}</h3>
                  <p className='text-sm text-gray-500 mt-1 line-clamp-2'>{exp.shortDescription || exp.description}</p>
                  
                  {/* Meta */}
                  <div className='flex items-center gap-4 mt-4 text-sm text-gray-600'>
                    <span className='flex items-center gap-1'>
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      {exp.duration}
                    </span>
                    <span className='flex items-center gap-1'>
                      <svg className='w-4 h-4 text-yellow-500' fill='currentColor' viewBox='0 0 20 20'>
                        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                      </svg>
                      {exp.rating || '—'}
                    </span>
                  </div>

                  {/* Tags */}
                  {exp.tags?.length > 0 && (
                    <div className='flex flex-wrap gap-1.5 mt-3'>
                      {exp.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className='px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full'>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price & Actions */}
                  <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-100'>
                    <div>
                      <p className='font-bold text-lg' style={{ color: THEME.colors.primary }}>{CURRENCY.display(exp.price)}</p>
                      <p className='text-xs text-gray-400'>per person</p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => toggleStatus(exp._id, exp.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          exp.isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                        title={exp.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={exp.isActive ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'} />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteExperience(exp._id)}
                        className='p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors'
                        title='Delete'
                      >
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

export default ListExperiences
