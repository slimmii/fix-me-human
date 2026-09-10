import { useEffect, useState } from "react";
import { readOfficeTime, type OfficeClock } from "./officeTime";

export function useOfficeTime(clock: OfficeClock) {
  const [, tick] = useState(0);
  useEffect(() => {
    // Derive from timestamps so throttled tabs and reloads cannot lose time.
    const timer = setInterval(() => tick((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return readOfficeTime(clock);
}
