export default interface IPatient {
    patientId: string
    name: string
    nameLower: string
    visitLog?: { date: string; location: string; link: string }[]
    nurseId?: string
    hospitalId?: string
    priority?: string
    status?: string
    location?: string
    master?: string
}
