import React from "react"; 
import HotelCard from "./HotelCard"; 
import Title from "./Title"; 
import { useAppContext } from "../context/AppContext";

const FeaturedDestination = () => { 
    const { rooms, navigate } = useAppContext();
   
    return (
        <div className='flex flex-col items-center px-4 sm:px-6 md:px-16 lg:px-24 bg-gradient-to-b from-slate-50 to-emerald-50/30 pt-20 pb-24'>
            <div className="text-center mb-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                🏔️ Mountain Sanctuary Accommodation
              </span>
            </div>

            <Title 
                title='Our Luxury Suites & Cottages' 
                subTitle="Handcrafted sanctuary suites designed for tranquil mountain escapes, featuring private sunrise balconies, organic amenities, and panoramic Ella views." 
            /> 

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mt-12 w-full max-w-7xl'> 
                {(rooms.length > 0 ? rooms.slice(0, 4) : [
                  { _id: "1", roomType: "Sunrise Panoramic Suite", pricePerNight: 24000, description: "Breathtaking Ella Rock views with private balcony and luxury king bed." },
                  { _id: "2", roomType: "Misty Mountain Deluxe Cottage", pricePerNight: 28000, description: "Spacious boutique cottage surrounded by lush tea plantations." },
                  { _id: "3", roomType: "Sanctuary Balcony Suite", pricePerNight: 22000, description: "Peaceful forest views with personalized breakfast service." },
                  { _id: "4", roomType: "Honeymoon Mountain Hideaway", pricePerNight: 32000, description: "Secluded sanctuary with sunset deck, outdoor bathtub & curated dinner." },
                ]).map((room, index) => (
                    <div key={room._id || index} className="w-full"> 
                        <HotelCard room={room} index={index} />
                    </div>
                ))}   
            </div>

            <button 
                onClick={() => {
                    navigate('/rooms');
                    window.scrollTo(0, 0);
                }} 
                className='mt-14 px-8 py-3 text-sm font-semibold rounded-2xl bg-emerald-900 text-white hover:bg-emerald-800 transition-all shadow-lg hover:scale-105 cursor-pointer'
            > 
                View All Available Suites →
            </button> 
        </div>
    ); 
}; 

export default FeaturedDestination;
