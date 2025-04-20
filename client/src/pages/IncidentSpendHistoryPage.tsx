import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { ISpending } from "../models/Spending";
import request from "../utils/request";

const IncidentSpendHistory: React.FC = () => {
  const { incidentId } = useParams<{ incidentId: string }>();
  const [totalSpendings, setTotalSpendings] = useState<ISpending[]>([]);

  useEffect(() => {
    // Fetch total spending history for the incident
    const fetchSpendingData = async () => {
      const spendings = await request(
        `/api/spendings/?incidentId=${incidentId}`,
        { method: "GET" },
      );

      setTotalSpendings(spendings);
    };

    fetchSpendingData();
  }, [incidentId]);

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Content */}
      <div className="m-4 bg-white rounded shadow">
        <div className="w-full overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="text-left py-3 px-4 font-normal">Date</th>
                <th className="text-left py-3 px-4 font-normal">Amount</th>
                <th className="text-left py-3 px-4 font-normal">Reason</th>
              </tr>
            </thead>
            <tbody>
              {totalSpendings.map((spending) => (
                <tr key={spending._id} className="border-b border-gray-200">
                  <td className="py-3 px-4">
                    {new Date(spending.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    ${spending.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">{spending.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IncidentSpendHistory;
