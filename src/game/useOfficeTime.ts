import { useEffect, useState } from "react";
import { readOfficeTime, type OfficeClock } from "./officeTime";

export function useOfficeTime(clock: OfficeClock) {
  const [, tick] = useState(0);
  useEffect(() => {
    // The shared clock tracks play time and pauses when the game is hidden.
    const timer = setInterval(() => tick((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return readOfficeTime(clock);
}
