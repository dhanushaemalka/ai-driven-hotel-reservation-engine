import React, { useState, useEffect } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MyBookings = () => {
    const { axios, getToken, user, currency } = useAppContext()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [processingPaymentId, setProcessingPaymentId] = useState(null)
    const [paymentStatusByBooking, setPaymentStatusByBooking] = useState({})

    const fetchBookings = async () => {
        try {
            const { data } = await axios.get('/api/bookings/user', {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            if (data.success) {
                setBookings(data.bookings)
                const token = await getToken()
                const paymentChecks = await Promise.all(
                    (data.bookings || []).map(async (booking) => {
                        if (!booking?._id) return { bookingId: null, status: null }
                        try {
                            const paymentRes = await axios.get(`/api/payments/booking/${booking._id}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            })
                            if (paymentRes.data?.success && paymentRes.data?.payment) {
                                return { bookingId: booking._id, status: paymentRes.data.payment.status }
                            }
                            return { bookingId: booking._id, status: null }
                        } catch {
                            return { bookingId: booking._id, status: null }
                        }
                    })
                )

                const nextStatusMap = {}
                paymentChecks.forEach((item) => {
                    if (item.bookingId) nextStatusMap[item.bookingId] = item.status
                })
                setPaymentStatusByBooking(nextStatusMap)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const cancelBooking = async (bookingId) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return
        
        try {
            const { data } = await axios.put(`/api/bookings/${bookingId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            if (data.success) {
                toast.success('Booking cancelled successfully')
                fetchBookings()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handlePayNow = async (booking) => {
        try {
            setProcessingPaymentId(booking._id)
            const token = await getToken()

            const method = ['online', 'card', 'bank_transfer'].includes(booking.paymentMethod)
                ? booking.paymentMethod
                : 'online'

            const { data } = await axios.post('/api/payments', {
                bookingId: booking._id,
                amount: booking.totalPrice,
                method,
                notes: `Submitted from My Bookings (${method})`
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                toast.success('Payment submitted. Waiting for admin approval.')
                setPaymentStatusByBooking((prev) => ({ ...prev, [booking._id]: 'pending' }))
            } else {
                toast.error(data.message || 'Failed to submit payment')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to submit payment')
        } finally {
            setProcessingPaymentId(null)
        }
    }

    useEffect(() => {
        if (user) {
            fetchBookings()
        }
    }, [user])

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700'
            case 'pending': return 'bg-yellow-100 text-yellow-700'
            case 'cancelled': return 'bg-red-100 text-red-700'
            case 'completed': return 'bg-blue-100 text-blue-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    if (loading) {
        return (
            <div className='py-28 md:pb-35 md:pt-32 px-4 md:px-16 flex justify-center items-center min-h-[60vh]'>
                <p className='text-gray-500'>Loading your bookings...</p>
            </div>
        )
    }

    return (
        <div className='py-28 md:pb-35 md:pt-32 px-4 md:px-16'>

            <Title title='My Bookings' subTitle='Manage your reservations at Cloudy Hill Cottage. View past stays and upcoming visits.' align='left' />

            <div className='max-w-6xl mt-8 w-full text-gray-800'>
                {bookings.length === 0 ? (
                    <div className='text-center py-10'>
                        <p className='text-gray-500'>You have no bookings yet.</p>
                        <a href='/rooms' className='text-primary hover:underline mt-2 inline-block'>Browse available rooms</a>
                    </div>
                ) : (
                    <>
                        <div className='hidden md:grid md:grid-cols-[2fr_2fr_1fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3'>
                            <div>Room</div>
                            <div>Date & Timings</div>
                            <div>Status</div>
                            <div>Payment</div>
                        </div>

                        {bookings.map((booking) => (
                            <div key={booking._id} className='grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr] w-full border-b border-gray-300 py-6 first:border-t items-center'>
                                
                                {/* Room Details */}
                                <div className='flex flex-col md:flex-row'>
                                    {booking.room?.images?.[0] ? (
                                        <img src={booking.room.images[0]} alt="room" className='md:w-32 h-24 rounded shadow object-cover' />
                                    ) : (
                                        <div className='md:w-32 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded shadow flex items-center justify-center'>
                                            <span className='text-3xl'>🏠</span>
                                        </div>
                                    )}
                                    <div className='flex flex-col gap-1 mt-3 md:mt-0 md:ml-4'>
                                        <p className='font-playfair text-xl'>
                                            {booking.room?.roomType || 'Room'}
                                        </p>
                                        <p className='text-sm text-gray-500'>
                                            Room {booking.room?.roomNumber || '-'}
                                        </p>
                                        <div className='flex items-center gap-1 text-sm text-gray-500'>
                                            <img src={assets.locationIcon} alt="location" className='w-4 h-4' />
                                            <span>Cloudy Hill Cottage, Ella</span>
                                        </div>
                                        <div className='flex items-center gap-1 text-sm text-gray-500'>
                                            <img src={assets.guestsIcon} alt="guests" className='w-4 h-4' />
                                            <span>{booking.guests} Guest{booking.guests > 1 ? 's' : ''}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Date and Timing */}
                                <div className='flex flex-row md:flex-col gap-4 md:gap-2 mt-3 md:mt-0'>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-gray-400 text-sm'>Check-In:</span>
                                        <span className='text-sm font-medium'>
                                            {new Date(booking.checkInDate).toLocaleDateString('en-US', { 
                                                weekday: 'short', 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })}
                                        </span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-gray-400 text-sm'>Check-Out:</span>
                                        <span className='text-sm font-medium'>
                                            {new Date(booking.checkOutDate).toLocaleDateString('en-US', { 
                                                weekday: 'short', 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {/* Booking Status */}
                                <div className='flex flex-col gap-2 mt-3 md:mt-0'>
                                    <span className={`text-xs px-3 py-1 rounded-full w-fit ${getStatusColor(booking.status)}`}>
                                        {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                                    </span>
                                    {booking.status === 'pending' && (
                                        <button 
                                            onClick={() => cancelBooking(booking._id)}
                                            className='text-xs text-red-500 hover:text-red-700 underline'
                                        >
                                            Cancel Booking
                                        </button>
                                    )}
                                </div>

                                {/* Payment Status */}
                                <div className='flex flex-col items-start justify-center mt-3 md:mt-0'>
                                    <p className='text-lg font-semibold'>{currency} {booking.totalPrice?.toLocaleString()}</p>
                                    <div className='flex items-center gap-2 mt-1'>
                                        <div className={`h-2 w-2 rounded-full ${booking.isPaid ? "bg-green-500" : "bg-orange-500"}`} />
                                        <p className={`text-xs ${booking.isPaid ? "text-green-600" : "text-orange-600"}`}>
                                            {booking.isPaid ? "Paid" : booking.paymentMethod === 'pay_at_cottage' ? "Pay at cottage" : "Unpaid"}
                                        </p>
                                    </div>

                                    {!booking.isPaid && paymentStatusByBooking[booking._id] === 'pending' && (
                                        <span className='mt-2 text-[11px] px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200'>
                                            Pending Approval
                                        </span>
                                    )}

                                    {!booking.isPaid && booking.status !== 'cancelled' && booking.paymentMethod !== 'pay_at_cottage' && (
                                        <button
                                            onClick={() => handlePayNow(booking)}
                                            disabled={processingPaymentId === booking._id}
                                            className='mt-2 px-4 py-1 bg-primary text-white rounded text-sm hover:bg-primary-dull transition-all disabled:opacity-60 disabled:cursor-not-allowed'
                                        >
                                            {processingPaymentId === booking._id ? 'Submitting...' : 'Pay Now'}
                                        </button>
                                    )}
                                </div>

                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}

export default MyBookings;
