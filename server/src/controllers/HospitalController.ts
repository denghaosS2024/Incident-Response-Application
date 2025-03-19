import Hospital from "../models/Hospital";

class HospitalController {

    /** 
     * Create a new Hospital 
     * @param hospitalName
     * @param hospitalAddress
     * @param hospitalDescription
     */
    async create(hospitalName: string, hospitalAddress: string, hospitalDescription?: string) {
        try {
            const hospital = new Hospital({
                hospitalName,
                hospitalAddress,
                hospitalDescription,
            });
    
            await hospital.save();
            return hospital;
        } catch (error) {
            console.error("Error creating hospital:", error);
            throw new Error("Failed to create hospital");
        }
    }

}

export default new HospitalController()