// hooks/useSocket.ts
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (roomKey: string, playerName: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  useEffect(() => {
    if (!roomKey || !playerName) return;

    socketRef.current = io(apiUrl);

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      socketRef.current?.emit("JOIN_ROOM", { roomKey, playerName });
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomKey, playerName]);

  return { socket: socketRef.current, isConnected };
};
