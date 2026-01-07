import { useState, useEffect } from 'react';
import axios from 'axios';

import './App.css'

function App() {
  const [jobs, setJobs] = useState([]);
  const [taskName, setTaskName] = useState('');

  // Auto-refresh every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      axios.get('https://dotix-job-scheduler.vercel.app/jobs').then(res => setJobs(res.data));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const createJob = () => {
    axios.post('https://dotix-job-scheduler.vercel.app/jobs', { taskName, priority: 'High' })
      .then(() => setTaskName(''));
  };

  const runJob = (id) => {
    axios.post(`https://dotix-job-scheduler.vercel.app/run-job/${id}`);
  };

  return (
    <div className='page'>
      <h1>Job Scheduler</h1>
      <input 
        value={taskName} 
        onChange={e => setTaskName(e.target.value)} 
        placeholder="Enter Task Name" 
      />
      <button onClick={createJob}>Add Job</button>

      <table border="1" style={{ width: '100%', marginTop: 20 }}>
        <thead><tr><th>Task</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          {jobs.map(job => (
            <tr key={job.id}>
              <td>{job.taskName}</td>
              <td style={{ color: job.status === 'completed' ? 'green' : 'orange' }}>
                {job.status}
              </td>
              <td>
                {job.status === 'pending' && (
                  <button onClick={() => runJob(job.id)}>Run Job</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;