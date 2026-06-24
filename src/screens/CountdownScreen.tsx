import { useEffect, useState } from "react";

export function CountdownScreen({ initialSeconds }: { initialSeconds: number }) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setTimeout(() => {
      setSeconds((s) => s - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds]);

  return (
    <div className="countdown-screen">
      <h2 className="countdown-number">{seconds > 0 ? seconds : "GO!"}</h2>
      <p>Get ready!</p>
    </div>
  );
}
