import React, { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import Column from "./Column";
import { useDispatch, useSelector } from "react-redux";
import { loadContacts } from "../features/contactSlice";
import { AppDispatch } from "@/app/store";
import { RootState } from "@/utils/types";
import IUser from '@/models/User'
import IChannel from "@/models/Channel";

export default function Board({
    setUsers,
    onGroupClick,
    triggerResetBoard,
    canDrag,
}: {
    setUsers: (users: string[]) => void;
    onGroupClick: (group: IChannel) => void;  // handle parent component on click logic
    triggerResetBoard: number;
    canDrag: boolean;
}) {
    const [done, setDone] = useState<IUser[]>([]);
    const dispatch = useDispatch<AppDispatch>();
    const { contacts, loading, error } = useSelector((state: RootState) => state.contactState);
    const [todo, setTodo] = useState<IUser[]>([]);
    const [groups, setGroups] = useState<any[]>([]); // Store the groups
    const owner = localStorage.getItem('uid') || ''
    useEffect(() => {
        // dispatch(loadMockContacts());
        dispatch(loadContacts());
    }, [dispatch]);  // Only dispatch when the component mounts

    useEffect(() => {
        if (contacts.length > 0) {
            const filteredContacts = contacts.filter(contact => contact._id !== owner); // Remove the logged-in user
            setTodo(filteredContacts);
        }
    }, [contacts, owner]);

    useEffect(() => {
        setUsers(done.map(user => user._id)); // Store ObjectIds, not usernames
    }, [done, setUsers]);

    useEffect(() => {
        console.log('[Board] triggerResetBoard - reset contact list')
        if (contacts.length > 0) {
            const filteredContacts = contacts.filter(contact => contact._id !== owner); // Remove the logged-in user
            setTodo(filteredContacts);
            setDone([]);
        }
    }, [triggerResetBoard]);

    useEffect(() => {
        // Fetch groups from API
        fetch("/api/channels")
            .then((res) => res.json())
            .then((data) => {
                setGroups(data);
            })
            .catch((error) => console.error("Error fetching groups:", error));
    }, []);

    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination || source.droppableId === destination.droppableId) return;

        const task = findItemById(String(draggableId), [...todo, ...done]); // Ensure ID is a string

        if (!task) return; // Prevent errors if the task is not found

        deletePreviousState(source.droppableId, draggableId);
        setNewState(destination.droppableId, task);
    };


    function deletePreviousState(sourceDroppableId: string, taskId: string) {
        switch (sourceDroppableId) {
            case "1":
                setTodo((prev) => prev.filter((item) => item._id !== taskId)); // Use functional update
                break;
            case "2":
                setDone((prev) => prev.filter((item) => item._id !== taskId)); // Use functional update
                break;
        }
    }

    function setNewState(destinationDroppableId: string, task: IUser) {
        switch (destinationDroppableId) {
            case "1": // TO DO
                setTodo((prev) => [...prev, task]); // Use previous state
                break;
            case "2": // DONE
                setDone((prev) => [...prev, task]); // Use previous state
                break;
        }
    }

    function findItemById(id: string, array: IUser[]) {
        return array.find((item) => String(item._id) === String(id)); // Ensure both are strings
    }

    const handleGroupClick = (groupId: string) => {
        const group = groups.find(group => group._id === groupId); // Find the selected group
        if (group) {
            onGroupClick(group);

            const groupUsers = group.users
                .map((userId: IUser) => contacts.find(contact => contact._id === userId._id))
                .filter(Boolean) as IUser[]; // Filter out undefined values

            // Create a new filtered array excluding the logged-in user
            const filteredGroupUsers = groupUsers.filter(user => user._id !== owner);

            // Reset: Move all users from 'done' back to 'todo'
            setTodo(prevTodo => [...prevTodo, ...done]);
            setDone([]);

            // Move the selected group's users to the 'done' column
            setTodo(prevTodo => prevTodo.filter(user => !filteredGroupUsers.some(groupUser => groupUser._id === user._id)));
            setDone(filteredGroupUsers);
        }
    };





    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "95%",
                    margin: "auto",
                }}
            >
                {loading && <p>Loading contacts...</p>}
                {error && <p>Error: {error}</p>}
                {!loading && !error && (
                    <>
                        <Column title="Drag and Drop Participants" tasks={todo} id="1" groups={groups} onGroupClick={handleGroupClick} canDrag={canDrag} />
                        <Column title="This Group" subtitle="You" tasks={done} id="2" canDrag={canDrag} />
                    </>
                )}
            </div>
        </DragDropContext>
    );
}
