import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import './StarRating.css';

const StarRating = ({ rating, setRating, isInteractive = false, totalRatings = 0 }) => {
    const [hover, setHover] = useState(null);

    const averageRating = typeof rating === 'number' ? rating : 
        (rating && rating.length > 0 ? rating.reduce((acc, r) => acc + r.rating, 0) / rating.length : 0);

    const displayRating = hover || averageRating;

    return (
        <div className="star-rating-container">
            <div className="stars">
                {[...Array(5)].map((star, index) => {
                    const ratingValue = index + 1;
                    return (
                        <label key={index}>
                            {isInteractive && (
                                <input
                                    type="radio"
                                    name="rating"
                                    value={ratingValue}
                                    onClick={() => setRating(ratingValue)}
                                />
                            )}
                            <FaStar
                                className="star"
                                color={ratingValue <= displayRating ? "#ffc107" : "#e4e5e9"}
                                size={isInteractive ? 30 : 20}
                                onMouseEnter={() => isInteractive && setHover(ratingValue)}
                                onMouseLeave={() => isInteractive && setHover(null)}
                                style={{ cursor: isInteractive ? 'pointer' : 'default' }}
                            />
                        </label>
                    );
                })}
            </div>
            {!isInteractive && (
                <span className="rating-text">
                    {averageRating.toFixed(1)} {totalRatings > 0 ? `(${totalRatings} reviews)` : '(No reviews)'}
                </span>
            )}
        </div>
    );
};

export default StarRating;
