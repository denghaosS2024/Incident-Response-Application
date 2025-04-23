import { Request, Response } from "express";
import PatientPlan from "../models/PatientPlan";
import Exercise from "../models/Exercise";
import Patient from "../models/Patient" 

const PatientPlanController = {
  async getPatientByUsername(req: Request, res: Response) {
    const { username } = req.params
    try {
      const patient = await Patient.findOne({ username })
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" })
      }
      return res.json(patient)
    } catch (error) {
      console.error("Error fetching patient by username:", error)
      return res.status(500).json({ message: "Internal server error" })
    }
  },
  async getPatientPlan(req: Request, res: Response) {
    const { patientId } = req.params;
    try {
      const plan = await PatientPlan.findOne({ patientId });
      if (!plan) return res.status(404).json({ message: "No plan found" });
      return res.json(plan);
    } catch (error) {
      console.error("Failed to fetch patient plan:", error);
      return res.status(500).json({ message: "Failed to fetch patient plan" });
    }
  },

  async addMedication(req: Request, res: Response) {
    const { patientId } = req.params;
    const medication = req.body;

    try {
      let plan = await PatientPlan.findOne({ patientId });
      if (!plan) {
        plan = new PatientPlan({ patientId, medications: [], exercises: [] });
      }
      plan.medications.push(medication);
      await plan.save();
      return res.status(200).json({ message: "Medication added", plan });
    } catch (error) {
      console.error("Failed to add medication:", error);
      return res.status(500).json({ message: "Failed to add medication" });
    }
  },

  async removeMedication(req: Request, res: Response) {
    const { patientId, index } = req.params;
    try {
      const plan = await PatientPlan.findOne({ patientId });
      if (!plan) return res.status(404).json({ message: "Plan not found" });
      plan.medications.splice(parseInt(index), 1);
      await plan.save();
      return res.status(200).json({ message: "Medication removed", plan });
    } catch (error) {
      console.error("Failed to remove medication:", error);
      return res.status(500).json({ message: "Failed to remove medication" });
    }
  },
  async updateMedication(req: Request, res: Response) {
    const { patientId, index } = req.params;
    const updatedMed = req.body;

    try {
      const plan = await PatientPlan.findOne({ patientId });
      if (!plan) return res.status(404).json({ message: "Plan not found" });

      const idx = parseInt(index);
      if (isNaN(idx) || idx < 0 || idx >= plan.medications.length) {
        return res.status(400).json({ message: "Invalid medication index" });
      }

      plan.medications[idx] = updatedMed;
      await plan.save();

      return res.status(200).json({ message: "Medication updated", plan });
    } catch (error) {
      console.error("Failed to update medication:", error);
      return res.status(500).json({ message: "Failed to update medication" });
    }
  },

  async updateExercises(req: Request, res: Response) {
    const { patientId } = req.params;
    const { exercises: exerciseIds } = req.body;

    try {
      const plan = await PatientPlan.findOne({ patientId });
      if (!plan) {
        return res.status(404).json({ message: "Patient plan not found" });
      }

      const exerciseDocs = await Exercise.find({
        _id: { $in: exerciseIds },
      }).lean();

      if (exerciseDocs.length !== exerciseIds.length) {
        return res.status(400).json({ message: "One or more exercises not found" });
      }

      plan.exercises = exerciseDocs;
      await plan.save();

      return res.status(200).json({ message: "Exercises updated", plan });
    } catch (err) {
      console.error("Failed to update exercises:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }




};

export default PatientPlanController;
