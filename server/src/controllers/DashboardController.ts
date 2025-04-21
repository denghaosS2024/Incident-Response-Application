import { Request, Response } from "express";
import Chart, {
  ChartDataType,
  ChartType,
  IChart,
  IncidentTypeLabelMap,
} from "../models/Dashboard";
import Incident from "../models/Incident";
import Message from "../models/Message";
import Patient from "../models/Patient";
import User from "../models/User"; // assuming default export

async function getUserRoleMap(usernames: string[]): Promise<Record<string, string>> {
  const users = await User.find({ username: { $in: usernames } }).select("username role");
  const map: Record<string, string> = {};
  users.forEach((user) => {
    map[user.username] = user.role;
  });
  return map;
}

/**
 * Function: Get chart data formatted for a Pie Chart
 * Returns total counts per label (Incident Type).
 */
export async function getPieChartData(
  dataType: ChartDataType,
  startDate: Date,
  endDate: Date,
)
{
  switch (dataType) {
    case ChartDataType.IncidentType:
      return await Incident.aggregate([
        { $match: { openingDate: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]).then((results) => ({
        labels: results.map((item) => item._id),
        datasets: [{ data: results.map((item) => item.count) }],
      }));

    case ChartDataType.IncidentPriority:
      return await Incident.aggregate([
        { $match: { openingDate: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]).then((results) => ({
        labels: results.map((item) => item._id),
        datasets: [{ data: results.map((item) => item.count) }],
      }));

    case ChartDataType.IncidentState:
      return await Incident.aggregate([
        { $match: { openingDate: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: "$incidentState", count: { $sum: 1 } } },
      ]).then((results) => ({
        labels: results.map((item) => item._id),
        datasets: [{ data: results.map((item) => item.count) }],
      }));

      case ChartDataType.IncidentDuration:
        return await Incident.aggregate([
          {
            $match: {
              closingDate: { $exists: true },
              openingDate: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $project: {
              durationMinutes: {
                $divide: [
                  { $subtract: ["$closingDate", "$openingDate"] },
                  1000 * 60 // convert ms to minutes
                ]
              }
            }
          },
          {
            $bucket: {
              groupBy: "$durationMinutes",
              boundaries: [0, 10, 30, 100000], // arbitrary upper limit
              default: "Unknown",
              output: {
                count: { $sum: 1 }
              }
            }
          }
        ]).then(results => {
          const labels = ["Less than 10 min", "10–30 min", "More than 30 min"];
          const buckets = [0, 0, 0];
      
          results.forEach(bucket => {
            if (bucket._id < 10) buckets[0] = bucket.count;
            else if (bucket._id < 30) buckets[1] = bucket.count;
            else buckets[2] = bucket.count;
          });
      
          return {
            labels,
            datasets: [{ data: buckets }]
          };
        });
      


        case ChartDataType.IncidentResources: {
          const incidents = await Incident.find({
            openingDate: { $gte: startDate, $lte: endDate },
          }).lean();
        
          const allUsernames = new Set<string>();
          const commanders = new Set<string>();
          let carCount = 0;
          let truckCount = 0;
        
          for (const incident of incidents) {
            if (incident.commander) commanders.add(incident.commander);
            for (const v of incident.assignedVehicles || []) {
              if (v.usernames) v.usernames.forEach((u) => allUsernames.add(u));
              if (v.type === "Car") carCount++;
              if (v.type === "Truck") truckCount++;
            }
          }
        
          const roleMap = await getUserRoleMap(Array.from(allUsernames));
        
          let policeCount = 0;
          let fireCount = 0;
        
          Object.values(roleMap).forEach((role) => {
            if (role.includes("Police")) policeCount++;
            if (role.includes("Fire")) fireCount++;
          });
        
          return {
            labels: ["Commanders", "Police Officers", "Firefighters", "Cars", "Trucks"],
            datasets: [
              {
                data: [
                  commanders.size,
                  policeCount,
                  fireCount,
                  carCount,
                  truckCount,
                ],
              },
            ],
          };
        }
        

    case ChartDataType.PatientLocation:
      return await Patient.aggregate([
        { $unwind: "$visitLog" },
        {
          $match: {
            "visitLog.dateTime": { $gte: startDate, $lte: endDate },
            "visitLog.location": { $in: ["Road", "ER"] },
          },
        },
        { $group: { _id: "$visitLog.location", count: { $sum: 1 } } },
      ]).then((results) => ({
        labels: results.map((item) => item._id),
        datasets: [{ data: results.map((item) => item.count) }],
      }));

      case ChartDataType.SARTasks:
        return await Incident.aggregate([
          {
            $match: {
              type: "S",
              openingDate: { $gte: startDate, $lte: endDate },
              sarTasks: { $exists: true, $ne: [] }
            }
          },
          { $unwind: "$sarTasks" },
          {
            $group: {
              _id: "$sarTasks.state",
              count: { $sum: 1 }
            }
          }
        ]).then((results) => ({
          labels: results.map((item) => item._id),
          datasets: [{ data: results.map((item) => item.count) }]
        }));
      

        case ChartDataType.SARVictims: {
          const categories = ["Immediate", "Urgent", "Could Wait", "Dismiss", "Deceased"];
          const totals = new Array(5).fill(0);
        
          const incidents = await Incident.find({
            type: "S",
            openingDate: { $gte: startDate, $lte: endDate },
            sarTasks: { $exists: true, $ne: [] },
          }).lean();
        
          for (const incident of incidents) {
            for (const task of incident.sarTasks || []) {
              (task.victims || []).forEach((count, idx) => {
                if (typeof count === "number") totals[idx] += count;
              });
            }
          }
        
          return {
            labels: categories,
            datasets: [{ data: totals }],
          };
        }
        

    case ChartDataType.FirePoliceAlerts:
      return await Message.aggregate([
        {
          $match: {
            isAlert: true,
            timestamp: { $gte: startDate, $lte: endDate },
          },
        },
        { $group: { _id: "$content", count: { $sum: 1 } } },
      ]).then((results) => ({
        labels: results.map((item) => item._id),
        datasets: [{ data: results.map((item) => item.count) }],
      }));

    case ChartDataType.AlertAcknowledgmentTime:
      return await Message.aggregate([
        {
          $match: {
            isAlert: true,
            timestamp: { $gte: startDate, $lte: endDate },
            acknowledgedAt: { $exists: true, $not: { $size: 0 } },
          },
        },
        {
          $project: {
            duration: {
              $subtract: [
                { $arrayElemAt: ["$acknowledgedAt", 0] },
                "$timestamp",
              ],
            },
          },
        },
        {
          $bucket: {
            groupBy: "$duration",
            boundaries: [0, 60000, 300000, 86400000],
            default: "More than 5 min",
            output: { count: { $sum: 1 } },
          },
        },
      ]).then((results) => ({
        labels: ["<1 min", "1-5 min", ">5 min"],
        datasets: [{ data: results.map((item) => item.count) }],
      }));

    default:
      return { labels: [], datasets: [] };
  }
};

/**
 * Function: Get chart data formatted for a Line Chart
 * Returns counts per day grouped by incident type.
 */
export async function getLineChartData(
  dataType: ChartDataType,
  startDate: Date,
  endDate: Date,
){
  switch (dataType) {
    // -------------------------------------
    // 1) IncidentType
    case ChartDataType.IncidentType: {
      const incidents = await Incident.aggregate([
        { $match: { openingDate: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$openingDate" },
              },
              type: "$type",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]);

      const labels = [...new Set(incidents.map((i) => i._id.date))].sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
      );
      const types = [...new Set(incidents.map((i) => i._id.type))];

      const datasets = types.map((t) => ({
        label: IncidentTypeLabelMap[t] || t,
        data: labels.map((date) => {
          const found = incidents.find(
            (x) => x._id.date === date && x._id.type === t,
          );
          return found ? found.count : 0;
        }),
      }));

      return { labels, datasets };
    }

    // -------------------------------------
    // 2) IncidentPriority
    case ChartDataType.IncidentPriority: {
      const incidents = await Incident.aggregate([
        { $match: { openingDate: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$openingDate" },
              },
              priority: "$priority",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]);

      const labels = [...new Set(incidents.map((i) => i._id.date))].sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
      );
      const priorities = [...new Set(incidents.map((i) => i._id.priority))];

      const datasets = priorities.map((p) => ({
        label: p,
        data: labels.map((date) => {
          const found = incidents.find(
            (x) => x._id.date === date && x._id.priority === p,
          );
          return found ? found.count : 0;
        }),
      }));

      return { labels, datasets };
    }

    // -------------------------------------
    // 3) IncidentState
    case ChartDataType.IncidentState: {
      const incidents = await Incident.aggregate([
        { $match: { openingDate: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$openingDate" },
              },
              state: "$incidentState",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]);

      const labels = [...new Set(incidents.map((i) => i._id.date))].sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
      );
      const states = [...new Set(incidents.map((i) => i._id.state))];

      const datasets = states.map((s) => ({
        label: s,
        data: labels.map((date) => {
          const found = incidents.find(
            (x) => x._id.date === date && x._id.state === s,
          );
          return found ? found.count : 0;
        }),
      }));

      return { labels, datasets };
    }

    case ChartDataType.IncidentDuration: {
      const incidents = await Incident.aggregate([
        {
          $match: {
            closingDate: { $exists: true },
            openingDate: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $project: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$openingDate" } },
            durationMinutes: {
              $divide: [
                { $subtract: ["$closingDate", "$openingDate"] },
                1000 * 60 // convert ms to minutes
              ]
            }
          }
        },
        {
          $addFields: {
            durationCategory: {
              $switch: {
                branches: [
                  { case: { $lt: ["$durationMinutes", 10] }, then: "Less than 10 min" },
                  { case: { $lt: ["$durationMinutes", 30] }, then: "10–30 min" }
                ],
                default: "More than 30 min"
              }
            }
          }
        },
        {
          $group: {
            _id: {
              date: "$date",
              category: "$durationCategory"
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.date": 1 } }
      ]);
    
      const labels = [...new Set(incidents.map(i => i._id.date))].sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );
      const categories = ["Less than 10 min", "10–30 min", "More than 30 min"];
    
      const datasets = categories.map((c) => ({
        label: c,
        data: labels.map((date) => {
          const found = incidents.find(
            (x) => x._id.date === date && x._id.category === c
          );
          return found ? found.count : 0;
        })
      }));
    
      return { labels, datasets };
    }
    

    // -------------------------------------
    // 4) IncidentResources (Line: each category vs. date)
    case ChartDataType.IncidentResources: {
      const incidents = await Incident.find({
        openingDate: { $gte: startDate, $lte: endDate },
      }).lean();
    
      const grouped: Record<string, {
        commanders: Set<string>,
        users: Set<string>,
        cars: number,
        trucks: number
      }> = {};
    
      for (const incident of incidents) {
        const dateStr = new Date(incident.openingDate).toISOString().split("T")[0];
        if (!grouped[dateStr]) grouped[dateStr] = {
          commanders: new Set(),
          users: new Set(),
          cars: 0,
          trucks: 0
        };
    
        if (incident.commander) grouped[dateStr].commanders.add(incident.commander);
    
        for (const v of incident.assignedVehicles || []) {
          if (v.type === "Car") grouped[dateStr].cars++;
          if (v.type === "Truck") grouped[dateStr].trucks++;
          v.usernames?.forEach(u => grouped[dateStr].users.add(u));
        }
      }
    
      const allUsernames = Array.from(new Set(Object.values(grouped).flatMap(g => Array.from(g.users))));
      const roleMap = await getUserRoleMap(allUsernames);
    
      const labels = Object.keys(grouped).sort();
      const datasets = ["Commanders", "Police Officers", "Firefighters", "Cars", "Trucks"].map(label => ({
        label,
        data: labels.map(date => {
          const g = grouped[date];
          if (label === "Commanders") return g.commanders.size;
          if (label === "Cars") return g.cars;
          if (label === "Trucks") return g.trucks;
    
          let count = 0;
          for (const user of g.users) {
            if (label === "Police Officers" && roleMap[user]?.includes("Police")) count++;
            if (label === "Firefighters" && roleMap[user]?.includes("Fire")) count++;
          }
          return count;
        })
      }));
    
      return { labels, datasets };
    }
    

    // -------------------------------------
    // 5) PatientLocation
    case ChartDataType.PatientLocation: {
      // group by date + location
      const visits = await Patient.aggregate([
        { $unwind: "$visitLog" },
        {
          $match: {
            "visitLog.dateTime": { $gte: startDate, $lte: endDate },
            "visitLog.location": { $in: ["Road", "ER"] },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$visitLog.dateTime",
                },
              },
              location: "$visitLog.location",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]);

      const labels = [...new Set(visits.map((v) => v._id.date))].sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
      );
      const locs = [...new Set(visits.map((v) => v._id.location))];

      const datasets = locs.map((loc) => ({
        label: loc,
        data: labels.map((date) => {
          const found = visits.find(
            (x) => x._id.date === date && x._id.location === loc,
          );
          return found ? found.count : 0;
        }),
      }));

      return { labels, datasets };
    }

    // -------------------------------------
    // 6) SARTasks
    case ChartDataType.SARTasks:
      return await Incident.aggregate([
        {
          $match: {
            type: "S",
            openingDate: { $gte: startDate, $lte: endDate },
            sarTasks: { $exists: true, $ne: [] }
          }
        },
        { $unwind: "$sarTasks" },
        {
          $project: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$sarTasks.startDate" }
            },
            state: "$sarTasks.state"
          }
        },
        {
          $group: {
            _id: { date: "$date", state: "$state" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.date": 1 } }
      ]).then(results => {
        const labels = [...new Set(results.map(r => r._id.date))];
        const states = ["Todo", "InProgress", "Done"];

        const datasets = states.map(state => ({
          label: state,
          data: labels.map(date => {
            const match = results.find(r => r._id.date === date && r._id.state === state);
            return match ? match.count : 0;
          })
        }));

        return { labels, datasets };
      });


    // -------------------------------------
    // 7) SARVictims
    case ChartDataType.SARVictims: {
      const incidents = await Incident.find({
        type: "S",
        openingDate: { $gte: startDate, $lte: endDate },
        sarTasks: { $exists: true, $ne: [] },
      }).lean();

      const categories = [
        "Immediate",
        "Urgent",
        "Could Wait",
        "Dismiss",
        "Deceased",
      ];
      const dateMap: Record<string, number[]> = {};

      incidents.forEach((incident) => {
        incident.sarTasks?.forEach((task) => {
          if (!task.startDate || !Array.isArray(task.victims)) return;
          const date = new Date(task.startDate).toISOString().split("T")[0];
          if (!dateMap[date]) dateMap[date] = [0, 0, 0, 0, 0];

          task.victims.forEach((count, idx) => {
            if (typeof count === "number") {
              dateMap[date][idx] += count;
            }
          });
        });
      });

      const labels = Object.keys(dateMap).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
      );
      const datasets = categories.map((label, idx) => ({
        label,
        data: labels.map((d) => dateMap[d][idx] || 0),
      }));

      return { labels, datasets };
    }

    // -------------------------------------
    // 8) FirePoliceAlerts
    case ChartDataType.FirePoliceAlerts: {
      const alerts = await Message.aggregate([
        {
          $match: {
            isAlert: true,
            timestamp: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
              },
              content: "$content",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]);

      const labels = [...new Set(alerts.map((a) => a._id.date))].sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
      );
      const contents = [...new Set(alerts.map((a) => a._id.content))];

      const datasets = contents.map((c) => ({
        label: c,
        data: labels.map((date) => {
          const found = alerts.find(
            (x) => x._id.date === date && x._id.content === c,
          );
          return found ? found.count : 0;
        }),
      }));

      return { labels, datasets };
    }

    // -------------------------------------
    // 9) AlertAcknowledgmentTime
    case ChartDataType.AlertAcknowledgmentTime: {
      const raw = await Message.aggregate([
        {
          $match: {
            isAlert: true,
            timestamp: { $gte: startDate, $lte: endDate },
            acknowledgedAt: { $exists: true, $not: { $size: 0 } },
          },
        },
        {
          $project: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            duration: {
              $subtract: [
                { $arrayElemAt: ["$acknowledgedAt", 0] },
                "$timestamp",
              ],
            },
          },
        },
      ]);

      // We'll store dateMap => date: { '<1 min': number, '1-5 min': number, '>5 min': number }
      const dateMap: Record<string, Record<string, number>> = {};
      const categories = ["<1 min", "1-5 min", ">5 min"];

      raw.forEach((doc) => {
        const date = doc.date;
        let cat;
        if (doc.duration < 60000) cat = "<1 min";
        else if (doc.duration < 300000) cat = "1-5 min";
        else cat = ">5 min";

        if (!dateMap[date])
          dateMap[date] = { "<1 min": 0, "1-5 min": 0, ">5 min": 0 };
        dateMap[date][cat] += 1;
      });

      const labels = Object.keys(dateMap).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
      );
      const datasets = categories.map((cat) => ({
        label: cat,
        data: labels.map((d) => dateMap[d][cat] || 0),
      }));

      return { labels, datasets };
    }

    default:
      return { labels: [], datasets: [] };
  }
};

/**
 * Function: Get chart data formatted for a Bar Chart
 * Returns counts per incident type across different days.
 */
export async function getBarChartData(
  dataType: ChartDataType,
  startDate: Date,
  endDate: Date,
) {
  switch (dataType) {
    /* ----------------------------------------------------------------
       INCIDENT TYPE
       e.g. 'Fire', 'Police', 'Medical', 'SAR'
    ---------------------------------------------------------------- */
    case ChartDataType.IncidentType: {
      const agg = await Incident.aggregate([
        { $match: { openingDate: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$openingDate",
                },
              },
              type: "$type",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]);

      // Unique categories (incident types) in sorted order
      const categories = [...new Set(agg.map((x) => x._id.type))].sort((a, b) =>
        a.localeCompare(b),
      );
      // Unique dates in sorted order
      const dates = [...new Set(agg.map((x) => x._id.date))].sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
      );

      // Build datasets array
      const datasets = dates.map((dateStr) => ({
        label: dateStr,
        // For each category in the same order as 'categories'
        data: categories.map((cat) => {
          const found = agg.find(
            (a) => a._id.date === dateStr && a._id.type === cat,
          );
          return found ? found.count : 0;
        }),
      }));

      return { labels: categories, datasets };
    }

    /* ----------------------------------------------------------------
       INCIDENT PRIORITY
       e.g. 'E', 'One', 'Two', 'Three'
    ---------------------------------------------------------------- */
    case ChartDataType.IncidentPriority: {
      const agg = await Incident.aggregate([
        { $match: { openingDate: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$openingDate",
                },
              },
              priority: "$priority",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]);

      const categories = [...new Set(agg.map((x) => x._id.priority))].sort(
        (a, b) => a.localeCompare(b),
      );
      const dates = [...new Set(agg.map((x) => x._id.date))].sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
      );

      const datasets = dates.map((dateStr) => ({
        label: dateStr,
        data: categories.map((cat) => {
          const found = agg.find(
            (a) => a._id.date === dateStr && a._id.priority === cat,
          );
          return found ? found.count : 0;
        }),
      }));

      return { labels: categories, datasets };
    }

    /* ----------------------------------------------------------------
       INCIDENT STATE
       e.g. 'Waiting', 'Triage', 'Assigned', 'Closed'
    ---------------------------------------------------------------- */
    case ChartDataType.IncidentState: {
      const agg = await Incident.aggregate([
        { $match: { openingDate: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$openingDate",
                },
              },
              state: "$incidentState",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]);

      const categories = [...new Set(agg.map((x) => x._id.state))].sort(
        (a, b) => a.localeCompare(b),
      );
      const dates = [...new Set(agg.map((x) => x._id.date))].sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
      );

      const datasets = dates.map((dateStr) => ({
        label: dateStr,
        data: categories.map((cat) => {
          const found = agg.find(
            (a) => a._id.date === dateStr && a._id.state === cat,
          );
          return found ? found.count : 0;
        }),
      }));

      return { labels: categories, datasets };
    }

    case ChartDataType.IncidentDuration: {
      const agg = await Incident.aggregate([
        {
          $match: {
            closingDate: { $exists: true },
            openingDate: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $project: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$openingDate" } },
            durationMinutes: {
              $divide: [
                { $subtract: ["$closingDate", "$openingDate"] },
                1000 * 60 // ms to minutes
              ]
            }
          }
        },
        {
          $addFields: {
            durationCategory: {
              $switch: {
                branches: [
                  { case: { $lt: ["$durationMinutes", 10] }, then: "Less than 10 min" },
                  { case: { $lt: ["$durationMinutes", 30] }, then: "10–30 min" }
                ],
                default: "More than 30 min"
              }
            }
          }
        },
        {
          $group: {
            _id: {
              date: "$date",
              category: "$durationCategory"
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.date": 1 } }
      ]);
    
      const categories = ["Less than 10 min", "10–30 min", "More than 30 min"];
      const dates = [...new Set(agg.map((x) => x._id.date))].sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );
    
      const datasets = dates.map((dateStr) => ({
        label: dateStr,
        data: categories.map((cat) => {
          const found = agg.find(
            (a) => a._id.date === dateStr && a._id.category === cat
          );
          return found ? found.count : 0;
        })
      }));
    
      return { labels: categories, datasets };
    }
    

    /* ----------------------------------------------------------------
       SAR TASKS
       e.g. For 'S' incidents, group by incidentState
    ---------------------------------------------------------------- */
    case ChartDataType.SARTasks:
      return await Incident.aggregate([
        {
          $match: {
            type: "S",
            openingDate: { $gte: startDate, $lte: endDate },
            sarTasks: { $exists: true, $ne: [] }
          }
        },
        { $unwind: "$sarTasks" },
        {
          $project: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$sarTasks.startDate" }
            },
            state: "$sarTasks.state"
          }
        },
        {
          $group: {
            _id: { date: "$date", state: "$state" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.date": 1 } }
      ]).then(results => {
      const dates = [...new Set(results.map(r => r._id.date))];
      const states = ["Todo", "InProgress", "Done"];

      const datasets = dates.map(date => ({
        label: date,
        data: states.map(state => {
          const match = results.find(r => r._id.date === date && r._id.state === state);
          return match ? match.count : 0;
        })
      }));

      return {
        labels: states,
        datasets
      };
  });


    /* ----------------------------------------------------------------
       SAR VICTIMS
       We'll gather from 'incident.sarTasks'
    ---------------------------------------------------------------- */
    case ChartDataType.SARVictims: {
      // categories = [ 'Immediate', 'Urgent', 'Could Wait', 'Dismiss', 'Deceased' ]
      const categories = [
        "Immediate",
        "Urgent",
        "Could Wait",
        "Dismiss",
        "Deceased",
      ];
      const incidents = await Incident.find({
        type: "S",
        openingDate: { $gte: startDate, $lte: endDate },
        sarTasks: { $exists: true, $ne: [] },
      }).lean();

      // We'll store date => [immediateCount, urgentCount, couldWaitCount, dismissCount, deceasedCount]
      const dateMap: Record<string, number[]> = {};

      incidents.forEach((inc) => {
        inc.sarTasks?.forEach((task) => {
          if (!task.startDate || !Array.isArray(task.victims)) return;
          const dateStr = new Date(task.startDate).toISOString().split("T")[0];
          if (!dateMap[dateStr]) dateMap[dateStr] = [0, 0, 0, 0, 0];

          task.victims.forEach((count, idx) => {
            if (typeof count === "number") {
              dateMap[dateStr][idx] += count;
            }
          });
        });
      });

      // Build sorted list of dates
      const dates = Object.keys(dateMap).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
      );

      // Build datasets array
      const datasets = dates.map((dateStr) => ({
        label: dateStr,
        data: dateMap[dateStr],
      }));

      return { labels: categories, datasets };
    }

    /* ----------------------------------------------------------------
       PATIENT LOCATION
       e.g. 'Road', 'ER'
    ---------------------------------------------------------------- */
    case ChartDataType.PatientLocation: {
      const agg = await Patient.aggregate([
        { $unwind: "$visitLog" },
        {
          $match: {
            "visitLog.dateTime": { $gte: startDate, $lte: endDate },
            "visitLog.location": { $in: ["Road", "ER"] },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$visitLog.dateTime",
                },
              },
              loc: "$visitLog.location",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]);

      const categories = [...new Set(agg.map((x) => x._id.loc))].sort((a, b) =>
        a.localeCompare(b),
      );
      const dates = [...new Set(agg.map((x) => x._id.date))].sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
      );

      const datasets = dates.map((dateStr) => ({
        label: dateStr,
        data: categories.map((cat) => {
          const found = agg.find(
            (a) => a._id.date === dateStr && a._id.loc === cat,
          );
          return found ? found.count : 0;
        }),
      }));

      return { labels: categories, datasets };
    }

    /* ----------------------------------------------------------------
       FIRE / POLICE ALERTS
       group by date + content
    ---------------------------------------------------------------- */
    case ChartDataType.FirePoliceAlerts: {
      const agg = await Message.aggregate([
        {
          $match: {
            isAlert: true,
            timestamp: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$timestamp",
                },
              },
              content: "$content",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]);

      const categories = [...new Set(agg.map((x) => x._id.content))].sort(
        (a, b) => a.localeCompare(b),
      );
      const dates = [...new Set(agg.map((x) => x._id.date))].sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
      );

      const datasets = dates.map((dateStr) => ({
        label: dateStr,
        data: categories.map((cat) => {
          const found = agg.find(
            (a) => a._id.date === dateStr && a._id.content === cat,
          );
          return found ? found.count : 0;
        }),
      }));

      return { labels: categories, datasets };
    }

    case ChartDataType.IncidentResources: {
      const incidents = await Incident.find({
        openingDate: { $gte: startDate, $lte: endDate },
      }).lean();
    
      const grouped: Record<string, {
        commanders: Set<string>,
        users: Set<string>,
        cars: number,
        trucks: number
      }> = {};
    
      for (const incident of incidents) {
        const dateStr = new Date(incident.openingDate).toISOString().split("T")[0];
        if (!grouped[dateStr]) grouped[dateStr] = {
          commanders: new Set(),
          users: new Set(),
          cars: 0,
          trucks: 0
        };
    
        if (incident.commander) grouped[dateStr].commanders.add(incident.commander);
    
        for (const v of incident.assignedVehicles || []) {
          if (v.type === "Car") grouped[dateStr].cars++;
          if (v.type === "Truck") grouped[dateStr].trucks++;
          v.usernames?.forEach(u => grouped[dateStr].users.add(u));
        }
      }
    
      const allUsernames = Array.from(new Set(Object.values(grouped).flatMap(g => Array.from(g.users))));
      const roleMap = await getUserRoleMap(allUsernames);
    
      const dates = Object.keys(grouped).sort();
      const categories = ["Commanders", "Police Officers", "Firefighters", "Cars", "Trucks"];
    
      const datasets = dates.map(date => {
        const g = grouped[date];
        let police = 0, fire = 0;
        for (const user of g.users) {
          if (roleMap[user]?.includes("Police")) police++;
          if (roleMap[user]?.includes("Fire")) fire++;
        }
    
        return {
          label: date,
          data: [
            g.commanders.size,
            police,
            fire,
            g.cars,
            g.trucks,
          ]
        };
      });
    
      return {
        labels: categories,
        datasets
      };
    }
    

    /* ----------------------------------------------------------------
       ALERT ACKNOWLEDGMENT TIME
       we group by date, then <1 min, 1-5 min, >5 min
    ---------------------------------------------------------------- */
    case ChartDataType.AlertAcknowledgmentTime: {
      // We'll gather in memory and group by date + timeRange
      const raw = await Message.aggregate([
        {
          $match: {
            isAlert: true,
            timestamp: { $gte: startDate, $lte: endDate },
            acknowledgedAt: { $exists: true, $not: { $size: 0 } },
          },
        },
        {
          $project: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
            },
            duration: {
              $subtract: [
                { $arrayElemAt: ["$acknowledgedAt", 0] },
                "$timestamp",
              ],
            },
          },
        },
      ]);

      // categories = [ '<1 min', '1-5 min', '>5 min' ]
      const categories = ["<1 min", "1-5 min", ">5 min"];
      const dateMap: Record<string, number[]> = {};

      raw.forEach((doc) => {
        const dateStr = doc.date;
        let idx = 2; // assume '>5 min'
        if (doc.duration < 60000) idx = 0;
        else if (doc.duration < 300000) idx = 1;

        if (!dateMap[dateStr]) dateMap[dateStr] = [0, 0, 0];
        dateMap[dateStr][idx] += 1;
      });

      const dates = Object.keys(dateMap).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
      );
      const datasets = dates.map((dateStr) => ({
        label: dateStr,
        data: dateMap[dateStr],
      }));

      return { labels: categories, datasets };
    }

    default:
      // Return empty in case of unknown data type
      return { labels: [], datasets: [] };
  }
}

/**
 * Function: Create a new chart with customized time period.
 */
export const createChart = async (req: Request, res: Response) => {
  try {
    const { userId, name, type, dataType, startDate, endDate } = req.body;

    const missingInputField: string[] = [];
    if (!userId) missingInputField.push("userId");
    if (!name) missingInputField.push("name");
    if (!type) missingInputField.push("type");
    if (!dataType) missingInputField.push("dataType");

    if (missingInputField.length > 0) {
      return res.status(400).json({
        message: `Missing required field(s): ${missingInputField.join(", ")}`,
      });
    }

    if (!Object.values(ChartType).includes(type)) {
      return res.status(400).json({ message: `Invalid chart type: ${type}` });
    }

    if (!Object.values(ChartDataType).includes(dataType)) {
      return res
        .status(400)
        .json({ message: `Invalid data type: ${dataType}` });
    }

    const parsedStartDate = startDate ? new Date(startDate) : new Date();
    const parsedEndDate = endDate ? new Date(endDate) : new Date();

    if (!startDate) parsedStartDate.setDate(parsedEndDate.getDate() - 3);
    if (!endDate) parsedEndDate.setDate(parsedStartDate.getDate() + 3);

    if (parsedStartDate >= parsedEndDate) {
      return res
        .status(400)
        .json({ message: "Start date must be before end date." });
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
    console.error("Error creating chart:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
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
      return res.status(404).json({ message: "Chart not found." });
    }

    let formattedData;

    switch (chart.type) {
      case "Pie":
        formattedData = await getPieChartData(
          chart.dataType,
          chart.startDate,
          chart.endDate,
        );
        break;
      case "Line":
        formattedData = await getLineChartData(
          chart.dataType,
          chart.startDate,
          chart.endDate,
        );
        break;
      case "Bar":
        formattedData = await getBarChartData(
          chart.dataType,
          chart.startDate,
          chart.endDate,
        );
        break;
      default:
        return res.status(400).json({ message: "Unsupported chart type." });
    }

    return res.json({
      title: chart.name,
      chartType: chart.type,
      labels: formattedData.labels,
      dataType: chart.dataType,
      datasets: formattedData.datasets,
      customPeriod: { startDate: chart.startDate, endDate: chart.endDate },
    });
  } catch (error) {
    console.error("Error retrieving chart:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

/**
 * Function: Retrieve all saved charts for a user.
 */
export const getCharts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const charts = await Chart.find({ userId });

    return res.json({ charts });
  } catch (error) {
    console.error("Error retrieving charts:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
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
    if (!name) missingInputField.push("name");
    if (!type) missingInputField.push("type");
    if (!dataType) missingInputField.push("dataType");

    if (missingInputField.length > 0) {
      return res.status(400).json({
        message: `Missing required field(s): ${missingInputField.join(", ")}`,
      });
    }

    if (!Object.values(ChartType).includes(type)) {
      return res.status(400).json({ message: `Invalid chart type: ${type}` });
    }

    if (!Object.values(ChartDataType).includes(dataType)) {
      return res
        .status(400)
        .json({ message: `Invalid data type: ${dataType}` });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (parsedStartDate >= parsedEndDate) {
      return res
        .status(400)
        .json({ message: "Start date must be before end date." });
    }

    const updatedChart = await Chart.findByIdAndUpdate(chartId, updates, {
      new: true,
    });

    if (!updatedChart) {
      return res.status(404).json({ message: "Chart not found." });
    }

    return res.json({
      message: "Chart updated successfully.",
      chart: updatedChart,
    });
  } catch (error) {
    console.error("Error modifying chart:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
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
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};
