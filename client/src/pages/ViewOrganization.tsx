import React, { useCallback, useEffect, useState } from 'react';
import CityAssignmentsContainer from '../components/Organization/CityAssignmentsContainer';

// Interfaces
interface Vehicle {
  _id: string;
  name: string;
  assignedCity: string;
}

interface Personnel {
  _id: string;
  name: string;
  assignedCity: string;
  role: 'Fire' | 'Police';
  assignedVehicleTimestamp?: string;
  assignedCar?: string;
  assignedTruck?: string;
}

interface CityAssignment {
  cars: Vehicle[];
  trucks: Vehicle[];
  personnel: Personnel[];
}

interface City {
  _id: string;
  name: string;
}

const ViewOrganization: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [assignments, setAssignments] = useState<{ [key: string]: CityAssignment }>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch all cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('/api/cities');
        if (!response.ok) throw new Error('Failed to fetch cities');
        const data: City[] = await response.json();
        setCities(data);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };

    fetchCities();
  }, []);

  // Fetch assignments for each city
  const fetchAssignments = useCallback(async () => {
    if (cities.length === 0) return;
    setLoading(true);

    try {
      const assignmentData: { [key: string]: CityAssignment } = {};
      await Promise.all(
        cities.map(async (city) => {
          try {
            const response = await fetch(`/api/cities/assignments/${encodeURIComponent(city.name)}`);
            if (!response.ok) throw new Error(`Failed to fetch assignments for ${city.name}`);
            const cityAssignment: CityAssignment = await response.json();
            assignmentData[city.name] = cityAssignment;
          } catch (error) {
            console.error(`Error fetching assignments for ${city.name}:`, error);
          }
        })
      );

      setAssignments(assignmentData);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  }, [cities]);

  // Fetch assignments when cities change
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {cities.map((city) => (
        <CityAssignmentsContainer
          key={city._id}
          cityName={city.name}
          data={assignments[city.name] || { cars: [], trucks: [], personnel: [] }}
          refreshData={fetchAssignments} // Pass optimized refresh function
        />
      ))}
    </div>
  );
};

export default ViewOrganization;
