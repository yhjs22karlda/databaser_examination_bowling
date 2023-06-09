import {Booking} from "./schemas.js"

export function createBooking(input) {
    return Booking.create(input)
}

export function getBookedLanesAtTime(datetime) {
    return Booking.find({datetime}, "laneNumbers -_id")
}

export function getBooking(bookingNumber) {
    return Booking.findOne({bookingNumber}, "-_id -__v").lean()
}

export function deleteBooking(bookingNumber) {
    return Booking.findOneAndDelete({bookingNumber})
}

export function updateBooking(bookingNumber, newInfo) {
    return Booking.findOneAndReplace(
        {bookingNumber},
        newInfo,
        {new: true, runValidators: true}
    ).select('-_id')
}

export function getBookingsInIntervall(start, end) {
    return Booking.find({
        $and: [
            {datetime: {$gte:start}},
            {datetime: {$lte:end}},
        ]
    })
    .sort({datetime: 1})
    .select('datetime laneNumbers -_id')
}