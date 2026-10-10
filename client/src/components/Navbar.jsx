import React from "react";
import { Link, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";
import { useClerk, UserButton } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext";
import { BRAND, THEME } from "../config/theme";

const BookIcon = () => (
  <svg
    className="w-4 h-4 text-emerald-800"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4"
    />
  </svg>
);

const ReviewIcon = () => (
  <svg
    className="w-4 h-4 text-emerald-800"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 11.5a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 0c-2.21 0-4 1.343-4 3v1.5h8V14.5c0-1.657-1.79-3-4-3Zm8 6.5 2-2m0 0-2-2m2 2H13m5-8h-5m5 4h-3"
    />
  </svg>
);

const Navbar = () => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Suites & Rooms", path: "/rooms" },
    { name: "Experiences", path: "/experience" },
    { name: "Guest Reviews", path: "/reviews" },
    { name: "Our Story", path: "/about" },
  ];

  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const { openSignIn } = useClerk();
  const location = useLocation();
  const { user, navigate, isAdmin } = useAppContext();

  React.useEffect(() => {
    if (location.pathname !== "/") {
      setIsScrolled(true);
      return;
    } else {
      setIsScrolled(false);
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 sm:px-6 md:px-12 lg:px-20 xl:px-28 transition-all duration-300 z-50 ${
        isScrolled
          ? "bg-white/90 shadow-lg text-gray-800 backdrop-blur-xl py-3.5 border-b border-gray-100"
          : "py-5 text-white bg-gradient-to-b from-black/40 via-black/10 to-transparent"
      }`}
    >
      {/* Brand Monogram & Name */}
      <Link to="/" className="flex items-center gap-3 group">
        <div 
          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg shadow-md border transition-all group-hover:scale-105 ${
            isScrolled 
              ? 'bg-emerald-900 text-amber-300 border-emerald-800' 
              : 'bg-white/15 text-amber-300 border-white/30 backdrop-blur-md'
          }`}
          style={{ fontFamily: THEME.fonts.heading }}
        >
          {BRAND.name.charAt(0)}
        </div>
        <div className="flex flex-col">
          <span 
            className={`font-bold text-base sm:text-lg tracking-wide ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}
            style={{ fontFamily: THEME.fonts.heading }}
          >
            {BRAND.name}
          </span>
          <span className={`text-[10px] tracking-widest uppercase font-medium -mt-1 ${
            isScrolled ? 'text-emerald-700' : 'text-emerald-200/90'
          }`}>
            Boutique Sanctuary
          </span>
        </div>
      </Link>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-6 lg:gap-8 font-medium text-sm">
        {navLinks.map((link, i) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={i}
              to={link.path}
              className={`relative py-1 transition-colors ${
                isScrolled
                  ? isActive ? "text-emerald-800 font-semibold" : "text-gray-600 hover:text-emerald-800"
                  : isActive ? "text-amber-300 font-semibold" : "text-white/90 hover:text-white"
              }`}
            >
              {link.name}
              {isActive && (
                <span 
                  className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${
                    isScrolled ? "bg-emerald-700" : "bg-amber-300"
                  }`} 
                />
              )}
            </Link>
          );
        })}

        {user && isAdmin && (
          <button
            className={`px-4 py-1.5 text-xs font-semibold rounded-full cursor-pointer transition-all border shadow-sm ${
              isScrolled 
                ? "text-emerald-900 border-emerald-800/40 bg-emerald-50 hover:bg-emerald-100" 
                : "text-amber-300 border-amber-300/40 bg-white/10 hover:bg-white/20 backdrop-blur-md"
            }`}
            onClick={() => navigate("/admin")}
          >
            ✨ Admin Dashboard
          </button>
        )}
      </div>

      {/* Desktop Right Actions */}
      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <div className="p-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 shadow-sm">
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action
                  label="My Bookings"
                  labelIcon={<BookIcon />}
                  onClick={() => navigate("/my-bookings")}
                />
                <UserButton.Action
                  label="My Reviews"
                  labelIcon={<ReviewIcon />}
                  onClick={() => navigate("/my-reviews")}
                />
              </UserButton.MenuItems>
            </UserButton>
          </div>
        ) : (
          <button
            onClick={openSignIn}
            className={`px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 cursor-pointer shadow-md hover:scale-[1.02] ${
              isScrolled
                ? "bg-emerald-900 text-white hover:bg-emerald-800"
                : "bg-amber-400 text-gray-950 hover:bg-amber-300"
            }`}
          >
            Sign In
          </button>
        )}
      </div>

      {/* Mobile Menu Actions */}
      <div className="flex items-center gap-3 md:hidden">
        {user && (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="My Bookings"
                labelIcon={<BookIcon />}
                onClick={() => navigate("/my-bookings")}
              />
              <UserButton.Action
                label="My Reviews"
                labelIcon={<ReviewIcon />}
                onClick={() => navigate("/my-reviews")}
              />
            </UserButton.MenuItems>
          </UserButton>
        )}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2 rounded-xl transition-colors ${
            isScrolled ? "bg-gray-100 text-gray-800" : "bg-white/20 text-white backdrop-blur-md"
          }`}
          aria-label="Toggle Navigation Menu"
        >
          <img
            src={assets.menuIcon}
            alt="menu"
            className={`h-5 w-5 ${isScrolled ? "invert" : ""}`}
          />
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 bg-emerald-950/95 backdrop-blur-2xl text-white flex flex-col items-center justify-center gap-7 font-medium text-lg transition-transform duration-300 md:hidden z-50 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white"
          onClick={() => setIsMenuOpen(false)}
        >
          <img src={assets.closeIcon} alt="close" className="h-5 w-5" />
        </button>

        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-amber-300 font-playfair">{BRAND.name}</h2>
          <p className="text-xs text-emerald-200 mt-1">{BRAND.tagline}</p>
        </div>

        {navLinks.map((link, i) => (
          <Link 
            key={i} 
            to={link.path} 
            onClick={() => setIsMenuOpen(false)}
            className="hover:text-amber-300 transition-colors"
          >
            {link.name}
          </Link>
        ))}
        
        {user && isAdmin && (
          <Link 
            to="/admin" 
            onClick={() => setIsMenuOpen(false)}
            className="text-amber-300 font-semibold"
          >
            ⚡ Admin Dashboard
          </Link>
        )}

        {!user && (
          <button
            onClick={() => {
              setIsMenuOpen(false);
              openSignIn();
            }}
            className="mt-4 px-8 py-3 rounded-2xl bg-amber-400 text-gray-950 font-bold text-base shadow-xl"
          >
            Sign In to Book
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
