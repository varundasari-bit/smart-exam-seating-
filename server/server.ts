import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
app.use(express.json());

const DATA_FILE = path.join(process.cwd(), 'data.json');

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({}));
}

app.post('/api/generate-seating', (req, res) => {
  const { branches, rooms, inactiveRolls = [] } = req.body;
  const inactiveSet = new Set(inactiveRolls);

  let branchStudents: string[][] = branches.map((b: any) => {
    const prefix = b.startRoll.match(/^[A-Z]+/)[0];
    const start = parseInt(b.startRoll.match(/\d+/)[0]);
    const end = parseInt(b.endRoll.match(/\d+/)[0]);
    const students = [];
    for (let i = start; i <= end; i++) {
      const roll = `${prefix}${i}`;
      if (!inactiveSet.has(roll)) {
        students.push(roll);
      }
    }
    return students;
  });

  const interleavedStudents = [];
  let hasMore = true;
  let index = 0;
  while (hasMore) {
    hasMore = false;
    for (let i = 0; i < branchStudents.length; i++) {
      if (index < branchStudents[i].length) {
        interleavedStudents.push(branchStudents[i][index]);
        hasMore = true;
      }
    }
    index++;
  }

  const seatingPlan: any = {};
  let studentIdx = 0;

  for (const room of rooms) {
    const capacity = parseInt(room.benchCapacity);
    const totalSeats = 30 * capacity; // Assuming 30 benches per room for safety or dynamic? User said "Fill rooms sequentially"
    // Let's assume a reasonable number of benches per room if not specified, or just fill until students run out.
    // Actually, the prompt says "Move to next room when current room is full". 
    // Usually rooms have a fixed number of benches. Let's assume 20 benches per room for this logic.
    const benchesInRoom = 20; 

    for (let b = 1; b <= benchesInRoom; b++) {
      for (let s = 0; s < capacity; s++) {
        if (studentIdx >= interleavedStudents.length) break;

        const roll = interleavedStudents[studentIdx++];
        const seatLabels = ["Left", "Right", "Middle", "Center-Left", "Center-Right"];
        seatingPlan[roll] = {
          block: room.blockName,
          room: room.roomNumber,
          bench: b,
          seat: seatLabels[s] || `Seat ${s + 1}`
        };
      }
      if (studentIdx >= interleavedStudents.length) break;
    }
    if (studentIdx >= interleavedStudents.length) break;
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(seatingPlan, null, 2));
  res.json({ success: true, count: interleavedStudents.length });
});

app.get('/api/seat/:roll', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const seat = data[req.params.roll];
  if (seat) {
    res.json(seat);
  } else {
    res.status(404).json({ error: 'Roll number not found' });
  }
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => res.sendFile(path.resolve('dist/index.html')));
  }

  app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://0.0.0.0:3000');
  });
}

start();
