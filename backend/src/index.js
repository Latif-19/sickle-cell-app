import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './config/supabase.js';
import { userService } from './services/userService.js';
import { quizService } from './services/quizService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Root Landing Route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Sickle Cell App — Backend API</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #fdfcfa; color: #1c1b1f; padding: 40px; display: flex; justify-content: center; align-items: center; min-height: 80vh; margin: 0; }
        .card { background: white; border: 1px solid #e0e0e0; border-radius: 24px; padding: 36px; max-width: 520px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
        .badge { display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: bold; margin-bottom: 16px; }
        h1 { margin: 0 0 10px; font-size: 24px; color: #1c1b1f; }
        p { color: #5f6368; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
        .btn { display: inline-block; background: #006a63; color: white; text-decoration: none; padding: 14px 28px; border-radius: 999px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 14px rgba(0,106,99,0.3); }
        .btn:hover { background: #00504b; }
        .footer { margin-top: 24px; font-size: 12px; color: #9aa0a6; }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">● Backend Server Online</span>
        <h1>Sickle Cell App API (Port 5000)</h1>
        <p>This is the Express API backend connected to your Supabase PostgreSQL database. The web application interface runs on port <strong>5173</strong>.</p>
        <a class="btn" href="http://localhost:5173">👉 Launch Web App (http://localhost:5173)</a>
        <div class="footer">API Health endpoint: <a href="/api/health" style="color: #006a63;">/api/health</a></div>
      </div>
    </body>
    </html>
  `);
});

// Health Check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Sickle Cell Awareness App Backend',
    supabaseConnected: Boolean(supabase),
    timestamp: new Date().toISOString()
  });
});

// User routes
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const updated = await userService.updateUserProfile(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Quiz Score routes
app.post('/api/quiz/scores', async (req, res) => {
  try {
    const record = await quizService.recordScore(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/quiz/scores/user/:userId', async (req, res) => {
  try {
    const scores = await quizService.getUserScores(req.params.userId);
    res.json({ success: true, data: scores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/quiz/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await quizService.getLeaderboard(limit);
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Sickle Cell App Backend server running on http://localhost:${PORT}`);
  console.log(`📡 Supabase connection initialized: ${supabase ? 'Yes' : 'No (Pending .env configuration)'}`);
});
