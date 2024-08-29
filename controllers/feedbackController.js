const Feedback = require('../models/feedback'); 

exports.submitFeedback = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required fields' });
        }

        const existingFeedback = await Feedback.findOne({ email });

        if (existingFeedback) {
            return res.status(400).json({ error: 'Feedback with this email already exists' });
        }

        const newFeedback = new Feedback({
            name,
            email,
            message,
        });
        await newFeedback.save();

        return res.status(200).json({ message: 'Feedback received successfully' });
    } catch (error) {
        console.error('Feedback Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find(); 
        res.status(200).json({ feedbacks, count: feedbacks.length });
    } catch (error) {
        console.error('GET ALL FEEDBACKS ERROR:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
