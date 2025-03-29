export default interface IHospital<T = string> {
  _id?: string // MongoDB id of the hospital
  hospitalId: string
  hospitalName: string
  hospitalAddress: string
  hospitalDescription: string
  totalNumberERBeds: number
  totalNumberOfPatients: number
  nurses: T[]
  hospitalGroupId?: string
  distance?: number
}
