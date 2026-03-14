const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet());

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100 // 100 requests per 10 mins
});
app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
const auth = require('./routes/auth');
const upload = require('./routes/upload');
const bookings = require('./routes/bookings');
const chat = require('./routes/chat');
const message = require('./routes/message');
const video = require('./routes/video');
const chatbot = require('./routes/chatbot');
const mentors = require('./routes/mentors');
const admin = require('./routes/admin');
const reviews = require('./routes/reviews');
const stream = require('./routes/stream');
const complaints = require('./routes/complaints');
const assignments = require('./routes/assignments');
const stats = require('./routes/stats');

app.use('/api/auth', auth);
app.use('/api/upload', upload);
app.use('/api/bookings', bookings);
app.use('/api/chat', chat);
app.use('/api/messages', message);
app.use('/api/video', video);
app.use('/api/chatbot', chatbot);
app.use('/api/mentors', mentors);
app.use('/api/admin', admin);
app.use('/api/reviews', reviews);
app.use('/api/stream', stream);
app.use('/api/complaints', complaints);
app.use('/api/assignments', assignments);
app.use('/api/stats', stats);

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handler
const errorHandler = require('./middleware/error');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const initSocket = require('./sockets/index');
initSocket(server);

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
