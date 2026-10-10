import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppContext } from '../../context/AppContext'
import { BRAND, THEME, CURRENCY } from '../../config/theme'
import toast from 'react-hot-toast'

// Icons (inline SVG for cleaner design)
const Icons = {
  bookings: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  revenue: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  confirmed: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  pending: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  guests: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
};

const Dashboard = () => {
  const { user, getToken, axios } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    bookings: [],
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
  });

  const fetchDashBoardData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/bookings/dashboard', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      if (data.success) {
        setDashboardData(data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmBooking = async (bookingId) => {
    try {
      const { data } = await axios.put(`/api/bookings/${bookingId}/confirm`, {}, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      if (data.success) {
        toast.success('Booking confirmed successfully');
        fetchDashBoardData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashBoardData();
    }
  }, [user]);

  const getStatusStyle = (status) => {
    const styles = {
      confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      pending: 'bg-amber-50 text-amber-700 border border-amber-200',
      cancelled: 'bg-red-50 text-red-700 border border-red-200',
      completed: 'bg-blue-50 text-blue-700 border border-blue-200',
    };
    return styles[status] || styles.pending;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: THEME.fonts.heading }}>
            Dashboard
          </h1>
          <p className="mt-1 text-gray-500">
            Welcome back! Here's what's happening at <span className="font-medium" style={{ color: THEME.colors.primary }}>{BRAND.name}</span>
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
            style={{ backgroundColor: `${THEME.colors.primary}10`, color: THEME.colors.primary }}>
            <span className="w-2 h-2 rounded-full mr-2 animate-pulse" style={{ backgroundColor: THEME.colors.success }}></span>
            Live Data
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Total Bookings */}
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)" }}
          className="group relative overflow-hidden rounded-2xl p-6 transition-colors"
          style={{ background: `linear-gradient(135deg, ${THEME.colors.primary}08 0%, ${THEME.colors.primary}15 100%)` }}>
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10"
            style={{ backgroundColor: THEME.colors.primary }}></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <motion.div 
                whileHover={{ rotate: 5, scale: 1.1 }}
                className="p-3 rounded-xl" style={{ backgroundColor: `${THEME.colors.primary}15`, color: THEME.colors.primary }}>
                {Icons.bookings}
              </motion.div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/80 text-gray-600">
                All Time
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <motion.p 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-3xl font-bold mt-1" style={{ color: THEME.colors.primary }}>
                {dashboardData.totalBookings}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Confirmed */}
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)" }}
          className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-emerald-200 opacity-20"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <motion.div 
                whileHover={{ rotate: 5, scale: 1.1 }}
                className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
                {Icons.confirmed}
              </motion.div>
              <span className="flex items-center text-xs font-medium text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>
                Active
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">Confirmed</p>
              <motion.p 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-3xl font-bold text-emerald-600 mt-1">
                {dashboardData.confirmedBookings}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Pending */}
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)" }}
          className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-amber-50 to-amber-100/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-amber-200 opacity-20"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <motion.div 
                whileHover={{ rotate: 5, scale: 1.1 }}
                className="p-3 rounded-xl bg-amber-100 text-amber-600">
                {Icons.pending}
              </motion.div>
              <span className="flex items-center text-xs font-medium text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-500 mr-1 animate-pulse"></span>
                Awaiting
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <motion.p 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-3xl font-bold text-amber-600 mt-1">
                {dashboardData.pendingBookings}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Revenue */}
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)" }}
          className="group relative overflow-hidden rounded-2xl p-6 transition-colors"
          style={{ background: `linear-gradient(135deg, ${THEME.colors.accent}10 0%, ${THEME.colors.accent}20 100%)` }}>
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-15"
            style={{ backgroundColor: THEME.colors.accent }}></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <motion.div 
                whileHover={{ rotate: 5, scale: 1.1 }}
                className="p-3 rounded-xl" style={{ backgroundColor: `${THEME.colors.accent}20`, color: THEME.colors.accent }}>
                {Icons.revenue}
              </motion.div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/80 text-gray-600">
                Revenue
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <motion.p 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-2xl font-bold mt-1" style={{ color: THEME.colors.accent }}>
                {CURRENCY.display(dashboardData.totalRevenue || 0)}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <p className="text-sm text-gray-500">Latest reservations at {BRAND.name}</p>
          </div>
          <button 
            onClick={fetchDashBoardData}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Room</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Check-in</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Check-out</th>
                <th className="py-4 px-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="py-4 px-6 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dashboardData.bookings.slice(0, 10).map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: THEME.colors.primary }}>
                        {(item.guestName || item.user?.username || 'G').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.guestName || item.user?.username}</p>
                        <p className="text-sm text-gray-500">{item.guestEmail || item.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 hidden md:table-cell">
                    <div>
                      <p className="font-medium text-gray-900">{item.room?.roomType}</p>
                      <p className="text-sm text-gray-500">Room {item.room?.roomNumber}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600 hidden lg:table-cell">
                    {new Date(item.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-4 px-6 text-gray-600 hidden lg:table-cell">
                    {new Date(item.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <p className="font-semibold text-gray-900">{CURRENCY.display(item.totalPrice)}</p>
                    {item.nights && <p className="text-xs text-gray-500">{item.nights} nights</p>}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(item.status)}`}>
                      {item.status === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>}
                      {item.status === 'confirmed' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>}
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {item.status === 'pending' ? (
                      <button
                        onClick={() => confirmBooking(item._id)}
                        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:shadow-md"
                        style={{ backgroundColor: THEME.colors.primary }}
                      >
                        Confirm
                      </button>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {dashboardData.bookings.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              {Icons.bookings}
            </div>
            <p className="text-gray-500">No bookings yet</p>
          </div>
        )}

        {dashboardData.bookings.length > 10 && (
          <div className="px-6 py-4 border-t border-gray-100 text-center">
            <a href="/admin/bookings" className="text-sm font-medium hover:underline" style={{ color: THEME.colors.primary }}>
              View all {dashboardData.bookings.length} bookings →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
