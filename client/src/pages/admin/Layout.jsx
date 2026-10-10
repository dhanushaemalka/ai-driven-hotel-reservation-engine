import React, { useEffect } from 'react'
import Navbar from '../../components/admin/Navbar'
import Sidebar from '../../components/admin/Sidebar'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import AnimatedThemeLayer from '../../components/AnimatedThemeLayer'

const Layout = () => {
  const { isAdmin, user } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()
  const getAdminThemeClass = (pathname) => {
    if (pathname === '/admin') return 'admin-theme-dashboard'
    if (pathname.includes('/users')) return 'admin-theme-users'
    if (pathname.includes('/bookings')) return 'admin-theme-bookings'
    if (pathname.includes('/payments')) return 'admin-theme-payments'
    if (pathname.includes('/reviews')) return 'admin-theme-reviews'
    if (pathname.includes('/experiences') || pathname.includes('/add-experience')) return 'admin-theme-experiences'
    if (pathname.includes('/list-room') || pathname.includes('/add-room')) return 'admin-theme-rooms'
    return 'admin-theme-dashboard'
  }
  const adminThemeClass = getAdminThemeClass(location.pathname)
  const getAdminMotionTheme = (pathname) => {
    if (pathname === '/admin') return 'admin-dashboard'
    if (pathname.includes('/users')) return 'admin-users'
    if (pathname.includes('/bookings')) return 'admin-bookings'
    if (pathname.includes('/payments')) return 'admin-payments'
    if (pathname.includes('/reviews')) return 'admin-reviews'
    if (pathname.includes('/experiences') || pathname.includes('/add-experience')) return 'admin-experiences'
    if (pathname.includes('/list-room') || pathname.includes('/add-room')) return 'admin-rooms'
    return 'admin-dashboard'
  }
  const adminMotionTheme = getAdminMotionTheme(location.pathname)

  // DEMO MODE: Allow admin access without authentication
  const isDemoMode = true; // Set to false to require authentication

  useEffect(() => {
    if (!isDemoMode && user && !isAdmin) {
      navigate('/')
    }
  }, [isAdmin, user, navigate])

  if (!isDemoMode && (!user || !isAdmin)) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <p className='text-gray-500'>Loading...</p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-screen admin-bg ${adminThemeClass}`}>
      <AnimatedThemeLayer theme={adminMotionTheme} />
      <Navbar/>
      <div className='flex h-full'>
        <Sidebar/>
        <div className='flex-1 p-4 pt-10 md:px-10 h-full overflow-y-auto'>
          <div className='glass-panel rounded-2xl p-2 md:p-4'>
          <Outlet/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout;
