import React, { useState } from 'react';
import './FrameButton.css'
const FrameButton = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleModal = () => {
        setIsOpen(!isOpen);
    };
    type AppData = {
        icon_type: string,
        icon: string,
        icon_background: string,
        icon_url: string
    }

    return (
        <div>
            <button onClick={toggleModal} className="open-popup-btn">
                打开正方形弹出框
            </button>

            {isOpen && (
                <div className="popup-overlay" onClick={toggleModal}>
                    <div className="popup-container" onClick={(e) => e.stopPropagation()}>
                        <button onClick={toggleModal} className="close-popup-btn">
                            ×
                        </button>
                        <div className="popup-content">
                            <iframe
                                src="https://wfserver.gree.com/Sso/Oauth/Show?appID=0347f117-1b67-46a1-b4ec-a173f7bffa14" // 替换为你想要显示的网页URL
                                title="格力单点登录"
                                className="popup-iframe"
                                frameBorder="0"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FrameButton;