import Task from '../models/SarTask';

class SarTaskController {

  async getAllTasks() {
    return Task.find().sort({ address: 1 }).exec();
  }
  async getNotDoneTasks() {
    return Task.find({ status: { $ne: 'DONE' } }).sort({ address: 1 }).exec();
  }
  async getDoneTasks() {
    return Task.find({ status: 'DONE' }).sort({ address: 1 }).exec();
  }
}
export default new SarTaskController();