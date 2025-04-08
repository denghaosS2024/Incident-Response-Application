import React, { useEffect, useState } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import styled from "styled-components";
import IChannel from "../models/Channel";
import IUser from "../models/User";
import request from "../utils/request";
import Card from "./Card";

interface ColumnProps {
  title: string;
  subtitle?: string;
  tasks: IUser[];
  id: string;
  groups?: string[];
  onGroupClick?: (groupId: string) => void;
  selectedGroupId?: string | null;
  canDrag?: boolean;
  onGroupDrop?: (groupId: string) => void; // Callback for when a group is dropped
}

const Container = styled.div`
  background-color: #f4f5f7;
  border-radius: 2.5px;
  width: 48%;
  height: 400px;
  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;
  border: 1px solid gray;
`;

const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  background-color: #f4f5f7;
  padding-top: 20px;
  z-index: 10;
`;

const Title = styled.h3`
  margin: 0;
  padding: 8px;
  background-color: #0288d1;
  color: white;
  text-align: center;
`;

const TaskList = styled.div<{ isDraggingOver: boolean }>`
  padding: 3px;
  transition: background-color 0.2s ease;
  background-color: ${({ isDraggingOver }) =>
    isDraggingOver ? "#d3d3d3" : "#f4f5f7"};
  flex-grow: 1;
  min-height: 100px;
  margin: 5px 0;
`;

const PermanentCard = styled.div`
  border-radius: 10px;
  padding: 10px;
  color: white;
  margin: 5px 0;
  background-color: #0288d1;
  text-align: center;
  font-weight: bold;
`;

const GroupCard = styled.div`
  border-radius: 10px;
  padding: 8px;
  margin: 5px 0;
  background-color: #2e7d32;
  color: white;
  text-align: center;
  font-weight: bold;
  cursor: pointer;
`;

const Column: React.FC<ColumnProps> = ({
  title,
  subtitle,
  tasks,
  id,
  onGroupClick,
  canDrag,
  onGroupDrop,
}) => {
  const owner = localStorage.getItem("uid") ?? "";
  const [groups, setGroups] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    request("/api/channels", {
      method: "GET",
    })
      .then((data) => {
        data = data.filter((channel: IChannel) => {
          // show only groups owned by current user
          return (
            channel.name !== "PrivateContact" && channel.owner._id === owner
          );
        });
        setGroups(data);
      })
      .catch((error) => console.error("Error fetching groups:", error));
  }, []);

  return (
    <Container className="column">
      <StickyHeader>
        <Title>{title}</Title>
      </StickyHeader>
      {subtitle && (
        <p style={{ textAlign: "center", fontWeight: "bold" }}>{subtitle}</p>
      )}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <TaskList
            ref={provided.innerRef}
            {...provided.droppableProps}
            isDraggingOver={snapshot.isDraggingOver}
          >
            {/* Add the permanent cards at the top */}
            {id === "1" && (
              <>
                <PermanentCard>Groups</PermanentCard>
                {/* Insert Group Cards here */}
                {groups.map((group, index) => (
                  <Draggable
                    key={group._id}
                    draggableId={`group-${group._id}`}
                    index={index}
                  >
                    {(provided) => (
                      <GroupCard
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() =>
                          onGroupClick ? onGroupClick(group._id) : undefined
                        }
                      >
                        {group.name}
                      </GroupCard>
                    )}
                  </Draggable>
                ))}

                <PermanentCard>Contacts</PermanentCard>
              </>
            )}

            {/* Contacts badge */}
            {tasks.map((task, index) => (
              <Card
                key={task._id}
                index={index}
                task={task}
                canDrag={canDrag}
              />
            ))}
            {provided.placeholder}
          </TaskList>
        )}
      </Droppable>
    </Container>
  );
};

export default Column;
