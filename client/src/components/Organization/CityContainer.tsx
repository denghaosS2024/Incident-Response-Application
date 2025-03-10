import React, { useEffect, useState } from 'react';
import request from '../../utils/request';

type ItemType = {
  _id: string;
  name: string;
  assignedCity: string;
};

type DataType = {
  cars: ItemType[];
  trucks: ItemType[];
  personnel: ItemType[];
};

type CityContainerProps = {
  cityName: string;
  refreshTrigger: number;
};

const CityContainer: React.FC<CityContainerProps> = ({ cityName, refreshTrigger }) => {
  const [data, setData] = useState<DataType>({
    cars: [],
    trucks: [],
    personnel: [],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await request<DataType>(`/api/cities/assignments/${cityName}`);
        setData(response);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error fetching city data');
      }
    };

    if (cityName) {
      fetchData();
    }
  }, [cityName, refreshTrigger]);

  const allItems = [...data.cars, ...data.trucks, ...data.personnel];

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ marginTop: '8px' }}>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {allItems.map((item) => (
          <li key={item._id} style={{ padding: '4px 0' }}>
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CityContainer;
