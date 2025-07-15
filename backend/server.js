const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({origin: '*'}));
app.use(express.json());

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
