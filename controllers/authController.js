const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, dob, phoneNumber, bio, interests, languages, location, occupation, about, socialLinks } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const newUser = new User( { username, email, password, fullName, dob, phoneNumber, bio, interests, languages, location, occupation, about, socialLinks });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
   
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
   
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '6h' }
      );
   
      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          dob: user.dob,
          phoneNumber: user.phoneNumber,
          bio: user.bio,
          interests: user.interests,
          languages: user.languages,
          location: user.location,
          occupation: user.occupation,
          about: user.about,
          socialLinks: user.socialLinks,
          profilePicture: user.profilePicture
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  };
  