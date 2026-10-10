import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { UserButton, useUser } from '@clerk/clerk-react'

const Navbar = () => {
  const { user } = useUser()
  
  return (
    <div className='flex items-center justify-between px-4 md:px-8 border-b border-slate-700/60 py-3 bg-slate-900/95 text-slate-200 transition-all duration-300'>
      <Link to='/' className='flex items-center gap-3'>
        <img src={assets.logo} alt="logo" className='h-9 invert opacity-90'/>
        <span className='hidden md:block text-slate-300 font-medium'>Cloudy Hill Cottage — Admin</span>
      </Link>
      <div className='flex items-center gap-4'>
        <Link to='/' className='text-sm text-slate-400 hover:text-white'>
          View Site
        </Link>
        {user ? (
          <UserButton/>
        ) : (
          <div className='bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 px-3 py-1 rounded-full text-xs font-medium'>
            Demo Mode
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar
