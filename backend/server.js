const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios'); // We need this to send the webhook
const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./jobs.db');

// Create Table
db.run(`CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  taskName TEXT, priority TEXT, status TEXT DEFAULT 'pending', payload TEXT
)`);

// GET Jobs
app.get('/jobs', (req, res) => {
  db.all("SELECT * FROM jobs ORDER BY id DESC", [], (err, rows) => res.json(rows));
});

// POST Job
app.post('/jobs', (req, res) => {
  const { taskName } = req.body;
  db.run("INSERT INTO jobs (taskName, priority) VALUES (?, ?)", [taskName, 'High'], (err) => {
    res.json({ message: "Created" });
  });
});

// RUN Job (With Webhook)
app.post('/run-job/:id', (req, res) => {
  const { id } = req.params;
  
  // 1. Set status to Running
  db.run("UPDATE jobs SET status='running' WHERE id=?", [id]);
  res.json({ message: "Started" });

  // 2. Wait 5 seconds (simulate work)
  setTimeout(() => {
    // 3. Set status to Completed
    db.run("UPDATE jobs SET status='completed' WHERE id=?", [id], () => {
        
        // --- WEBHOOK LOGIC STARTS HERE ---
        // 4. Fetch the job details so we can send them
        db.get("SELECT * FROM jobs WHERE id=?", [id], (err, job) => {
            if (job) {
                
                const WEBHOOK_URL = 'https://webhook.site/fe672f65-67c5-4813-a09f-0b2b439c8ce8'; 
                
                axios.post(WEBHOOK_URL, job)
                    .then(() => console.log(`Webhook sent for job ${id}`))
                    .catch(err => console.error("Webhook failed", err.message));
            }
        });
        // --- WEBHOOK LOGIC ENDS HERE ---

    });
  }, 5000);
});

app.listen(5000, () => console.log("Server running on port 5000"));