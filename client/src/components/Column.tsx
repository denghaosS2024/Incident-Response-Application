import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Card from "./Card";
import "../styles/scroll.css";
import { Droppable, DroppableStateSnapshot, DroppableProvided } from "react-beautiful-dnd";
import IUser from '@/models/User'


interface ColumnProps {
    title: string;
    subtitle?: string;
    tasks: IUser[];
    id: string;
    groups?: any[];
    onGroupClick?: (groupId: string) => void;
    selectedGroupId?: string | null;
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

const Title = styled.h3`
    padding: 8px;
    background-color: pink;
    text-align: center;
`;


const TaskList = styled.div`
    padding: 3px;
    transition: background-color 0.2s ease;
    flex-grow: 1;
    min-height: 100px;
    
    &.dragging-over {
        background-color: #d3d3d3;
    }
    
    &:not(.dragging-over) {
        background-color: #f4f5f7;
    }
`;

const PermanentCard = styled.div`
    border-radius: 10px;
    box-shadow: 5px 5px 5px 2px grey;
    padding: 10px;
    color: #000;
    margin-bottom: 8px;
    background-color: #eaf4fc;
    text-align: center;
    font-weight: bold;
`;
const GroupCard = styled.div`
  border-radius: 10px;
  box-shadow: 3px 3px 5px grey;
  padding: 8px;
  margin: 5px 0;
  background-color: lightgreen;
  text-align: center;
  font-weight: bold;
  cursor: pointer;
`;

const Column: React.FC<ColumnProps> = ({ title, subtitle, tasks, id, onGroupClick }) => {
    const [groups, setGroups] = useState<{ _id: string; name: string }[]>([]);
    useEffect(() => {
        // Fetch groups from API
        fetch("/api/channels")
            .then((res) => res.json())
            .then((data) => {
                setGroups(data);
            })
            .catch((error) => console.error("Error fetching groups:", error));
    }, []);

    return (
        <Container className="column">
            <Title
                style={{
                    backgroundColor: "lightblue",
                    position: "sticky",
                    top: "0",
                }}
            >
                {title}
            </Title>
            {subtitle && <p style={{ textAlign: "center", fontWeight: "bold" }}>{subtitle}</p>}
            <Droppable droppableId={id}>
                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                    <TaskList
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={snapshot.isDraggingOver ? "dragging-over" : ""}
                    >
                        {/* Add the permanent cards at the top */}
                        {id === "1" && (
                            <>
                                <PermanentCard>Groups</PermanentCard>
                                {/* Insert Group Cards here */}
                                {groups.map((group) => (
                                    <GroupCard key={group._id} onClick={() => onGroupClick ? onGroupClick?.(group._id) : undefined}  >{group.name}</GroupCard>
                                ))}
                                <PermanentCard>Contacts</PermanentCard>
                            </>
                        )}

                        {/* Contacts badge */}
                        {tasks.map((task, index) => (
                            <Card key={task._id} index={index} task={task} />
                        ))}
                        {provided.placeholder}
                    </TaskList>
                )}
            </Droppable>
        </Container>
    );
};
export default Column;