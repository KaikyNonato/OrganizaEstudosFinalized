import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { connectDB } from './db/conectDB.js';

import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import matterRoutes from './routes/matter.route.js';
import subjectRoutes from './routes/subject.route.js';
import timeLineRoutes from './routes/timeLine.route.js';



dotenv.config();

const app = express();
app.set('trust proxy', 1)
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'https://organizaestudos-net.onrender.com';

app.use(cors({ origin: CLIENT_URL, credentials: true }));

app.use(express.json());
app.use(cookieParser());


app.get('/', (req, res) => {
    res.send('API is running');
});

//ROTAS
app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/matter", matterRoutes)
app.use("/api/subject", subjectRoutes)
app.use("/api/timeline", timeLineRoutes)





//DATABASE
app.listen(PORT, () => {
    connectDB();
    console.log('Server is running on port:', PORT);
});
