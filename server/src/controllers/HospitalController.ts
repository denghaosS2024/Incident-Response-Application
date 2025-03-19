import Hospital, { IHospital } from "../models/Hospital";

class HospitalController {

    /**
     * Create a new Hospital
     * @param hospital An object of IHospital 
     * @returns The new hospital object which was created
     */
    async create(hospital: IHospital) {
        try {
            const newHospital = new Hospital({
                hospitalName: hospital.hospitalName,
                hospitalAddress: hospital.hospitalAddress,
                hospitalDescription: hospital.hospitalDescription,
            });

            await newHospital.save();
            return newHospital;
        } catch (error) {
            console.error("Error creating hospital:", error);
            throw new Error("Failed to create hospital");
        }
    }

    /**
     * Fetch hospital details by hospitalId
     * @param hospitalId
     * @returns The hospital object associated with the hospitalId passed
     */
    async getByHospitalId(hospitalId: string) {
        try {
            const hospital = await Hospital.findOne({ hospitalId });

            if (!hospital) {
                throw new Error("Hospital not found");
            }

            return hospital;
        } catch (error) {
            console.error("Error fetching hospital details:", error);
            throw new Error("Failed to fetch hospital details");
        }
    }

}

export default new HospitalController()