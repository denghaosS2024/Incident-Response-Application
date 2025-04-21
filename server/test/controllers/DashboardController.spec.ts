import { Request, Response } from "express";
import {
  createChart,
  deleteChart,
  getBarChartData,
  getCharts,
  getLineChartData,
  getPieChartData,
  modifyChart
} from "../../../server/src/controllers/DashboardController";
import User from "../../../server/src/models/User";
import Chart, { ChartDataType, ChartType } from "../../src/models/Dashboard";
import Incident from "../../src/models/Incident";


jest.mock("../../src/models/Dashboard");
jest.mock("../../src/models/Incident");
jest.mock("../../src/models/Message");
jest.mock("../../src/models/Patient");
jest.mock("../../src/models/User");

const mockRes = () => {
  const json = jest.fn();
  const status = jest.fn(() => ({ json })) as any;
  return { status, json };
};

describe("DashboardController Chart Data", () => {
  const startDate = new Date("2025-03-01");
  const endDate = new Date("2025-03-10");

  describe("getPieChartData", () => {
    it("returns incident type data", async () => {
      (Incident.aggregate as jest.Mock).mockResolvedValue([
        { _id: "F", count: 5 },
        { _id: "M", count: 3 },
      ]);
      const result = await getPieChartData(ChartDataType.IncidentType, startDate, endDate);
      expect(result.labels).toEqual(["F", "M"]);
      expect(result.datasets[0].data).toEqual([5, 3]);
    });

    it("returns incident priority data", async () => {
      (Incident.aggregate as jest.Mock).mockResolvedValue([
        { _id: "E", count: 2 },
        { _id: "One", count: 4 },
      ]);
      const result = await getPieChartData(ChartDataType.IncidentPriority, startDate, endDate);
      expect(result.labels).toContain("E");
    });

    it("returns SAR victims data", async () => {
      const mockIncidentData = [
        {
          sarTasks: [
            { victims: [1, 2, 0, 0, 1] },
            { victims: [2, 0, 1, 0, 0] },
          ],
        },
      ];

      (Incident.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockIncidentData),
      });

      const data = await getPieChartData(
        ChartDataType.SARVictims,
        new Date("2025-03-01"),
        new Date("2025-04-01"),
      );

      expect(data.labels).toEqual([
        "Immediate",
        "Urgent",
        "Could Wait",
        "Dismiss",
        "Deceased",
      ]);
      expect(data.datasets[0].data).toEqual([3, 2, 1, 0, 1]);
    });
  });

  describe("getLineChartData", () => {
    it("returns incident state over time", async () => {
      (Incident.aggregate as jest.Mock).mockResolvedValue([
        { _id: { date: "2025-03-01", state: "Waiting" }, count: 1 },
        { _id: { date: "2025-03-01", state: "Assigned" }, count: 2 },
      ]);
      const result = await getLineChartData(ChartDataType.IncidentState, startDate, endDate);
      expect(result.labels).toContain("2025-03-01");
      expect(result.datasets.length).toBeGreaterThan(0);
    });
  });

  describe("getPieChartData", () => {
    it("returns incident resources data", async () => {
      const mockIncidents = [
        {
          commander: "Commander1",
          assignedVehicles: [
            {
              type: "Car",
              usernames: ["Police1", "Fire1"],
            },
            {
              type: "Truck",
              usernames: ["Fire2"],
            },
          ],
        },
        {
          commander: "Commander2",
          assignedVehicles: [
            {
              type: "Truck",
              usernames: ["Police2"],
            },
          ],
        },
      ];

      const mockUsers = [
        { username: "Police1", role: "Police" },
        { username: "Police2", role: "Police" },
        { username: "Fire1", role: "Fire" },
        { username: "Fire2", role: "Fire" },
      ];

      (Incident.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockIncidents),
      });
      
      (User.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers),
      });

      const data = await getPieChartData(
        ChartDataType.IncidentResources,
        new Date("2025-03-01"),
        new Date("2025-04-01"),
      );

      expect(data.labels).toEqual([
        "Commanders",
        "Police Officers",
        "Firefighters",
        "Cars",
        "Trucks",
      ]);

      // 2 commanders, 2 police, 2 fire, 1 car, 2 trucks
      expect(data.datasets[0].data).toEqual([2, 2, 2, 1, 2]);
    });
  });

  describe("getBarChartData", () => {
    it("returns incident state grouped by day", async () => {
      (Incident.aggregate as jest.Mock).mockResolvedValue([
        { _id: { date: "2025-03-01", state: "Triage" }, count: 2 },
        { _id: { date: "2025-03-02", state: "Triage" }, count: 3 },
      ]);
      const result = await getBarChartData(ChartDataType.IncidentState, startDate, endDate);
      expect(result.labels).toContain("Triage");
      expect(result.datasets.find((d) => d.label === "2025-03-02")).toBeDefined();
    });
  });

  describe("getCharts", () => {
    it("returns all charts for a user", async () => {
      const mockCharts = [{ name: "Chart A" }, { name: "Chart B" }];
      (Chart.find as jest.Mock).mockResolvedValue(mockCharts);
      const req = {
        params: { userId: "user123" },
      } as unknown as Request;
      const res = mockRes();

      await getCharts(req, res as unknown as Response);
      expect(res.json).toHaveBeenCalledWith({ charts: mockCharts });
    });
  });
});


describe("ChartController Unit Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock })) as any;

    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe("createChart", () => {
    it("should return 400 if required fields are missing", async () => {
      req = { body: {} };

      await createChart(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: expect.stringContaining("Missing required field(s)"),
      });
    });

    it("should create and save chart with custom date range", async () => {
      const saveMock = jest.fn().mockResolvedValue({});
      (Chart as jest.Mocked<any>).mockImplementation(() => ({
        save: saveMock,
      }));

      const start = new Date();
      start.setDate(start.getDate() - 5);
      const end = new Date();

      req = {
        body: {
          userId: "user123",
          name: "My Chart",
          type: ChartType.Pie,
          dataType: ChartDataType.IncidentType,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
      };

      await createChart(req as Request, res as Response);

      expect(saveMock).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Chart saved successfully.",
      });
    });

    it("should return 400 for invalid enum values", async () => {
      req = {
        body: {
          userId: "user123",
          name: "Invalid Chart",
          type: "InvalidType",
          dataType: "InvalidDataType",
        },
      };

      await createChart(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: expect.stringContaining("Invalid chart type"),
      });
    });

    it("should return 400 if startDate >= endDate", async () => {
      req = {
        body: {
          userId: "user123",
          name: "Invalid Date",
          type: ChartType.Pie,
          dataType: ChartDataType.IncidentType,
          startDate: "2025-04-01T00:00:00Z",
          endDate: "2025-03-01T00:00:00Z",
        },
      };

      await createChart(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Start date must be before end date.",
      });
    });

    it("should return 500 if save throws error", async () => {
      const saveMock = jest.fn().mockRejectedValue(new Error("DB failure"));
      (Chart as jest.Mocked<any>).mockImplementation(() => ({
        save: saveMock,
      }));

      req = {
        body: {
          userId: "user123",
          name: "Crash",
          type: ChartType.Pie,
          dataType: ChartDataType.IncidentType,
        },
      };

      await createChart(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Server error. Please try again later.",
      });
    });
  });

  describe("modifyChart", () => {
    beforeEach(() => {
      req = {
        params: { chartId: "chart123" },
        body: {
          name: "Updated Chart",
          type: ChartType.Pie,
          dataType: ChartDataType.IncidentType,
          startDate: "2024-03-01T00:00:00Z",
          endDate: "2024-03-04T00:00:00Z",
        },
      };
    });

    it("should modify and return chart", async () => {
      const mockChart = { _id: "chart123", name: "Updated Chart" };

      (Chart.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockChart);

      await modifyChart(req as Request, res as Response);

      expect(Chart.findByIdAndUpdate).toHaveBeenCalledWith(
        "chart123",
        req!.body,
        { new: true },
      );

      expect(jsonMock).toHaveBeenCalledWith({
        message: "Chart updated successfully.",
        chart: mockChart,
      });
    });

    it("should return 400 if fields are missing", async () => {
      req!.body = { type: ChartType.Pie, dataType: ChartDataType.IncidentType };

      await modifyChart(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Missing required field(s): name",
      });
    });

    it("should return 400 for invalid date range", async () => {
      req!.body.startDate = "2025-04-01T00:00:00Z";
      req!.body.endDate = "2025-03-01T00:00:00Z";

      await modifyChart(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Start date must be before end date.",
      });
    });

    it("should return 404 if chart not found", async () => {
      (Chart.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await modifyChart(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Chart not found.",
      });
    });

    it("should return 500 if DB throws error", async () => {
      (Chart.findByIdAndUpdate as jest.Mock).mockRejectedValue(
        new Error("Mongo crash"),
      );

      await modifyChart(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Server error. Please try again later.",
      });
    });
  });

  describe("deleteChart", () => {
    it("should delete the chart and return success", async () => {
      const mockChart = { _id: "chart123", name: "Old Chart" };
      (Chart.findByIdAndDelete as jest.Mock).mockResolvedValue(mockChart);

      req = { params: { chartId: "chart123" } };

      await deleteChart(req as Request, res as Response);

      expect(Chart.findByIdAndDelete).toHaveBeenCalledWith("chart123");
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Chart deleted successfully.",
      });
    });

    it("should return 404 if chart is not found", async () => {
      (Chart.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      req = { params: { chartId: "not-found" } };

      await deleteChart(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Chart not found.",
      });
    });

    it("should return 500 if delete fails", async () => {
      (Chart.findByIdAndDelete as jest.Mock).mockRejectedValue(
        new Error("DB crash"),
      );

      req = { params: { chartId: "crash-id" } };

      await deleteChart(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Server error. Please try again later.",
      });
    });
  });
});
