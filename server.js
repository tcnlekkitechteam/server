const express = require('express');
const morgan = require('morgan');
// const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Feedback = require('./models/feedback.model.js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

// To connect to the database
mongoose.connect(process.env.DATABASE, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
})
    .then(() => console.log('DB connected'))
    .catch(err => console.log('DB CONNECTION ERROR: ', err));

// import routes
const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/auth');

// app middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());

// // To allow all origins in development, or specific origin in production
// if (process.env.NODE_ENV === 'development') {
//     app.use(cors({ origin: process.env.CLIENT_URL }));
// } else {
//     app.use(cors());
// }

// Routes
app.use('/api', authRoutes);
app.use('/api', eventsRoutes);

// Feedback endpoint
app.post('/feedback', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validation: Ensure required fields are provided
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required fields' });
        }

        // Check if a feedback with the given email already exists
        const existingFeedback = await Feedback.findOne({ email });

        if (existingFeedback) {
            return res.status(400).json({ error: 'Feedback with this email already exists' });
        }

        // Save feedback to MongoDB
        const newFeedback = new Feedback({
            name,
            email,
            message,
        });
        await newFeedback.save();

        // Send a response
        return res.status(200).json({ message: 'Feedback received successfully' });
    } catch (error) {
        console.error('Feedback Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/health-check', async (req, res) => {
    return res.status(200).json({
        success: 'Success',
    });
})


app.listen(port, () => {
    console.log(`API is running on port ${port}`);
});







// const express = require('express');
// const morgan = require('morgan');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// require('dotenv').config();

// const app = express();
// const port = process.env.PORT || 8000;

// // To connect to the database
// mongoose.connect(process.env.DATABASE, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
//     .then(() => console.log('DB connected'))
//     .catch(err => console.log('DB CONNECTION ERROR: ', err));

// // import routes
// const authRoutes = require('./routes/auth');

// // app middlewares
// app.use(morgan('dev'));
// app.use(bodyParser.json());

// // To allow all origins in development, or specific origin in production
// if (process.env.NODE_ENV === 'development') {
//     app.use(cors({ origin: process.env.CLIENT_URL }));
// } else {
//     app.use(cors());
// }

// // Routes
// app.use('/api', authRoutes);

// app.listen(port, () => {
//     console.log(`API is running on port ${port}`);
// });

// // Feedback endpoint
// app.post('/feedback', async (req, res) => {
//     try {
//         const { name, email, message } = req.body;

//         // Validation: Ensure required fields are provided
//         if (!name || !email || !message) {
//             return res.status(400).json({ error: 'Name, email, and message are required fields' });
//         }

//         // Save feedback to MongoDB
//         const newFeedback = new Feedback({
//             name,
//             email,
//             message,
//         });
//         await newFeedback.save();

//         // Send a response
//         return res.status(200).json({ message: 'Feedback received successfully' });
//     } catch (error) {
//         console.error('Feedback Error:', error);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// });




// const express = require('express');
// const morgan = require('morgan');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// require('dotenv').config();

// const app = express();

// // To connect to database
// mongoose.connect(process.env.DATABASE, {
  
// }) 
// .then(() => console.log('DB connected'))
// .catch(err => console.log('DB CONNECTION ERROR: ', err));

// // import routes
// const authRoutes = require('./routes/auth');

// // app middlewares
// app.use(morgan('dev'));

// app.use(bodyParser.json());

// // To allow all origins
// app.use(cors()); 
// if (process.env.NODE_ENV === 'development') {
//    app.use(cors({origin: process.env.CLIENT_URL}));
// } else {
//     app.use(cors());
// } 



// // Routes
// app.use('/api', authRoutes);


// const port = process.env.PORT || 8000;
// app.listen(port, () => {
//     console.log(`API is running on port ${port}`);
// });





// const express = require('express');
// const morgan = require('morgan');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// const moment = require('moment'); // Add this line to import moment
// require('dotenv').config();

// const app = express();
// const port = process.env.PORT || 8000;

// // To connect to the database
// mongoose.connect(process.env.DATABASE)
//     .then(() => console.log('DB connected'))
//     .catch(err => console.log('DB CONNECTION ERROR: ', err));

// // import routes
// const authRoutes = require('./routes/auth');

// // app middlewares
// app.use(morgan('dev'));
// app.use(bodyParser.json());

// // To allow all origins in development, or specific origin in production
// if (process.env.NODE_ENV === 'development') {
//     app.use(cors({ origin: process.env.CLIENT_URL }));
// } else {
//     app.use(cors());
// }

// // Routes
// app.use('/api', authRoutes);

// app.listen(port, () => {
//     console.log(`API is running on port ${port}`);
// });


