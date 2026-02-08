const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const participantsRoutes = require('./routes/participants');
const authenticate = require('./middleware/auth');

// Middleware
app.use(cors());
app.use(express.json());

// Global Auth Middleware (Requirement: "All endpoints needs to be restricted; only the Authenticated Admin user can access the endpoints.")
// Note: It's cleaner to apply to the route group, but app.use(authenticate) works too.
// I'll apply it to the specific routes just to be safe/granular, or here globally. 
// "All endpoints" implies global is fine.
app.use(authenticate);

// Routes
app.use('/participants', participantsRoutes);

// Root Handler for better UX
app.get('/', (req, res) => {
    res.json({ message: 'Census API is running', endpoints: { participants: '/participants' } });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
