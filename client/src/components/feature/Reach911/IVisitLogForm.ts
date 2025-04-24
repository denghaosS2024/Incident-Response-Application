type DrugItem = {
  name: string;
  dosage: string;
  route: string;
};

export interface IVisitLogForm {
  priority: string;
  location: string;
  age: string;
  conscious: string;
  breathing: string;
  chiefComplaint: string;
  condition: string;
  drugs: DrugItem[];
  allergies: string;
  hospitalId: string;
  hospitalName: string;
}
