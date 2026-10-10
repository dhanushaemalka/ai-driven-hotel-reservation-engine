import React from 'react';
import Title from '../components/Title';
import { assets } from '../assets/assets';

const About = () => {
  const roomFeatures = [
    { icon: "🛏️", title: "King Size Beds", desc: "Extra-large double beds for ultimate comfort" },
    { icon: "🪟", title: "Floor-to-Ceiling Windows", desc: "Wake up to stunning mountain views" },
    { icon: "🌅", title: "Private Balcony", desc: "Your personal sunrise viewing spot" },
    { icon: "❄️", title: "Air Conditioning", desc: "Climate control for your comfort" },
    { icon: "📶", title: "Free WiFi", desc: "Stay connected throughout your stay" },
    { icon: "🚿", title: "Ensuite Bathroom", desc: "Private bathroom with hot water" },
    { icon: "🦟", title: "Mosquito Nets", desc: "Sleep peacefully in the hills" },
    { icon: "🪭", title: "Ceiling Fan", desc: "Natural cooling option" },
  ];

  const policies = [
    { label: "Check-in", value: "From 1:00 PM" },
    { label: "Check-out", value: "Until 11:00 AM" },
    { label: "Payment", value: "Cash Only (LKR/USD/EUR)" },
    { label: "Children", value: "Welcome (0-4 free, 6-17 ~$5/night)" },
    { label: "Pets", value: "Not Allowed" },
    { label: "Electrical", value: "230V - Type G/M plugs" },
  ];

  return (
    <div className="pt-28 pb-20">
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-gradient-to-br from-teal-700 via-emerald-600 to-green-700 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <p className="text-emerald-200 font-medium mb-2">Welcome to</p>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-4">
            Cloudy Hill Cottage
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
            Where breathtaking mountain views meet authentic Sri Lankan hospitality
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              ⭐ 9.2/10 Superb Rating
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              🏆 Hospitality 9.9/10
            </span>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="px-6 md:px-16 lg:px-24 py-16">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <span className="text-emerald-600 font-medium">Our Story</span>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-800 mt-2 mb-6">
              Meet Renu & Nalaka
            </h2>
            <p className="text-gray-600 mb-4">
              Cloudy Hill Cottage is more than just accommodation – it's our home, and we're 
              delighted to share it with travelers from around the world. Nestled high in the 
              hills of Ella at Sooriyagahawatte, Kithalella, our family-run lodge offers an 
              authentic glimpse into Sri Lankan hospitality.
            </p>
            <p className="text-gray-600 mb-4">
              We take pride in our hands-on approach, from cooking personalized breakfasts 
              featuring local specialties to providing hand-drawn maps for the famous Ella Rock hike. 
              Our guests often become friends, sharing meals on our terrace while watching the 
              sun set over the valley.
            </p>
            <p className="text-gray-600">
              Whether you're here for adventure, relaxation, or to learn the secrets of 
              Sri Lankan cuisine in our cooking classes, we're here to make your stay unforgettable.
            </p>
          </div>
          <div className="lg:w-1/2">
            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto flex items-center justify-center text-4xl">
                  👨‍👩‍👧
                </div>
                <h3 className="font-semibold text-xl mt-4 text-gray-800">Your Hosts</h3>
                <p className="text-emerald-600">Renu & Nalaka</p>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <span>📍</span> Sooriyagahawatte, Kithalella, Ella 90090
                </p>
                <p className="flex items-center gap-2">
                  <span>📞</span> +94 71 593 4715
                </p>
                <p className="flex items-center gap-2">
                  <span>🏠</span> Family-run since generations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The View */}
      <div className="bg-gray-900 text-white py-16 px-6 md:px-16 lg:px-24">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-4">
            Wake Up to Paradise
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-12">
            Our rooms feature floor-to-ceiling glass windows and private balconies positioned 
            to face the sunrise, Ella Rock, and the valley. Watch the morning mist roll over 
            the mountains without leaving your bed.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <span className="text-4xl">🌄</span>
              <h3 className="font-semibold mt-4 mb-2">Ella Rock View</h3>
              <p className="text-gray-400 text-sm">Direct sightline to the famous peak</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <span className="text-4xl">🌅</span>
              <h3 className="font-semibold mt-4 mb-2">Sunrise from Bed</h3>
              <p className="text-gray-400 text-sm">No early morning trek required</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <span className="text-4xl">🏔️</span>
              <h3 className="font-semibold mt-4 mb-2">Valley Panorama</h3>
              <p className="text-gray-400 text-sm">180° views of rolling hills</p>
            </div>
          </div>
        </div>
      </div>

      {/* Room Features */}
      <div className="px-6 md:px-16 lg:px-24 py-16">
        <Title 
          title="Room Amenities" 
          subTitle="Everything you need for a comfortable mountain retreat"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
          {roomFeatures.map((feature, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-4 text-center hover:bg-emerald-50 transition-colors">
              <span className="text-3xl">{feature.icon}</span>
              <h3 className="font-medium text-gray-800 mt-2 text-sm">{feature.title}</h3>
              <p className="text-gray-500 text-xs mt-1">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Food & Dining */}
      <div className="bg-amber-50 py-16 px-6 md:px-16 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-amber-600 font-medium">Rated 8.8/10</span>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-800 mt-2">
              Food & Dining
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-xl text-gray-800 mb-4">🍳 Breakfast</h3>
              <p className="text-gray-600 mb-4">
                Not a buffet – a personalized breakfast served on your private balcony 
                or our terrace with mountain views.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• String hoppers, roti & coconut sambal</li>
                <li>• Fresh dhal & traditional curries</li>
                <li>• Pancakes & Western options</li>
                <li>• Tropical fruits: papaya, banana, pineapple</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-xl text-gray-800 mb-4">🍛 Dinner</h3>
              <p className="text-gray-600 mb-4">
                Home-cooked dinner available upon request, prepared by Renu with love 
                and authentic family recipes.
              </p>
              <div className="bg-amber-100 rounded-xl p-4 mt-4">
                <p className="font-medium text-amber-800">⭐ Guest Favorite</p>
                <p className="text-amber-700">Renu's Famous Jackfruit Curry</p>
              </div>
            </div>
          </div>
          
          <p className="text-center text-gray-500 mt-8 text-sm">
            🌅 Early breakfast or packed breakfast available for early departures
          </p>
        </div>
      </div>

      {/* Policies */}
      <div className="px-6 md:px-16 lg:px-24 py-16">
        <Title 
          title="House Policies" 
          subTitle="Important information for your stay"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12 max-w-3xl mx-auto">
          {policies.map((policy, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-4">
              <p className="text-gray-500 text-sm">{policy.label}</p>
              <p className="font-medium text-gray-800">{policy.value}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 bg-blue-50 rounded-xl p-6 max-w-3xl mx-auto">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Good to Know</h3>
          <ul className="text-blue-700 text-sm space-y-2">
            <li>• Located in a quiet nature area - monkeys may visit! Keep balcony doors closed when away.</li>
            <li>• The road to the hotel is steep and winding - tuk-tuk recommended at night.</li>
            <li>• We can arrange scooter rentals and laundry service.</li>
            <li>• Maps and directions for Ella Rock hike provided.</li>
          </ul>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-16 px-6 md:px-16 lg:px-24">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience Ella?
          </h2>
          <p className="opacity-90 mb-8">
            Book your stay at Cloudy Hill Cottage and create memories that last a lifetime
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="tel:+94715934715" 
              className="bg-white text-emerald-600 px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              📞 +94 71 593 4715
            </a>
            <span className="text-emerald-200">or</span>
            <a 
              href="/rooms" 
              className="border-2 border-white text-white px-8 py-3 rounded-full font-medium hover:bg-white/10 transition-colors"
            >
              View Our Rooms
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
