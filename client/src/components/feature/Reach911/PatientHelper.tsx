export default class PatientHelper {
    /**
     * Fetches the patient ID from the database using the username
     * @param username The username of the patient
     * @returns The patient ID
     * @throws Error if the patient ID
     */
    static async getPatientIdByUsername(
        username: string,
    ): Promise<string | undefined> {
        const response = await fetch(
            `/api/users/findByUsername?username=${username}`,
            {
                method: 'GET',
            },
        )

        if (!response.ok) {
            throw new Error('Failed to fetch patient ID')
        }

        const data = await response.json()

        if (!data.userId) {
            throw new Error('Patient ID not found')
        }

        return data.userId
    }

    /**
     * Converts a date string to a time string
     * @param dateString The date string to convert
     * @returns The time string
     */
    static timeString(date: Date): string {
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().substring(2)}`
    }

    static async getPatientInfo(patientId: string) {
        const response = await fetch(
            `/api/patients/single?patientId=${patientId}`,
            {
                method: 'GET',
            },
        )

        if (!response.ok) {
            throw new Error('Failed to fetch patient info')
        }

        const res = await response.json()

        console.log(res)

        return res
    }
}
