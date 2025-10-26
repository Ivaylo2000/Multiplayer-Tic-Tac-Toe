// hooks/useSocket.ts
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (roomKey: string, playerName: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!roomKey || !playerName) return;

    socketRef.current = io("http://localhost:3000");

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
