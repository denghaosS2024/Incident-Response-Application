export default interface IPatient {
    patientId: string
    name: string
    nameLower: string
    nurseId?: string
    hospitalId?: string
    priority?: string
    status?: string
    location?: string
}
