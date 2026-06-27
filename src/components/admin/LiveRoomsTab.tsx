import { useState, useEffect } from "react";
import { Server, Users, Play, Clock, RefreshCw } from "lucide-react";
import { Button } from "../ui/Button";

export function LiveRoomsTab({ token, serverUrl }: { token: string; serverUrl: string }) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${serverUrl}/api/admin/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    const int = setInterval(fetchRooms, 15000);
    return () => clearInterval(int);
  }, [token, serverUrl]);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Server className="w-5 h-5 text-indigo-400" />
          Live Rooms
        </h3>
        <Button variant="outline" size="sm" onClick={fetchRooms}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.length === 0 && !loading && (
          <div className="col-span-full p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500">
            No active rooms at the moment.
          </div>
        )}
        
        {rooms.map(room => (
          <div key={room.roomCode} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">Room Code</div>
                <div className="text-2xl font-black text-slate-100">{room.roomCode}</div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                room.status === 'waiting' ? 'bg-amber-500/20 text-amber-400' :
                room.status === 'finished' ? 'bg-slate-700 text-slate-400' :
                'bg-emerald-500/20 text-emerald-400'
              }`}>
                {room.status.toUpperCase()}
              </span>
            </div>
            
            <div className="text-slate-300 font-medium truncate" title={room.quizTitle}>
              Quiz: {room.quizTitle || "Untitled"}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {room.playerCount} Players
              </div>
              <div className="flex items-center gap-1">
                <Play className="w-4 h-4" />
                Q: {room.currentQuestionIndex + 1}
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <Clock className="w-3 h-3" />
              Created {new Date(room.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
