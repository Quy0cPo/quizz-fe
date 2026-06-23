export function HomeScreen({ onNavigateGenerate, onNavigateRooms }: { onNavigateGenerate: () => void; onNavigateRooms: () => void }) {
  return (
    <div className="screen-stack">
      <p className="muted">Welcome! Choose an option to start.</p>
      <button className="primary-button" onClick={onNavigateGenerate}>
        Generate New Quiz
      </button>
      <button className="secondary-button" onClick={onNavigateRooms}>
        Rooms (Create / Join)
      </button>
    </div>
  );
}
