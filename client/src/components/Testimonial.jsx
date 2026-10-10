import React from 'react';
import Title from './Title';
import StarRating from './StarRating';

const Testimonial = () => {
  const reviews = [
    {
      id: 1,
      name: "Sarah Mitchell",
      country: "Australia",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
      rating: 5,
      review: "The views from our room were absolutely breathtaking! Watching the sunrise over Ella Rock from bed was magical. Renu's Jackfruit Curry is the best I've ever had!"
    },
    {
      id: 2,
      name: "Thomas Weber",
      country: "Germany",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
      rating: 5,
      review: "The cooking class was the highlight of our trip! Renu taught us authentic Sri Lankan recipes. The personalized breakfast on our balcony every morning was incredible."
    },
    {
      id: 3,
      name: "Emily Chen",
      country: "Singapore",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200",
      rating: 5,
      review: "Renu and Nalaka made us feel like family. The hand-drawn map for Ella Rock hike was so helpful! This cozy cottage has the best hospitality I've experienced."
    }
  ];

  return (
    <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 bg-gradient-to-b from-slate-50 to-white pt-20 pb-24">
      <div className="text-center mb-4">
        <span className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-sm font-medium">
          ⭐ 9.2/10 Overall Rating
        </span>
      </div>
      <Title
        title="Guest Experiences"
        subTitle="Discover why travelers from around the world choose Cloudy Hill Cottage for their Ella adventure"
      />

      {/* Rating Highlights */}
      <div className="flex flex-wrap justify-center gap-6 mt-8 mb-12">
        <div className="text-center">
          <p className="text-3xl font-bold text-emerald-600">9.9</p>
          <p className="text-sm text-gray-500">Hospitality</p>
        </div>
        <div className="w-px h-12 bg-gray-200"></div>
        <div className="text-center">
          <p className="text-3xl font-bold text-emerald-600">9.5</p>
          <p className="text-sm text-gray-500">Location</p>
        </div>
        <div className="w-px h-12 bg-gray-200"></div>
        <div className="text-center">
          <p className="text-3xl font-bold text-emerald-600">8.8</p>
          <p className="text-sm text-gray-500">Breakfast</p>
        </div>
        <div className="w-px h-12 bg-gray-200"></div>
        <div className="text-center">
          <p className="text-3xl font-bold text-emerald-600">9.4</p>
          <p className="text-sm text-gray-500">Cleanliness</p>
        </div>
      </div>

      {/* Reviews */}
      <div className="flex flex-wrap items-stretch justify-center gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow max-w-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <img
                className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-100"
                src={review.image}
                alt={review.name}
              />
              <div>
                <p className="font-semibold text-gray-800">{review.name}</p>
                <p className="text-gray-500 text-sm">📍 {review.country}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              <StarRating />
            </div>
            <p className="text-gray-600 mt-4 leading-relaxed">"{review.review}"</p>
          </div>
        ))}
      </div>

      {/* Trust Badge */}
      <div className="mt-12 text-center">
        <p className="text-gray-500 text-sm">
          Based on 200+ verified guest reviews
        </p>
      </div>
    </div>
  );
};

export default Testimonial;
