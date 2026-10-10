/**
 * Dynamic Branding Configuration (White-Label Support)
 * 
 * Luxury Boutique Theme for Cloudy Hill Cottage - Ella, Sri Lanka
 * All components import from this config for cohesive luxury styling.
 */

export const BRAND = {
  // Hotel Identity
  name: import.meta.env.VITE_HOTEL_NAME || "Cloudy Hill Cottage",
  tagline: import.meta.env.VITE_HOTEL_TAGLINE || "Misty Mountain Sanctuary in Ella",
  description: import.meta.env.VITE_HOTEL_DESCRIPTION || "Wake up to breathtaking sunrise views over Ella Rock, authentic Sri Lankan hospitality, and the tranquil magic of misty tea hills.",
  
  // Rating & Location Badges
  rating: "9.8/10 Exceptional Rating",
  ratingScore: "9.8",
  reviewCount: "250+",
  locationBadge: "Ella, Sri Lanka",

  // Highlights & Amenities
  highlights: [
    { icon: "🌅", title: "Sunrise Views from Bed" },
    { icon: "🍛", title: "Authentic Home-Cooked Curries" },
    { icon: "👨‍🍳", title: "Traditional Cooking Classes" },
    { icon: "🌿", title: "Organic Garden & Tea Terraces" }
  ],
  
  // Logo & Images
  logo: import.meta.env.VITE_LOGO_URL || "/logo.png",
  favicon: import.meta.env.VITE_FAVICON_URL || "/favicon.ico",
  heroImage: import.meta.env.VITE_HERO_IMAGE || "/hero-bg.jpg",
  
  // Contact Information
  phone: import.meta.env.VITE_HOTEL_PHONE || "+94 77 123 4567",
  email: import.meta.env.VITE_HOTEL_EMAIL || "stay@cloudyhillcottage.com",
  address: import.meta.env.VITE_HOTEL_ADDRESS || "Passara Road, Ella, Badulla District, Sri Lanka",
  
  // Social Media
  social: {
    facebook: import.meta.env.VITE_SOCIAL_FACEBOOK || "https://facebook.com/cloudyhillcottage",
    instagram: import.meta.env.VITE_SOCIAL_INSTAGRAM || "https://instagram.com/cloudyhillcottage",
    tripadvisor: import.meta.env.VITE_SOCIAL_TRIPADVISOR || "https://tripadvisor.com",
  },
  
  // Owners/Hosts
  hosts: {
    names: import.meta.env.VITE_HOST_NAMES || "Renu & Nalaka",
    story: "Your warm Sri Lankan hosts who have been sharing their secluded mountain paradise and world-famous jackfruit curries for over a decade.",
  },
};

export const THEME = {
  // Primary Colors - "Misty Emerald & Champagne Gold"
  colors: {
    primary: import.meta.env.VITE_PRIMARY_COLOR || "#0D2E1F",      // Deep Forest Emerald
    primaryLight: "#184E34",                                        // Vibrant Evergreen
    primaryDark: "#071A11",                                         // Velvet Forest Midnight
    
    secondary: import.meta.env.VITE_SECONDARY_COLOR || "#4E6E66",  // Misty Mountain Slate
    secondaryLight: "#71948B",                                      // Soft Sage
    secondaryDark: "#334D46",                                       // Dark Moss
    
    accent: import.meta.env.VITE_ACCENT_COLOR || "#D4AF37",        // Champagne Imperial Gold
    accentLight: "#F5E296",                                         // Shimmering Warm Gold
    accentDark: "#A38018",                                          // Antique Burnished Gold
    
    // UI Colors
    background: "#F8FAF8",
    surface: "#FFFFFF",
    surfaceHover: "#F0F5F2",
    
    // Text Colors
    text: "#0F1E17",
    textMuted: "#52635B",
    textLight: "#8B9D95",
    
    // Status Colors
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
    
    // Booking Status Colors
    status: {
      pending: { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B" },
      confirmed: { bg: "#D1FAE5", text: "#065F46", border: "#10B981" },
      completed: { bg: "#DBEAFE", text: "#1E40AF", border: "#3B82F6" },
      cancelled: { bg: "#FEE2E2", text: "#991B1B", border: "#EF4444" },
    },
    
    // Loyalty Status Colors
    loyalty: {
      standard: { bg: "#F3F4F6", text: "#374151" },
      silver: { bg: "#E5E7EB", text: "#1F2937" },
      gold: { bg: "#FEF3C7", text: "#92400E" },
      platinum: { bg: "#EDE9FE", text: "#5B21B6" },
    },
  },
  
  // Typography
  fonts: {
    heading: "'Playfair Display', serif",
    body: "'Outfit', 'Inter', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  
  // Spacing & Sizing
  borderRadius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    full: "9999px",
  },
  
  // Shadows
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    glow: "0 0 30px rgba(212, 175, 55, 0.35)",
  },
  
  // Glassmorphism
  glass: {
    background: "rgba(255, 255, 255, 0.85)",
    backdropBlur: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.4)",
  },
};

// Animation Presets for Framer Motion
export const ANIMATIONS = {
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  
  // Stagger children (for lists)
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  
  // Individual item in stagger
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
  
  // Card hover effect
  cardHover: {
    scale: 1.02,
    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
    transition: { duration: 0.2 },
  },
  
  // Fade in
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 },
  },
  
  // Slide in from left
  slideInLeft: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4 },
  },
  
  // Slide in from right
  slideInRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4 },
  },
  
  // Scale up
  scaleUp: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 },
  },
};

// Currency Configuration
export const CURRENCY = {
  code: import.meta.env.VITE_CURRENCY_CODE || "LKR",
  symbol: import.meta.env.VITE_CURRENCY_SYMBOL || "LKR",
  locale: import.meta.env.VITE_LOCALE || "en-LK",
  
  format: (amount) => {
    return new Intl.NumberFormat(CURRENCY.locale, {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  },
  
  display: (amount) => `${CURRENCY.symbol} ${CURRENCY.format(amount)}`,
};

// Helper function to get CSS variables
export const getCSSVariables = () => ({
  "--color-primary": THEME.colors.primary,
  "--color-primary-light": THEME.colors.primaryLight,
  "--color-primary-dark": THEME.colors.primaryDark,
  "--color-secondary": THEME.colors.secondary,
  "--color-accent": THEME.colors.accent,
  "--font-heading": THEME.fonts.heading,
  "--font-body": THEME.fonts.body,
});

export default { BRAND, THEME, ANIMATIONS, CURRENCY };
