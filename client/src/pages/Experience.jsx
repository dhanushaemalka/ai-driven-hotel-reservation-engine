import React, { useState, useEffect } from 'react';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Experience = () => {
  const { axios, currency, navigate } = useAppContext();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [featuredExperience, setFeaturedExperience] = useState(null);

  const categories = [
    { id: 'all', name: 'All Experiences' },
    { id: 'cooking', name: 'Cooking' },
    { id: 'adventure', name: 'Adventure' },
    { id: 'nature', name: 'Nature' },
    { id: 'cultural', name: 'Cultural' },
  ];

  const categoryIcons = {
    cooking: '🍛',
    adventure: '🥾',
    nature: '🌿',
    cultural: '🏛️',
    wellness: '🧘',
    photography: '📷'
  };

  const localAttractions = [
    { name: "Ella Railway Station", distance: "2.3 km" },
    { name: "Nine Arch Bridge", distance: "6 km" },
    { name: "Ella Rock", distance: "6 km" },
    { name: "Little Adam's Peak", distance: "3 km" },
    { name: "Ravana Falls", distance: "5 km" },
  ];

  const fetchExperiences = async () => {
    try {
      const endpoint = selectedCategory === 'all' 
        ? '/api/experiences' 
        : `/api/experiences/category/${selectedCategory}`;
      
      const { data } = await axios.get(endpoint);
      if (data.success) {
        setExperiences(data.experiences);
        // Set featured experience (cooking class or first one)
        const cooking = data.experiences.find(e => e.category === 'cooking');
        setFeaturedExperience(cooking || data.experiences[0]);
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [selectedCategory]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'moderate': return 'bg-yellow-100 text-yellow-700';
      case 'challenging': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleBookNow = (experience) => {
    const experienceName = encodeURIComponent(experience.name || 'Experience');
    navigate(`/rooms?experience=${experienceName}`);
    toast.success('Select a room to continue with this experience');
  };

  return (
    <div className="pt-28 pb-20">
      {/* Hero Section */}
      <div className="relative h-[50vh] bg-gradient-to-r from-emerald-800 to-teal-600 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-4">
            Unforgettable Experiences
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
            Discover the magic of Ella through authentic local experiences, breathtaking adventures, and culinary delights
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-6 md:px-16 lg:px-24 py-8 bg-gray-50">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Experiences Grid */}
      <div className="px-6 md:px-16 lg:px-24 py-16">
        <Title 
          title="Things To Do" 
          subTitle="From cooking classes to mountain hikes, immerse yourself in the authentic Sri Lankan experience"
        />
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>No experiences available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {experiences.map((exp) => (
              <div 
                key={exp._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Experience Image */}
                <div className="relative h-48 overflow-hidden">
                  {exp.images && exp.images[0] ? (
                    <img 
                      src={exp.images[0]} 
                      alt={exp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                      <span className="text-6xl">{categoryIcons[exp.category] || '🎯'}</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exp.difficulty)}`}>
                      {exp.difficulty}
                    </span>
                  </div>
                  {exp.rating > 0 && (
                    <div className="absolute bottom-3 left-3 bg-white/90 px-2 py-1 rounded-lg flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm font-medium">{exp.rating}</span>
                      <span className="text-xs text-gray-500">({exp.totalReviews})</span>
                    </div>
                  )}
                </div>

                {/* Experience Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{exp.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {exp.shortDescription || exp.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-500 flex items-center gap-1">
                      <span>⏱</span> {exp.duration}
                    </span>
                    <span className="text-gray-500 flex items-center gap-1">
                      <span>👥</span> Max {exp.maxParticipants}
                    </span>
                  </div>

                  {/* Highlights */}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {exp.highlights.slice(0, 2).map((highlight, idx) => (
                        <span key={idx} className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-xl font-bold text-emerald-600">{currency} {exp.price?.toLocaleString()}</span>
                      <span className="text-gray-500 text-sm">/person</span>
                    </div>
                    <button
                      onClick={() => handleBookNow(exp)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Featured Cooking Class Highlight */}
      {featuredExperience && featuredExperience.category === 'cooking' && (
        <div className="bg-amber-50 py-16 px-6 md:px-16 lg:px-24">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <span className="text-amber-600 font-medium">Featured Experience</span>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-800 mt-2 mb-4">
                Cook with Renu
              </h2>
              <p className="text-gray-600 mb-6">
                {featuredExperience.description}
              </p>
              {featuredExperience.priceIncludes && (
                <ul className="space-y-3 text-gray-700">
                  {featuredExperience.priceIncludes.slice(0, 4).map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-emerald-500">✓</span> {item}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6">
                <span className="text-2xl font-bold text-amber-600">
                  {currency} {featuredExperience.price?.toLocaleString()}
                </span>
                <span className="text-gray-500"> /person</span>
              </div>
            </div>
            <div className="lg:w-1/2 rounded-2xl h-80 overflow-hidden">
              {featuredExperience.images && featuredExperience.images[0] ? (
                <img 
                  src={featuredExperience.images[0]} 
                  alt={featuredExperience.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center">
                  <span className="text-8xl">👩‍🍳</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Local Attractions */}
      <div className="px-6 md:px-16 lg:px-24 py-16">
        <Title 
          title="Nearby Attractions" 
          subTitle="Explore the best of Ella from our convenient location"
        />
        
        <div className="flex flex-wrap justify-center gap-6 mt-12">
          {localAttractions.map((attraction, index) => (
            <div 
              key={index}
              className="bg-white border border-gray-200 rounded-xl px-6 py-4 flex items-center gap-4 hover:border-emerald-500 transition-colors"
            >
              <img src={assets.locationIcon} alt="location" className="w-5 h-5" />
              <div>
                <p className="font-medium text-gray-800">{attraction.name}</p>
                <p className="text-sm text-gray-500">{attraction.distance}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Getting Around */}
      <div className="bg-gray-50 py-16 px-6 md:px-16 lg:px-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-playfair text-3xl font-bold text-gray-800 mb-6">
            Getting Around Ella
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Walking</h3>
              <p className="text-gray-600 text-sm">
                20-30 minute walk downhill to town center. The walk back up is steep - 
                we recommend a tuk-tuk for the return journey, especially at night.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Tuk-Tuk</h3>
              <p className="text-gray-600 text-sm">
                Readily available for 400-600 LKR to town. We can arrange reliable 
                drivers for day trips and airport transfers.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Scooter Rental</h3>
              <p className="text-gray-600 text-sm">
                Available on-site for independent exploration. Perfect for visiting 
                nearby attractions at your own pace.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Train</h3>
              <p className="text-gray-600 text-sm">
                Ella Railway Station is 2.3 km away. Experience one of the world's 
                most scenic train journeys through the hill country.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experience;
