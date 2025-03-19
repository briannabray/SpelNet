// HousingFeed.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './housingFeed.css';

function HousingFeed() {
    const [housingPosts, setHousingPosts] = useState([]);

    useEffect(() => {
        // Fetch housing posts from the API (based on the selected housing location)
        const fetchHousingPosts = async () => {
            try {
                const response = await axios.get('/housing-posts'); // Change this URL to match your API
                setHousingPosts(response.data);
            } catch (error) {
                console.error('Error fetching housing posts:', error);
            }
        };

        fetchHousingPosts();
    }, []);

    return (
        <div className="HousingFeed">
            <h2>Housing Feed</h2>
            {housingPosts.length === 0 ? (
                <p>No posts available.</p>
            ) : (
                <ul>
                    {housingPosts.map((post, index) => (
                        <li key={index}>
                            <h3>{post.title}</h3>
                            <p>{post.content}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default HousingFeed;
