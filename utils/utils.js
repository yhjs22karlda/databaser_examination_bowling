import {getBookedLanesAtTime} from "../model/model.js"

export async function getAvailibleLanes(datetime) {
    const allLanes = [1,2,3,4,5,6,7,8]
    let bookedLanes = await getBookedLanesAtTime(datetime)
    bookedLanes = bookedLanes.reduce((acc, curr) => acc.concat(curr.laneNumbers), [])
    const freeLanes = allLanes.filter(item => !bookedLanes.includes(item))
    return freeLanes
}