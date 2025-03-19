// App.js

import React, { useState } from 'react';
import axios from 'axios'; // Import axios for making API requests
import Dashboard from './Dashboard'; // Import Dashboard component for logged-in users
import HousingFeed from './HousingFeed';    
import './App.css'; // Import the CSS file for styling

function App() {
    // ==========================================
    // STATE MANAGEMENT
    // ==========================================
    
    // State variables for user details
    const [name, setName] = useState(''); // Stores the user's name
    const [email, setEmail] = useState(''); // Stores the user's email
    const [password, setPassword] = useState(''); // Stores the user's password
    const [verificationCode, setVerificationCode] = useState(''); // Stores the verification code

    // State variables for managing messages and UI flow
    const [message, setMessage] = useState(''); // Stores messages to show to the user (e.g., errors)
    const [isEmailSent, setIsEmailSent] = useState(false); // Checks if the email for verification was sent
    const [isVerified, setIsVerified] = useState(false); // Tracks whether the user is verified
    const [authMode, setAuthMode] = useState('register'); // Manages which form to show (register or login)

    // ==========================================
    // EVENT HANDLERS
    // ==========================================
    
    // Handles user registration form submission
    const handleRegister = async (e) => {
        e.preventDefault();

        const emailPattern = /@(spelman\.edu|morehouse\.edu)$/; // Validate email domain
        if (!emailPattern.test(email)) {
            setMessage('Email must end with @spelman.edu or @morehouse.edu.');
            return;
        }

        try {
            const response = await axios.post('/register', { name, email, password });
            setMessage(response.data.message || 'Verification code sent to your email!');
            setIsEmailSent(true); // Show verification step after registration
        } catch (error) {
            setMessage('Error during registration: ' + (error.response?.data?.message || error.message));
        }
    };

    // Handles user login form submission
    const handleLogin = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post('/login', { email, password });
            if (response.data.success) {
                setName(response.data.name || 'User'); // Store the name from the response
                setMessage('Login successful!');
                setIsVerified(true); // Skip verification for login and go straight to dashboard
            } else {
                setMessage(response.data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            setMessage('Error during login: ' + (error.response?.data?.message || error.message));
        }
    };

    // Handles email verification step after registration
    const handleVerifyEmail = async () => {
        try {
            const response = await axios.post('/verify', { email, verificationCode });
            setMessage(response.data.message || 'Email verified successfully!');
            if (response.data.success) {
                setIsVerified(true); // Set user as verified and show dashboard
            }
        } catch (error) {
            setMessage('Invalid verification code.');
        }
    };

    // Toggles between login and registration forms
    const toggleAuthMode = () => {
        setAuthMode(authMode === 'register' ? 'login' : 'register');
        setMessage(''); // Clear any error/success messages when switching modes
    };

    // ==========================================
    // RENDER FUNCTIONS (Forms)
    // ==========================================
    
    // Renders the login form
    const renderLoginForm = () => (
        <form onSubmit={handleLogin}>
            <div>
                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Login</button>
        </form>
    );

    // Renders the registration form
    const renderRegistrationForm = () => (
        <form onSubmit={handleRegister}>
            <div>
                <label>Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Register</button>
        </form>
    );

    // Renders the email verification form
    const renderVerificationForm = () => (
        <div>
            <h2>Verify Your Email</h2>
            <label>Enter Verification Code</label>
            <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
            />
            <button onClick={handleVerifyEmail}>Verify</button>
        </div>
    );

    // ==========================================
    // MAIN RENDER FUNCTION
    // ==========================================
    
    return (
        <div className="App">
            {/* Conditional rendering: show forms or dashboard */}
            {!isVerified ? (
                <>
                    <h1>Welcome</h1>
                    {isEmailSent ? renderVerificationForm() : (
                        <>
                            <div className="auth-tabs">
                                <button
                                    className={authMode === 'register' ? 'active' : ''}
                                    onClick={() => setAuthMode('register')}
                                >
                                    Register
                                </button>
                                <button
                                    className={authMode === 'login' ? 'active' : ''}
                                    onClick={() => setAuthMode('login')}
                                >
                                    Login
                                </button>
                            </div>
                            {authMode === 'register' ? renderRegistrationForm() : renderLoginForm()}
                        </>
                    )}
                </>
            ) : (
                <Dashboard
                    name={name}
                    email={email}
                    onLogout={() => setIsVerified(false)} // Logout function
                />
            )}
            {/* Display any messages like success, error, etc. */}
            {message && <p>{message}</p>}
        </div>
    );
}

export default App;
