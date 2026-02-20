import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Get the initial connection state
    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected ?? true);
    });

    // Subscribe to connection changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { isOnline };
}