import React from 'react'
import { Link } from 'react-router-dom'
import { BRAND, THEME } from '../config/theme'

const Footer = () => {
  const hoverColor = THEME.colors.accent;

  return (
    <div className='text-gray-400 pt-12 px-6 md:px-16 lg:px-24 xl:px-32' style={{ backgroundColor: THEME.colors.primary }}>
      <div className='flex flex-wrap justify-between gap-12 md:gap-8'>
        {/* Brand */}
        <div className='max-w-sm'>
          <h3 className='text-2xl text-white mb-4' style={{ fontFamily: THEME.fonts.heading }}>{BRAND.name}</h3>
          <p className='text-sm leading-relaxed text-gray-300'>
            {BRAND.description}
          </p>
          <div className='flex items-center gap-2 mt-4'>
            <span className='px-3 py-1 rounded-full text-xs' style={{ backgroundColor: `${THEME.colors.accent}20`, color: THEME.colors.accent }}>
              ⭐ 9.2/10 Rating
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <p className='font-semibold text-white mb-4'>Quick Links</p>
          <ul className='flex flex-col gap-2 text-sm'>
            <li><Link to="/" className='transition-colors hover:text-white' onMouseEnter={(e) => e.target.style.color = hoverColor} onMouseLeave={(e) => e.target.style.color = ''}>Home</Link></li>
            <li><Link to="/rooms" className='transition-colors hover:text-white' onMouseEnter={(e) => e.target.style.color = hoverColor} onMouseLeave={(e) => e.target.style.color = ''}>Our Rooms</Link></li>
            <li><Link to="/experience" className='transition-colors hover:text-white' onMouseEnter={(e) => e.target.style.color = hoverColor} onMouseLeave={(e) => e.target.style.color = ''}>Experiences</Link></li>
            <li><Link to="/reviews" className='transition-colors hover:text-white' onMouseEnter={(e) => e.target.style.color = hoverColor} onMouseLeave={(e) => e.target.style.color = ''}>Reviews</Link></li>
            <li><Link to="/about" className='transition-colors hover:text-white' onMouseEnter={(e) => e.target.style.color = hoverColor} onMouseLeave={(e) => e.target.style.color = ''}>About Us</Link></li>
          </ul>
        </div>

        {/* Experiences */}
        <div>
          <p className='font-semibold text-white mb-4'>Experiences</p>
          <ul className='flex flex-col gap-2 text-sm'>
            <li><Link to="/experience" className='transition-colors hover:text-white' onMouseEnter={(e) => e.target.style.color = hoverColor} onMouseLeave={(e) => e.target.style.color = ''}>Cooking Classes</Link></li>
            <li><Link to="/experience" className='transition-colors hover:text-white' onMouseEnter={(e) => e.target.style.color = hoverColor} onMouseLeave={(e) => e.target.style.color = ''}>Ella Rock Hike</Link></li>
            <li><Link to="/experience" className='transition-colors hover:text-white' onMouseEnter={(e) => e.target.style.color = hoverColor} onMouseLeave={(e) => e.target.style.color = ''}>Nine Arch Bridge</Link></li>
            <li><Link to="/experience" className='transition-colors hover:text-white' onMouseEnter={(e) => e.target.style.color = hoverColor} onMouseLeave={(e) => e.target.style.color = ''}>Tea Plantations</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className='max-w-xs'>
          <p className='font-semibold text-white mb-4'>Contact Us</p>
          <ul className='flex flex-col gap-3 text-sm'>
            <li className='flex items-start gap-2'>
              <span>📍</span>
              <span>{BRAND.address}</span>
            </li>
            <li className='flex items-center gap-2'>
              <span>📞</span>
              <a href={`tel:${BRAND.phone}`} className='transition-colors' onMouseEnter={(e) => e.target.style.color = hoverColor} onMouseLeave={(e) => e.target.style.color = ''}>
                {BRAND.phone}
              </a>
            </li>
            <li className='flex items-center gap-2'>
              <span>✉️</span>
              <a href={`mailto:${BRAND.email}`} className='transition-colors' onMouseEnter={(e) => e.target.style.color = hoverColor} onMouseLeave={(e) => e.target.style.color = ''}>
                {BRAND.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Policies Bar */}
      <div className='flex flex-wrap justify-center gap-x-6 gap-y-2 mt-10 py-4 border-t text-xs' style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
        <span>💰 Cash & Card Accepted</span>
        <span>🕐 Check-in: 1 PM | Check-out: 11 AM</span>
        <span>👶 Children Welcome</span>
        <span>🚗 Free Parking</span>
      </div>

      <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      <div className='flex flex-col md:flex-row gap-2 items-center justify-between py-5 text-sm'>
        <p className='text-gray-300'>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>
          Hosted by {BRAND.hosts.names} with ❤️
        </p>
      </div>
    </div>
  )
}

export default Footer;
