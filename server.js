const express = require('express');
const app = express();
const cors = require('cors'); 
const PORT = 3001;

app.use(cors());
app.use(express.json());
 
// Data 
app.get('/api/listings', (req, res) => {
  res.json("Final Phase");
});

app.listen(PORT, () => {
  console.log(`Server is on http://localhost:${PORT}`);
});