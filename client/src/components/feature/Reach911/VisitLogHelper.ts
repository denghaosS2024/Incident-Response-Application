import IHospital from "@/models/Hospital";
import request from "@/utils/request";
import { IVisitLogForm } from "./IVisitLogForm";

export default class VisitLogHelper {
  static readonly priorities = Object.values(["E", "1", "2", "3", "4"]).map(
    (value) => ({ value, label: value }),
  );

  static readonly locations = Object.values(["Road", "ER"]).map((value) => ({
    value,
    label: value,
  }));

  static async saveFormData(
    formData: IVisitLogForm,
    incidentId: string,
    visitTime: string,
    patientId: string,
  ) {
    const cleanedData: Partial<IVisitLogForm> = {};

    const normalizeValue = (
      key: keyof IVisitLogForm,
      value: string,
    ): IVisitLogForm[keyof IVisitLogForm] => {
      if (key === "age") {
        return value === "" ? null : parseInt(value);
      } else if (key === "drugs" || key === "allergies") {
        return value
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v.length > 0);
      } else {
        return value;
      }
    };

    for (const [key, value] of Object.entries(formData)) {
      if (!value) continue; // skip undefined / empty
      const typedKey = key as keyof IVisitLogForm;

      // Use `as typeof cleanedData` to satisfy strict index types
      cleanedData[typedKey] = normalizeValue(typedKey, value);
    }

    const message = await request("/api/patients/visitLogs", {
      method: "PUT",
      body: JSON.stringify({
        patientId,
        updatedVisitData: {
          ...cleanedData,
          incidentId,
          dateTime: visitTime,
        },
        updatedBy: localStorage.getItem("username"),
      }),
    });

    if (message) {
      alert("Form data saved successfully");
    } else {
      alert("Form data not saved");
    }
  }

  static async getHospitalByUserId(userId: string) {
    const res = await fetch(`/api/users/${userId}`);
    const user = await res.json();

    const hospitalId = user.hospitalId;

    const hospital: IHospital = await (
      await fetch(`/api/hospital?hospitalId=${hospitalId}`)
    ).json();

    return hospital;
  }

  static readonly conditions = Object.values([
    "Allergy",
    "Asthma",
    "Bleeding",
    "Broken bone",
    "Burn",
    "Choking",
    "Concussion",
    "Covid-19",
    "Heart Attack",
    "Heat Stroke",
    "Hypothermia",
    "Poisoning",
    "Seizure",
    "Shock",
    "Strain",
    "Sprain",
    "Stroke",
    "Others",
    "",
  ]).map((value) => ({
    value,
    label: value,
  }));
}
