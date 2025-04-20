import Spending from "../models/Spending";

class SpendingController {
  /**
   *
   * @returns the list of all spendings by incidentId
   * @throws an error if the database operation fails
   * @description This method fetches all spendings from the database, sorted by date in descending order.
   */
  async getSpendingsByIncidentId(incidentId: string) {
    if (!incidentId || typeof incidentId !== "string") {
      throw new Error("Incident ID is required");
    }
    try {
      const spendings = await Spending.find({ incidentId })
        .sort({ date: -1 })
        .select("-__v")
        .exec();

      return spendings;
    } catch (error) {
      console.error("Error fetching spendings:", error);
      throw error;
    }
  }

  /**
   * @returns the list of spendings for a specific incident
   * @throws an error if the database operation fails
   * @description This method fetches all spendings associated with a specific incident, sorted by date in descending order.
   * @param incidentId - The ID of the incident for which to fetch spendings
   * @throws Error if the incidentId is not provided
   */
  async createSpending(
    incidentId: string,
    amount: number,
    date: Date,
    reason: string,
  ) {
    if (!incidentId || !amount || !date || !reason) {
      throw new Error("All fields are required");
    }

    const spending = new Spending({
      incidentId,
      amount,
      date,
      reason,
    });

    return spending.save();
  }

  /**
   * Create spendings for a list of incidents.
   */
  async createSpendingsForIncidents(
    incidentIds: string[],
    amount: number,
    date: Date,
    reason: string,
  ) {
    if (
      !Array.isArray(incidentIds) ||
      incidentIds.length === 0 ||
      !amount ||
      !date ||
      !reason
    ) {
      throw new Error(
        "All fields are required and incidentIds must be a non-empty array",
      );
    }

    try {
      const spendings = await Spending.createForIncidents(
        incidentIds,
        amount,
        date,
        reason,
      );
      return spendings;
    } catch (error) {
      console.error("Error creating spendings for incidents:", error);
      throw error;
    }
  }
}

export default new SpendingController();
