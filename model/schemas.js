import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema({
    datetime: {
        type: Number,
        required: true,
        min: [Date.now(), "The time has passed."],
        max: [Date.now() + 93 * 24 * 3600 * 1000, "You can only book 3 month ahead."],
        validate: {
            validator: function(v) {
                return v % (3600 * 1000) === 0
            },
            message: "Time must be a whole hour."
        }
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\S+@\S+\.\S+$/.test(v)
            },
            message: "Not a valid e-mail address"
        }
    },
    personCount: {
        type: Number,
        required: true,
        min: [1, "Minumum one person."],
        max: [50, "Max 50 persons."]
    },
    laneCount: {
        type: Number,
        required: true,
        min: [1, "Minimum one lane."],
        max: [8, "Max 8 lanes."]

    },
    laneNumbers: {
        type: [Number],
        required: true
    },
    shoeSizes: {
        type: [Number],
        required: true,
        validate: {
            validator: function() {
                return this.personCount === this.shoeSizes.length
            },
            message: "Exactly 1 pair of shoes per person, please."
        }
    },
    bookingNumber: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
})

export const Booking = mongoose.model("Booking", bookingSchema)