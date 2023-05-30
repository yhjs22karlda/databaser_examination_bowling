import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()
import {nanoid} from "nanoid"
import {getBooking, createBooking, updateBooking, deleteBooking, getBookingsInIntervall} from "./model/model.js"
import {getAvailibleLanes} from "./utils/utils.js"
const app = express()
const PORT = 3000

app.use(express.json())

app.get("/api/booking/:id", async (req, res) => {
    try {
        const result = await getBooking(req.params.id)
        if(!result) {
            return res.status(400).json({success: false, msg: "Booking number does not exist"})
        }
        result.datetime = new Date(result.datetime)
            .toLocaleString("sv", {dateStyle: "short", timeStyle: "short"})
        res.status(200).json({success: true, data: result})
    } catch (err) {
        res.status(500).json({success: false, msg: err.message})
    }
})

app.post("/api/booking/create", async (req, res) => {
    const freeLanes = await getAvailibleLanes(req.body.datetime)
    if(freeLanes.length < req.body.laneCount) {
        return res.status(400).json({success:false, msg: "Not enough free lanes at that time."})
    }
    req.body.laneNumbers = freeLanes.slice(0, req.body.laneCount)
    req.body.price = req.body.laneCount * 100 + req.body.personCount * 120
    req.body.bookingNumber = nanoid() 
    try {
        const result = await createBooking(req.body)
        res.status(201).json({success: true, msg: "Booking made.", data: result})
    } catch (err) {
        res.status(500).json({success: false, msg: err.message})
    }
})

app.put("/api/booking/change/:id", async (req, res) => {
    const booking = await getBooking(req.params.id)
    if(!booking) {
        return res.status(400).json({success: false, msg: "Booking number does not exist"})
    }

    let freeLanes = await getAvailibleLanes(req.body.datetime)
    if(booking.datetime === req.body.datetime) {
        freeLanes = booking.laneNumbers.concat(freeLanes)
    }

    if(freeLanes.length < req.body.laneCount) {
        return res.status(400).json({success:false, msg: "Not enough free lanes at that time."})
    }

    req.body.laneNumbers = freeLanes.slice(0, req.body.laneCount)
    req.body.bookingNumber = req.params.id
    req.body.price = req.body.laneCount * 100 + req.body.personCount * 120
    try {
        const result = await updateBooking(req.params.id, req.body)
        res.status(201).json({success: true, msg: "Booking changed.", data: result})
    } catch (err) {
        res.status(500).json({success: false, msg: err.message})
    }
})

app.delete("/api/booking/delete/:id", async (req, res) => {
    try {
        const result = await deleteBooking(req.params.id)
        if(!result) {
            return res.status(400).json({success: false, msg: "Booking number does not exist"})
        }
        res.status(200).json({success: true, msg: `Booking number "${req.params.id}" deleted.`})
    } catch (err) {
        res.status(500).json({success: false, msg: err.message})
    }
})

app.get("/api/lanes", async (req, res) => {
    if(!req.query.start || !req.query.end) {
        return res.status(400).json({success: false, msg: "Fill in query intervalls."})
    }
    try {
        const bookings = await getBookingsInIntervall(req.query.start, req.query.end)

        const data = []
        for(let i = 1; i <= 8; i++) {
            let laneObj = {}
            laneObj.bana = i
            laneObj.bookings = []
            bookings.forEach(item => {
                if(item.laneNumbers.includes(i)) {
                    laneObj.bookings.push(
                        new Date(item.datetime).toLocaleString("sv",
                            {dateStyle: "medium", timeStyle: "short"})
                    )
                }
            })
            data.push(laneObj)
        }
        const msg = "Shows lane bookings between " + 
            new Date(Number(req.query.start))
            .toLocaleString("sv", {dateStyle: "medium", timeStyle: "short"}) + " and " +
            new Date(Number(req.query.end))
            .toLocaleString("sv", {dateStyle: "medium", timeStyle: "short"}) + "."
        res.status(200).json({success: true, msg, data})
    } catch (err) {
        res.status(500).json({success: false, msg: err.message})
    }
})

app.use((err, req, res, next) => {
    res.status(err.statusCode).json({status: false, msg: "Unexpexted error: " + err})
})

mongoose.connect(process.env.DATABASE_URL)
mongoose.connection.on('error', err => console.log(err))
mongoose.connection.once('connected', () => console.log('Connected to Database'))

app.listen(PORT, () => {
    console.log("Listening to port ", PORT)
    // addSomeStartBookings()
})


function addSomeStartBookings() {
    const startData = [
        {
            datetime: Date.parse(new Date("2023-07-01T10:00:00+02:00")), // 1688198400000
            email: "user11@example.com",
            personCount: 2,
            laneCount: 2,
            shoeSizes: [45, 40]
        },
        {
            datetime: Date.parse(new Date("2023-07-02T10:00:00+02:00")), // 1688284800000
            email: "user11@example.com",
            personCount: 3,
            laneCount: 3,
            shoeSizes: [45, 40, 38]
        },
        {
            datetime: Date.parse(new Date("2023-07-02T14:00:00+02:00")), // 1688299200000
            email: "user11@example.com",
            personCount: 2,
            laneCount: 2,
            shoeSizes: [45, 40]
        },
        {
            datetime: Date.parse(new Date("2023-07-03T10:00:00+02:00")), // 1688371200000
            email: "user11@example.com",
            personCount: 10,
            laneCount: 5,
            shoeSizes: [45, 40, 42, 42, 42, 41, 45, 37, 38, 38]
        },
    ]

    for(let i = 0; i < startData.length; i++) {
        const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(startData[i])
        };

        fetch('http://localhost:3000/api/booking/create', options)
        .then(response => response.json())
        .then(response => console.log(response))

        .catch(err => console.error(err));
    }
}