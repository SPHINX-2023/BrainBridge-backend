const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors')


const app = express();
const PORT = process.env.PORT || 8000;



// Connect to MongoDB
mongoose.connect('mongodb+srv://simranyadav464:7JngErgDPMs5OYRZ@cluster0.agzriqc.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

// Define a schema for hash codes
const hashCodeSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true
  }
});
const scoreSchema = new mongoose.Schema({
    value: {
      type: Number,
      required: true
    }
  });
  
  // Create a model for hash codes
  const HashCode = mongoose.model('HashCode', hashCodeSchema);
  const Score = mongoose.model('Score', scoreSchema);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route to handle POST requests for adding hash codes
app.post('/hashCodes', async (req, res) => {
  try {
    const { hash } = req.body;
    if (!hash) {
      return res.status(400).json({ error: 'Hash code is required' });
    }

    // Create a new hash code document
    const newHashCode = new HashCode({ hash });
    // Save the hash code to the database
    await newHashCode.save();
    

    return res.status(201).json({ message: 'Hash code stored successfully' });
  } catch (error) {
    console.error('Error storing hash code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/hashCodes', async (req, res) => {
    try {
      // Retrieve all hash codes from the database
      const hashCodes = await HashCode.find({}, { _id: 0, __v: 0 });
  
      return res.status(200).json(hashCodes);
    } catch (error) {
      console.error('Error retrieving hash codes:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  let score = 10;

  app.post('/score', async (req, res) => {
    try {
      const { newScore } = req.body;
  
      if (newScore === undefined || typeof newScore !== 'number' || !Number.isInteger(newScore)) {
        return res.status(400).json({ error: 'Invalid score format. Score must be an integer.' });
      }
  
      score -= newScore;
  
      const newScoreEntry = new Score({ value: score });
      await newScoreEntry.save();
  
      if(score<=0){
        score=10;
      }
      return res.status(200).json({ score });
      
    } catch (error) {
      console.error('Error updating score:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
  });
  
  // Route to retrieve the current score
  app.get('/score', async (req, res) => {
    try {
      // Retrieve the latest score from the database
      const latestScoreEntry = await Score.findOne().sort({ _id: -1 });
      const latestScore = latestScoreEntry ? latestScoreEntry.value : 0;
  
      return res.status(200).json({ score: latestScore });
    } catch (error) {
      console.error('Error retrieving score:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
