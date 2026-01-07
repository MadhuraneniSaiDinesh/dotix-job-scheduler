const express = require('express');
const app = express();

app.use(express.json());

// 1. Enable CORS Manually (Allows your Frontend to talk to this Backend)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow ANY frontend
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// 2. Memory Storage (Temporary array instead of a Database file)
// This ensures it works instantly for your assignment video on Vercel.
let jobs = [
  { id: 1, taskName: "Test Job (Default)", status: "pending" }
];

// GET Route - Show all jobs
app.get('/jobs', (req, res) => {
  res.json(jobs);
});

// POST Route - Add a new job
app.post('/jobs', (req, res) => {
  const { taskName } = req.body;
  const newJob = { 
    id: Date.now(), 
    taskName: taskName || "New Task", 
    status: "pending" 
  };
  jobs.push(newJob); // Save to memory
  console.log("Job Added:", newJob);
  res.json(newJob);
});

// POST Route - Run/Complete a job
app.post('/run-job/:id', (req, res) => {
    const jobId = parseInt(req.params.id);
    const job = jobs.find(j => j.id === jobId);
    if (job) {
        job.status = 'completed';
        res.json(job);
    } else {
        res.status(404).json({ message: "Job not found" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));