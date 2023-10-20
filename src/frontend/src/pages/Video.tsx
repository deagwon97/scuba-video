import React from "react";
import { useLocation } from "react-router-dom";
import './Video.css';


export const Video: React.FC = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const object = queryParams.get('object');
    const videoUrl = `https://scuba-basketball.s3.ap-northeast-1.amazonaws.com/${object}`;
    return (
        <div className="video-container">
            <video controls>
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
}

