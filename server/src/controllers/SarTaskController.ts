import Task from "../models/SarTask";

class SarTaskController {
  async getAllTasks(incidentId: string) {
    return Task.find({ incidentId }).sort({ address: 1 }).exec();
  }
  async getNotDoneTasks(incidentId: string) {
    return Task.find({ incidentId, status: { $ne: "DONE" } })
      .sort({ address: 1 })
      .exec();
  }
  async getToDoTasks(incidentId: string) {
    return Task.find({ incidentId, status: "TO-DO" })
      .sort({ address: 1 })
      .exec();
  }
  async getProgressTasks(incidentId: string) {
    return Task.find({ incidentId, status: "IN-PROGRESS" })
      .sort({ address: 1 })
      .exec();
  }
  async getDoneTasks(incidentId: string) {
    return Task.find({ incidentId, status: "DONE" })
      .sort({ address: 1 })
      .exec();
  }
}
export default new SarTaskController();
