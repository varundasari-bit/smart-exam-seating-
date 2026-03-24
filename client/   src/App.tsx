import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Search, Layout, Users, DoorOpen, CheckCircle2, AlertCircle } from 'lucide-react';

interface Branch {
  name: string;
  startRoll: string;
  endRoll: string;
}

interface Room {
  blockName: string;
  roomNumber: string;
  benchCapacity: string;
}

interface SeatInfo {
  block: string;
  room: string;
  bench: number;
  seat: string;
}

export default function App() {
  const [view, setView] = useState<'admin' | 'student'>('student');
  const [branches, setBranches] = useState<Branch[]>([{ name: 'CSE', startRoll: 'CS3201', endRoll: 'CS3300' }]);
  const [rooms, setRooms] = useState<Room[]>([{ blockName: 'A', roomNumber: '101', benchCapacity: '2' }]);
  const [rollQuery, setRollQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SeatInfo | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const addBranch = () => setBranches([...branches, { name: '', startRoll: '', endRoll: '' }]);
  const removeBranch = (index: number) => setBranches(branches.filter((_, i) => i !== index));
  const updateBranch = (index: number, field: keyof Branch, value: string) => {
    const newBranches = [...branches];
    newBranches[index][field] = value;
    setBranches(newBranches);
  };

  const addRoom = () => setRooms([...rooms, { blockName: '', roomNumber: '', benchCapacity: '2' }]);
  const removeRoom = (index: number) => setRooms(rooms.filter((_, i) => i !== index));
  const updateRoom = (index: number, field: keyof Room, value: string) => {
    const newRooms = [...rooms];
    newRooms[index][field] = value;
    setRooms(newRooms);
  };

  const generatePlan = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/generate-seating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branches, rooms }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Successfully generated seating for ${data.count} students.`);
      } else {
        setError('Failed to generate seating plan.');
      }
    } catch (err) {
      setError('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  const searchSeat = async () => {
    setError('');
    setSearchResult(null);
    if (!rollQuery) return;
    try {
      const res = await fetch(`/api/seat/${rollQuery.toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResult(data);
      } else {
        setError('Roll number not found in the current seating plan.');
      }
    } catch (err) {
      setError('Error searching for seat.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Layout className="text-indigo-600 w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight">SmartExam <span className="text-indigo-600">Pro</span></h1>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setView('student')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'student' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Student Portal
          </button>
          <button
            onClick={() => setView('admin')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'admin' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Admin Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {view === 'admin' ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 p-2 rounded-lg">
                      <Users className="text-indigo-600 w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold">Branch Configuration</h2>
                  </div>
                  <button
                    onClick={addBranch}
                    className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Branch
                  </button>
                </div>

                <div className="space-y-4">
                  {branches.map((branch, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch Name</label>
                        <input
                          value={branch.name}
                          onChange={(e) => updateBranch(idx, 'name', e.target.value)}
                          placeholder="e.g. CSE"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Roll</label>
                        <input
                          value={branch.startRoll}
                          onChange={(e) => updateBranch(idx, 'startRoll', e.target.value)}
                          placeholder="CS3201"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">End Roll</label>
                        <input
                          value={branch.endRoll}
                          onChange={(e) => updateBranch(idx, 'endRoll', e.target.value)}
                          placeholder="CS3300"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <button
                        onClick={() => removeBranch(idx)}
                        className="h-10 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 p-2 rounded-lg">
                      <DoorOpen className="text-emerald-600 w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold">Room Allocation</h2>
                  </div>
                  <button
                    onClick={addRoom}
                    className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Room
                  </button>
                </div>

                <div className="space-y-4">
                  {rooms.map((room, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Block</label>
                        <input
                          value={room.blockName}
                          onChange={(e) => updateRoom(idx, 'blockName', e.target.value)}
                          placeholder="A"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Room No</label>
                        <input
                          value={room.roomNumber}
                          onChange={(e) => updateRoom(idx, 'roomNumber', e.target.value)}
                          placeholder="101"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bench Cap</label>
                        <select
                          value={room.benchCapacity}
                          onChange={(e) => updateRoom(idx, 'benchCapacity', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                          <option value="1">1 Student</option>
                          <option value="2">2 Students</option>
                          <option value="3">3 Students</option>
                          <option value="4">4 Students</option>
                        </select>
                      </div>
                      <button
                        onClick={() => removeRoom(idx)}
                        className="h-10 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex flex-col items-center gap-4 py-4">
                <button
                  onClick={generatePlan}
                  disabled={loading}
                  className="w-full md:w-64 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? 'Generating...' : 'Generate Seating Plan'}
                </button>
                {success && (
                  <div className="flex items-center gap-2 text-emerald-600 font-medium bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4" /> {success}
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 text-rose-600 font-medium bg-rose-50 px-4 py-2 rounded-full border border-rose-100">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="student"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-md mx-auto pt-12"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Find Your Seat</h2>
                <p className="text-slate-500">Enter your roll number to view allocation</p>
              </div>

              <div className="relative group">
                <input
                  value={rollQuery}
                  onChange={(e) => setRollQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchSeat()}
                  placeholder="Enter Roll Number (e.g. CS3201)"
                  className="w-full bg-white border-2 border-slate-200 rounded-2xl px-6 py-5 text-lg font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all pr-16"
                />
                <button
                  onClick={searchSeat}
                  className="absolute right-3 top-3 bottom-3 aspect-square bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-colors"
                >
                  <Search className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-center font-medium"
                >
                  {error}
                </motion.div>
              )}

              {searchResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-10 bg-white rounded-3xl p-8 shadow-xl shadow-indigo-100 border border-slate-100 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50" />
                  
                  <div className="relative space-y-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Roll Number</p>
                        <h3 className="text-2xl font-black text-slate-900">{rollQuery.toUpperCase()}</h3>
                      </div>
                      <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                        Confirmed
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Block</p>
                        <p className="text-xl font-bold text-slate-800">{searchResult.block} Block</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Room</p>
                        <p className="text-xl font-bold text-slate-800">{searchResult.room}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bench</p>
                        <p className="text-xl font-bold text-slate-800">No. {searchResult.bench}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Position</p>
                        <p className="text-xl font-bold text-indigo-600">{searchResult.seat}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
