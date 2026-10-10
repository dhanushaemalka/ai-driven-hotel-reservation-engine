import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Footer from './components/Footer'
import AllRooms from './pages/AllRooms'
import RoomDetails from './pages/RoomDetails'
import MyBookings from './pages/MyBookings'
import Experience from './pages/Experience'
import About from './pages/About'
import Reviews from './pages/Reviews'
import AddReview from './pages/AddReview'
import MyReviews from './pages/MyReviews'
import Layout from './pages/admin/Layout'
import Dashboard from './pages/admin/Dashboard'
import AddRoom from './pages/admin/AddRoom'
import ListRoom from './pages/admin/ListRoom'
import ListExperiences from './pages/admin/ListExperiences'
import AddExperience from './pages/admin/AddExperience'
import ManageReviews from './pages/admin/ManageReviews'
import ListUsers from './pages/admin/ListUsers'
import ListBookings from './pages/admin/ListBookings'
import ListPayments from './pages/admin/ListPayments'
import Chatbot from './components/Chatbot'
import { Toaster } from 'react-hot-toast'
import AnimatedThemeLayer from './components/AnimatedThemeLayer'

const App = () => {

  const location = useLocation();
  const isAdminPath = location.pathname.includes("admin");
  const getPublicThemeClass = (pathname) => {
    if (pathname === '/') return 'public-theme-home';
    if (pathname.startsWith('/experience')) return 'public-theme-experience';
    if (pathname === '/rooms') return 'public-theme-rooms';
    if (pathname.startsWith('/rooms/')) return 'public-theme-room-details';
    if (pathname.startsWith('/my-bookings')) return 'public-theme-bookings';
    if (pathname.startsWith('/reviews') || pathname.startsWith('/add-review')) return 'public-theme-reviews';
    if (pathname.startsWith('/about')) return 'public-theme-about';
    return 'public-theme-default';
  };
  const publicThemeClass = getPublicThemeClass(location.pathname);
  const getPublicMotionTheme = (pathname) => {
    if (pathname === '/') return 'home'
    if (pathname.startsWith('/experience')) return 'experience'
    if (pathname === '/rooms') return 'rooms'
    if (pathname.startsWith('/rooms/')) return 'room-details'
    if (pathname.startsWith('/my-bookings')) return 'bookings'
    if (pathname.startsWith('/reviews') || pathname.startsWith('/add-review')) return 'reviews'
    if (pathname.startsWith('/about')) return 'about'
    return 'default'
  }
  const publicMotionTheme = getPublicMotionTheme(location.pathname)

  return (
    <div className={`app-shell public-bg ${publicThemeClass}`}>
      {!isAdminPath && <AnimatedThemeLayer theme={publicMotionTheme} />}
      <Toaster/>
      {!isAdminPath && <Navbar />}
      <div className='min-h-[70vh]'>

        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/rooms' element={<AllRooms />} />
          <Route path='/rooms/:id' element={<RoomDetails />} />
          <Route path='/my-bookings' element={<MyBookings />} />
          <Route path='/experience' element={<Experience />} />
          <Route path='/about' element={<About />} />
          <Route path='/reviews' element={<Reviews />} />
          <Route path='/my-reviews' element={<MyReviews />} />
          <Route path='/add-review/:bookingId' element={<AddReview />} />
          <Route path='/add-review' element={<AddReview />} />

          {/* Admin routes - Full CRUD for all 6 modules */}
          <Route path='/admin' element={<Layout/>}>
            <Route index element={<Dashboard />} />
            {/* User Management */}
            <Route path='users' element={<ListUsers />} />
            {/* Room Management */}
            <Route path='add-room' element={<AddRoom />} />
            <Route path='list-room' element={<ListRoom />} />
            {/* Booking Management */}
            <Route path='bookings' element={<ListBookings />} />
            {/* Experience Management */}
            <Route path='experiences' element={<ListExperiences />} />
            <Route path='add-experience' element={<AddExperience />} />
            {/* Review Management */}
            <Route path='reviews' element={<ManageReviews />} />
            {/* Payment Management */}
            <Route path='payments' element={<ListPayments />} />
          </Route>
        </Routes>

      </div>
      {!isAdminPath && <Footer />}
      {/* AI Chatbot - visible on all pages */}
      <Chatbot />
    </div>
  )
}

export default App
