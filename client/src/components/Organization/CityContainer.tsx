import React, { useEffect, useState } from 'react';
import request from '../../utils/request'; // <-- Update the import path as needed

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
};

const CityContainer: React.FC<CityContainerProps> = ({ cityName }) => {
  const [data, setData] = useState<DataType>({
    cars: [],
    trucks: [],
    personnel: [],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await request<DataType>(`/api/cities/assignments/${cityName}`);
      setData(response);
    };

    if (cityName) {
      fetchData();
    }
  }, [cityName]);


  const allItems = [...data.cars, ...data.trucks, ...data.personnel];

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {allItems.map((item) => (
          <li key={item._id} className="px-4 py-2 hover:bg-gray-50">
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CityContainer;
