// Import required modules
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const app = express();
app.use(express.json());

// Serve static files from React build folder
app.use(express.static(path.join(__dirname, '../client/build')));

// ========================================================
// Authentication Routes using Supabase Auth
// ========================================================

// Registration endpoint using Supabase Auth
app.post('/register', async (req, res) => {
    const { name, email, password, username, school, year, housing_location } = req.body;
    console.log(`Received registration request for email: ${email}`);

    // Email validation (ensure only Spelman and Morehouse emails are allowed)
    const emailPattern = /@(spelman\.edu|morehouse\.edu)$/;
    if (!emailPattern.test(email)) {
        return res.status(400).json({ success: false, message: 'Email must end with @spelman.edu or @morehouse.edu.' });
    }

    try {
        // Step 1: Register user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } } // Store additional user info
        });

        if (error) throw error;

        const user = data.user; // Get the created user

        // Step 2: Store user profile in `profile` table
        const { error: profileError } = await supabase.from("profile").insert([
            {
                id: user.id, // Use auth user ID
                username,
                school,
                year,
                housing_location,
            },
        ]);

        if (profileError) throw profileError;

        res.json({ success: true, message: 'Registration successful. Check your email for verification.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: error.message || 'Error registering user' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Received login request for email: ${email}`);

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        res.json({ success: true, message: 'Login successful', user: data.user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
});

// ✅ Get user profile by ID
app.get('/profile/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase.from("profile").select("*").eq("id", id).single();

        if (error) throw error;

        res.json({ success: true, profile: data });
    } catch (error) {
        res.status(404).json({ success: false, message: "Profile not found" });
    }
});

// ✅ Update user profile
app.put('/profile/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const { error } = await supabase.from("profile").update(updates).eq("id", id);

        if (error) throw error;

        res.json({ success: true, message: "Profile updated successfully!" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Email verification using 6-digit code
app.post('/verify', async (req, res) => {
    const { email, verificationCode } = req.body;
    console.log(`Verifying email: ${email} with code: ${verificationCode}`);

    try {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: verificationCode,
            type: 'signup'
        });

        if (error) {
            console.error('Verification failed:', error);
            return res.status(400).json({ success: false, message: 'Invalid verification code.' });
        }

        res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ success: false, message: 'Error verifying email' });
    }
});

// Fallback route to serve React frontend for any unmatched routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

