import { useEffect, useState } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import IChannel from "../models/Channel";
import IUser from "../models/User";
import { loadFilteredContacts } from "../redux/contactSlice";
import { AppDispatch, RootState } from "../redux/store";
import request from "../utils/request";
import SocketClient from "../utils/Socket";
import Column from "./Column";

export default function Board({
  setUsers,
  canDrag,
  currentGroup, // <-- Add currentGroup prop
}: {
  setUsers: (users: string[]) => void;
  canDrag: boolean;
  currentGroup?: IChannel | null; // <-- Make currentGroup optional
}) {
  const [done, setDone] = useState<IUser[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const { contacts, loading, error } = useSelector(
    (state: RootState) => state.contactState,
  );
  const [todo, setTodo] = useState<IUser[]>([]);
  const [groups, setGroups] = useState<IChannel[]>([]); // Store the groups
  const [colSubtitle, setColSubtitle] = useState<string>("");
  const owner = localStorage.getItem("uid") ?? "";
  const currentUserRole = localStorage.getItem("role") ?? "";

  useEffect(() => {
    dispatch(loadFilteredContacts(currentUserRole));
  }, [dispatch]); // Only dispatch when the component mounts

  useEffect(() => {
    if (contacts.length > 0) {
      const filteredContacts = contacts.filter(
        (contact: IUser) => contact._id !== owner,
      ); // Remove the logged-in user
      setTodo(filteredContacts);
    }
  }, [contacts, owner]);

  useEffect(() => {
    setUsers(done.map((user) => user._id)); // Store ObjectIds, not usernames
  }, [done, setUsers]);

  useEffect(() => {
    // Fetch groups from API
    request("/api/channels", {
      method: "GET",
    })
      .then((data) => {
        setGroups(data);
      })
      .catch((error) => console.error("Error fetching groups:", error));
  }, []);

  useEffect(() => {
    if (currentGroup) {
      const groupUsers = currentGroup.users
        .map((userId: IUser) =>
          contacts.find((contact: IUser) => contact._id === userId._id),
        )
        .filter(Boolean) as IUser[]; // Filter out undefined values

      // Filter out the logged-in user
      const filteredGroupUsers = groupUsers.filter(
        (user) => user._id !== owner,
      );

      // Set the 'done' column with the group's users
      setDone(filteredGroupUsers);

      // Remove the users from the 'todo' column
      setTodo((prevTodo) =>
        prevTodo.filter(
          (user) =>
            !filteredGroupUsers.some((groupUser) => groupUser._id === user._id),
        ),
      );

      const isParticipantOfGroup = currentGroup.users.some(
        (user) => user._id === owner,
      );
      setColSubtitle(isParticipantOfGroup ? "You" : "");
    }
  }, [currentGroup, contacts, owner]); // Re-run when currentGroup or contacts change

  const [forceUpdate, setForceUpdate] = useState(0);

  const fetchGroups = () => {
    request("/api/channels", { method: "GET" })
      .then((data) => {
        console.log("Fetched groups:", data);
        setGroups([...data]);
        setForceUpdate((prev) => prev + 1); // Trigger UI refresh
      })
      .catch((error) => console.error("Error fetching groups:", error));
  };

  useEffect(() => {
    const socket = SocketClient;

    socket.on("updateGroups", () => {
      fetchGroups();
    });

    return () => {
      socket.off("updateGroups");
    };
  }, []);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    if (draggableId.startsWith("group-")) {
      // Handle group card drop
      const groupId = draggableId.slice(6); // Extract group ID from the draggableId
      handleGroupClick(groupId); // This will handle adding users of the group to the 'done' column
      return;
    }

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
    const group = groups.find((group) => group._id === groupId); // Find the selected group
    if (group) {
      const groupUsers = group.users
        .map((userId: IUser) =>
          contacts.find((contact: IUser) => contact._id === userId._id),
        )
        .filter(Boolean) as IUser[]; // Filter out undefined values

      // Create a new filtered array excluding the logged-in user
      const filteredGroupUsers = groupUsers.filter(
        (user) => user._id !== owner,
      );

      // Only move users from the selected group to the 'done' column
      // Update the column with users who are not part of the group
      setTodo((prevTodo) =>
        prevTodo.filter(
          (user) =>
            !filteredGroupUsers.some((groupUser) => groupUser._id === user._id),
        ),
      );

      // Only move the selected group's users to the 'done' column without affecting others in 'done'
      setDone((prevDone) => {
        // Add only users from the group that are not already in 'done'
        const newDoneUsers = filteredGroupUsers.filter(
          (groupUser) =>
            !prevDone.some((doneUser) => doneUser._id === groupUser._id),
        );
        return [...prevDone, ...newDoneUsers];
      });
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd} key={forceUpdate}>
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
            <Column
              title="Drag and Drop Participants"
              tasks={todo}
              id="1"
              groups={groups}
              onGroupClick={handleGroupClick}
              canDrag={true}
            />
            <Column
              title="This Group"
              subtitle={colSubtitle}
              tasks={done}
              id="2"
              canDrag={true}
            />
          </>
        )}
      </div>
    </DragDropContext>
  );
}
