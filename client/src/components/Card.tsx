import React from "react";
import { DraggableStateSnapshot, DraggableProvided } from "react-beautiful-dnd";
import styled from "styled-components";
import IUser from '@/models/User'
import { Draggable as Draggable1, DraggableProps } from "react-beautiful-dnd";
import { getRoleIcon } from "./common/RoleIcon";

export const Draggable = Draggable1 as React.ComponentClass<DraggableProps>;

// Container styled component with TypeScript types for props
interface ContainerProps {
    $isDragging: boolean;
    $isDraggable: boolean;
    $isBacklog: boolean;
}

const Container = styled.div<ContainerProps>`
    border-radius: 10px;
    padding: 1px;
    color: #000;
    margin: 5px 0;
    height: 10%;
    background-color: ${(props) => bgcolorChange(props)};
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
`;

const TextContent = styled.div``;

const Icons = styled.div`
    display: flex;
    justify-content: end;
    padding: 2px;
`;

function bgcolorChange(props: ContainerProps): string {
    return props.$isDragging
        ? "#0288d1"
        : props.$isDraggable
            ? props.$isBacklog
                ? "#F2D7D5"
                : "#DCDCDC"
            : props.$isBacklog
                ? "#F2D7D5"
                : "#EAF4FC";
}
const placeholder = { undefined }
// Define types for the props of the Card component

interface CardProps {
    task: IUser;
    index: number;
    canDrag?: boolean;
}

const Card: React.FC<CardProps> = ({ task, index, canDrag }) => {
    return (
        <Draggable draggableId={`${task._id}`} key={task._id} index={index} isDragDisabled={!canDrag}>
            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                <Container
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    $isDragging={snapshot.isDragging}
                    $isDraggable={true}
                    $isBacklog={false}
                >
                    <div style={{ display: "flex", justifyContent: "center", padding: 10 }}>
                        {getRoleIcon(task.role)}
                        <TextContent>{task.username}</TextContent>
                    </div>
                </Container>
            )}
        </Draggable>
    );
};

export default Card;
