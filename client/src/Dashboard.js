// Dashboard.js
import './Dashboard.css';

import React from 'react';
import HousingFeed from './HousingFeed'; // Import HousingFeed component

function Dashboard({ name, email, onLogout }) {
    return (
        <div className="Dashboard">
            <h1>Welcome, {name}</h1>
            <p>Email: {email}</p>
            <button onClick={onLogout}>Logout</button>
            
            {/* Housing feed based on selected location */}
            <HousingFeed />
        </div>
    );
}

export default Dashboard;
