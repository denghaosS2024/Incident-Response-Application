import { Router } from 'express';
import HospitalController from '../controllers/HospitalController';
import type { IHospital } from '../models/Hospital';

export default Router()

    .post('/register', async (request, response) => {
        try {
            const hospitalData = request.body as IHospital;
            if (!hospitalData.hospitalName || !hospitalData.hospitalAddress) {
                return response.status(400).send({ message: "hospitalName and hospitalAddress are mandatory fields" });
            }
            const result = await HospitalController.create(hospitalData);
            return response.status(201).send(result);
        } catch (e) {
            const error = e as Error;
            return response.status(500).send({ message: error.message });
        }
    })

    .get('/:hospitalId', async (request, response) => {
        try {
            const hospitalId = request.params.hospitalId;
            const result = await HospitalController.getHospitalById(hospitalId);
            if (!result) {
                return response.status(404).json({ message: "No Hospital found" });
            }
            return response.status(200).json(result);
        } catch (e) {
            const error = e as Error;
            return response.status(500).json({ message: error.message })
        }
    })

