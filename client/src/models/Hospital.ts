export default interface IHospital {
  _id?: string // MongoDB id of the hospital
  hospitalId: string
  hospitalName: string
  hospitalAddress: string
  hospitalDescription: string
  totalNumberERBeds: number
  totalNumberOfPatients: number
  nurses: string[]
  hospitalGroupId?:  string // id of the associated chat channel
}
