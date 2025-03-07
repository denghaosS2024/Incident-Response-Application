import React, { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import Column from "./Column";
import { useDispatch, useSelector } from "react-redux";
import { loadContacts, loadMockContacts } from "../features/contactSlice";
import { AppDispatch } from "../app/store";
import { RootState } from "../utils/types";
import IUser from '@/models/User'

export default function Board({ setUsers,
    setGroupName, 
    setDescription, 
  }: {
    setUsers: (users: string[]) => void;
    setGroupName: (name: string) => void; // Declare setGroupName as a prop
    setDescription: (description: string) => void; // Declare setDescription as a prop
  }) {
    const [done, setDone] = useState<IUser[]>([]);
    const dispatch = useDispatch<AppDispatch>();
    const { contacts, loading, error } = useSelector((state: RootState) => state.contactState);
    const [todo, setTodo] = useState<IUser[]>([]);
    const [groups, setGroups] = useState<any[]>([]); // Store the groups

    useEffect(() => {
        dispatch(loadMockContacts());  // Dispatch loadContacts to get data
    }, [dispatch]);  // Only dispatch when the component mounts
    
    useEffect(() => {
        if (contacts.length > 0) {
            setTodo(contacts);  // Sync contacts with local state when contacts changes
        }
    }, [contacts]);

    useEffect(() => {
        setUsers(done.map(user => user._id)); // Store ObjectIds, not usernames
    }, [done, setUsers]);
    
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
            setGroupName(group.name); // This will update the group name field in the form
            setDescription(group.description || ''); // Set the group description if available, or empty string if none

            const groupUsers = group.users.map((userId: IUser) => {
                // Fetch the user by ID from the contacts list
                return contacts.find(contact => contact._id === userId._id); 
            }).filter(Boolean); // Filter out undefined if the user is not found
            
            // Remove users from "Drag and Drop Participants" column (todo) and add them to "This Group" column (done)
            const updatedTodo = todo.filter(user => !groupUsers.some((groupUser: IUser) => groupUser._id === user._id));
            setTodo(updatedTodo);
            // Update the 'This Group' column with the users from the selected group
            setDone(groupUsers);
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
                        <Column title="Drag and Drop Participants" tasks={todo} id="1" groups={groups} onGroupClick={handleGroupClick}/>
                        <Column title="This Group" subtitle="You" tasks={done} id="2"/>
                    </>
                )}
            </div>
        </DragDropContext>
    );
}