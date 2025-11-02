import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { updateBoard } from "../store/gameSlice";
import { useAppDispatch } from "../store/hooks";

export const useSocket = (roomKey: string, playerName: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useAppDispatch();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (!roomKey || !playerName) return;

    socketRef.current = io(apiUrl);

    socketRef.current.on("connect", () => {
      setIsConnected(true);

      dispatch(
        updateBoard([
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ])
      );

      socketRef.current?.emit("JOIN_ROOM", { roomKey, playerName });
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
    });

    const handleBeforeUnload = () => {
      socketRef.current?.emit("PLAYER_LEAVING");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      socketRef.current?.emit("PLAYER_LEAVING");
      socketRef.current?.disconnect();
    };
  }, [roomKey, playerName]);

  return { socket: socketRef.current, isConnected };
};
