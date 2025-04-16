import React, { useEffect, useState } from "react";
import request from "../../utils/request";
// Icons
import { DirectionsCar, FireExtinguisher } from "@mui/icons-material";
import { Draggable } from "react-beautiful-dnd";
import ROLES from "../../utils/Roles";
import getRoleIcon from "../common/RoleIcon";

type ItemType = {
  _id: string;
  name: string;
  assignedCity: string;
  role: null;
};

type PersonnelItem = {
  _id: string;
  name: string;
  assignedCity: string;
  role: ROLES.FIRE | ROLES.POLICE;
};

type DataType = {
  cars: ItemType[];
  trucks: ItemType[];
  personnel: PersonnelItem[];
};

type CityContainerProps = {
  cityName: string;
  refreshTrigger: number;
};

const CityContainer: React.FC<CityContainerProps> = ({
  cityName,
  refreshTrigger,
}) => {
  const [data, setData] = useState<DataType>({
    cars: [],
    trucks: [],
    personnel: [],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await request<DataType>(
        `/api/cities/assignments/${cityName}`,
      );
      setData(response);
      setError(null);
    };

    if (cityName) {
      fetchData();
    }
  }, [cityName, refreshTrigger]);

  const allItems = [
    ...data.cars.map((item) => ({ ...item, type: "car" })),
    ...data.trucks.map((item) => ({ ...item, type: "truck" })),
    ...data.personnel.map((item) => ({ ...item, type: "personnel" })),
  ];

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  return (
    <div style={{ marginTop: "8px" }}>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {allItems.map((item, index) => {
          let icon = null;

          if (item.type === "car") {
            icon = <DirectionsCar color="primary" />;
          } else if (item.type === "truck") {
            icon = <FireExtinguisher color="error" />;
          } else {
            const person = item as PersonnelItem;
            if (person.role === ROLES.FIRE) {
              icon = getRoleIcon(ROLES.FIRE);
            } else if (person.role === ROLES.POLICE) {
              icon = getRoleIcon(ROLES.POLICE);
            } else if (person.role == ROLES.CITY_DIRECTOR) {
              icon = getRoleIcon(ROLES.CITY_DIRECTOR);
            } else if (person.role == ROLES.FIRE_CHIEF) {
              icon = getRoleIcon(ROLES.FIRE_CHIEF);
            } else if (person.role == ROLES.POLICE_CHIEF) {
              icon = getRoleIcon(ROLES.POLICE_CHIEF);
            }
          }

          return (
            <Draggable
              key={item._id}
              draggableId={`${item.type}::${item.name}`}
              index={index}
            >
              {(provided) => (
                <li
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "4px 0",
                    ...provided.draggableProps.style,
                  }}
                >
                  {icon}
                  <span style={{ marginLeft: "8px" }}>{item.name}</span>
                </li>
              )}
            </Draggable>
          );
        })}
      </ul>
    </div>
  );
};

export default CityContainer;
