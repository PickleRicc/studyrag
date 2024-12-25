import React from 'react';

const Progress = ({ progress, showPulse = false, className = '' }) => {
    return (
        <div className={`progress-container ${className}`}>
            <div 
                className={`progress-bar ${showPulse ? 'with-pulse' : ''}`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin="0"
                aria-valuemax="100"
            />
        </div>
    );
};

export default Progress;
