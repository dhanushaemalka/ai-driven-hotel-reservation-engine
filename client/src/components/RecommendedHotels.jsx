import React, { useEffect, useState } from "react"; 

import HotelCard from "./HotelCard"; 
import Title from "./Title"; 
import { useAppContext } from "../context/AppContext";

const RecommendedHotels = () => { 
    const { rooms, recentSearches } = useAppContext();
    const [recommended, setRecommended] = useState([]);
    
    const filterHotels = () => {
        const searches = Array.isArray(recentSearches) ? recentSearches : [];
        if (searches.length === 0) {
            setRecommended([]);
            return;
        }

        const filtered = (rooms || []).slice().filter((room) => {
            const haystack = `${room?.roomType || ""} ${room?.view || ""}`.toLowerCase();
            return searches.some((s) => haystack.includes(String(s).toLowerCase()));
        });
        setRecommended(filtered);
    }

    useEffect(() => {
        filterHotels();
    }, [rooms, recentSearches])
   
    return  recommended.length > 0  && (

        <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 pt-20 pb-24'>
            <Title 
                title='Recommended Hotels' 
                subTitle="Discover handpicked hotels around the globe, offering unparalleled comfort, luxury, and unforgettable experiences. From boutique escapes to five-star resorts, we make every stay exceptional." 
            /> 

            <div className='flex flex-wrap items-center justify-between gap-6 mt-20'> 
                {recommended.slice(0, 4).map((room, index) => (
                    <div key={room._id || index} className="flex-1 min-w-[250px] max-w-[280px]"> 
                        <HotelCard room={room} index={index} />
                    </div>
                ))}   
            </div>

           
        </div>
    ); 
}; 

export default RecommendedHotels ;
