import { Socket } from "socket.io";
import { v4 } from "uuid";

// Define types for userData, session objects, and the session map
interface UserData {
  username: string;
  [key: string]: any; // Allows for additional properties in userData
}

interface Session {
  editors: { [key: string]: any }; // Adjust the structure based on what `editors` contains
  members: { [key: string]: any }; // Adjust the structure based on what `members` contains
  metadata: { [key: string]: any }; // Adjust the structure based on the metadata requirements
}

interface Props {
  socket: Socket;
  sessions: Map<string, Session>;
}

export const RoomFunctions = ({ socket, sessions }: Props) => {
  socket.on("create-room", ({ userData }: { userData: UserData }) => {
    const uuid = v4();
    const session: Session = {
      editors: {},
      members: {},
      metadata: {},
    };
    sessions.set(uuid, session);
    socket.join(uuid);
    socket.emit("created-room", { userData, session });
  });

  socket.on("join-room", ({ roomId, userData }: { roomId: string; userData: UserData }) => {
    const session = sessions.get(roomId);
    if (!session) {
      socket.emit("join-error", { message: "Room Doesn't Exist" });
      return; // Exit early if the room does not exist
    }

    // Update session with new member data
    session.members[userData.username] = userData; // Assuming username is used as a key
    sessions.set(roomId, session); // Update the session in the map
    socket.join(roomId);
    socket.emit("joined-room", { userData, session });
  });
};
