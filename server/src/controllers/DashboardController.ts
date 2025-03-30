import { Request, Response } from 'express';
import Chart, { ChartDataType, ChartType, IChart } from '../models/Dashboard';
import Incident from '../models/Incident';

/**
 * Function: Get chart data formatted for a Pie Chart
 * Returns total counts per label (Incident Type).
 */
const getPieChartData = async (startDate: Date, endDate: Date) => {
  const incidents = await Incident.aggregate([
    { $match: { openingDate: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    labels: incidents.map((item) => item._id),
    datasets: [{ data: incidents.map((item) => item.count) }]
  };
};

/**
 * Function: Get chart data formatted for a Line Chart
 * Returns counts per day grouped by incident type.
 */
const getLineChartData = async (startDate: Date, endDate: Date) => {
  const incidents = await Incident.aggregate([
    { $match: { openingDate: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$openingDate" } },
          type: "$type"
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.date": 1 } }
  ]);

  const labels = [...new Set(incidents.map((item) => item._id.date))].sort();
  const incidentTypes = [...new Set(incidents.map((item) => item._id.type))];

  const datasets = incidentTypes.map((type) => ({
    label: type,
    data: labels.map((date) => {
      const found = incidents.find((item) => item._id.date === date && item._id.type === type);
      return found ? found.count : 0;
    })
  }));

  return { labels, datasets };
};

/**
 * Function: Get chart data formatted for a Bar Chart
 * Returns counts per incident type across different days.
 */
const getBarChartData = async (startDate: Date, endDate: Date) => {
  const incidents = await Incident.aggregate([
    { $match: { openingDate: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$openingDate" } },
          type: "$type"
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.date": 1 } }
  ]);

  const incidentTypes = [...new Set(incidents.map((item) => item._id.type))];
  const labels = [...new Set(incidents.map((item) => item._id.date))].sort();

  const datasets = labels.map((date) => ({
    label: date,
    data: incidentTypes.map((type) => {
      const found = incidents.find((item) => item._id.date === date && item._id.type === type);
      return found ? found.count : 0;
    })
  }));

  return { labels: incidentTypes, datasets };
};

/**
 * Function: Create a new chart with customized time period.
 */
export const createChart = async (req: Request, res: Response) => {
  try {
    const { userId, name, type, dataType, startDate, endDate } = req.body;

    const missingInputField: string[] = [];
    if (!userId) {
      missingInputField.push('userId');
    } 
    
    if (!name) {
      missingInputField.push('name');
    } 
    
    if (!type) {
      missingInputField.push('type');
    } 
    
    if (!dataType) {
      missingInputField.push('dataType');
    }

    if (missingInputField.length > 0) {
      return res.status(400).json({ message: `Missing required field(s): ${missingInputField.join(', ')}` });
    }

    if (!Object.values(ChartType).includes(type)) {
      return res.status(400).json({ message: `Invalid chart type: ${type}` });
    }

    if (!Object.values(ChartDataType).includes(dataType)) {
      return res.status(400).json({ message: `Invalid data type: ${dataType}` });
    }

    const parsedStartDate = startDate ? new Date(startDate) : new Date();
    const parsedEndDate = endDate ? new Date(endDate) : new Date();

    if (!startDate) {
      parsedStartDate.setDate(parsedEndDate.getDate() - 3);
    }

    if (!endDate) {
      parsedEndDate.setDate(parsedStartDate.getDate() + 3);
    }

    if (parsedStartDate >= parsedEndDate) {
      return res.status(400).json({ message: 'Start date must be before end date.' });
    }

    const newChart: IChart = new Chart({
      userId,
      name,
      type,
      dataType,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
    });

    await newChart.save();

    return res.status(201).json({ message: "Chart saved successfully." });

  } catch (error) {
    console.error('Error creating chart:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

/**
 * Function: Retrieve a saved chart and return data for frontend visualization.
 */
export const getChart = async (req: Request, res: Response) => {
  try {
    const { chartId } = req.params;
    const chart = await Chart.findById(chartId);

    if (!chart) {
      return res.status(404).json({ message: 'Chart not found.' });
    }

    let formattedData;

    switch (chart.type) {
      case "Pie":
        formattedData = await getPieChartData(chart.startDate, chart.endDate);
        break;
      case "Line":
        formattedData = await getLineChartData(chart.startDate, chart.endDate);
        break;
      case "Bar":
        formattedData = await getBarChartData(chart.startDate, chart.endDate);
        break;
      default:
        return res.status(400).json({ message: "Unsupported chart type." });
    }

    return res.json({
      title: chart.name,
      chartType: chart.type,
      labels: formattedData.labels,
      datasets: formattedData.datasets,
      customPeriod: { startDate: chart.startDate, endDate: chart.endDate }
    });

  } catch (error) {
    console.error('Error retrieving chart:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

/**
 * Function: Modify an existing chart's name, type, or date range.
 */
export const modifyChart = async (req: Request, res: Response) => {
  try {
    const { chartId } = req.params;
    const updates = req.body;

    const { name, type, dataType, startDate, endDate } = updates;

    const missingInputField: string[] = [];

    if (!name) {
      missingInputField.push('name');
    }
    if (!type) {
      missingInputField.push('type');
    }
    if (!dataType) {
      missingInputField.push('dataType');
    }

    if (missingInputField.length > 0) {
      return res.status(400).json({ message: `Missing required field(s): ${missingInputField.join(', ')}`
      });
    }

    if (!Object.values(ChartType).includes(type)) {
      return res.status(400).json({ message: `Invalid chart type: ${type}` });
    }

    if (!Object.values(ChartDataType).includes(dataType)) {
      return res.status(400).json({ message: `Invalid data type: ${dataType}` });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (parsedStartDate >= parsedEndDate) {
      return res.status(400).json({ message: 'Start date must be before end date.' });
    }

    const updatedChart = await Chart.findByIdAndUpdate(chartId, updates, { new: true });

    if (!updatedChart) {
      return res.status(404).json({ message: "Chart not found." });
    }

    return res.json({ message: "Chart updated successfully.", chart: updatedChart });

  } catch (error) {
    console.error("Error modifying chart:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

/**
 * Function: Delete a chart by ID.
 */
export const deleteChart = async (req: Request, res: Response) => {
  try {
    const { chartId } = req.params;
    const deletedChart = await Chart.findByIdAndDelete(chartId);

    if (!deletedChart) {
      return res.status(404).json({ message: "Chart not found." });
    }

    return res.json({ message: "Chart deleted successfully." });

  } catch (error) {
    console.error("Error deleting chart:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};
