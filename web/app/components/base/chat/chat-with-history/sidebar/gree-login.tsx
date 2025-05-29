import React, { useState } from 'react';

const ButtonWithAvatar = () => {
    const [isHovered, setIsHovered] = useState(false);

    // 容器样式
    const containerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '16px', // 增大间距
    };

    // 按钮样式
    const buttonStyle = {
        padding: '10px 24px',
        border: '1px solid none',
        borderRadius: '8px', // 更大的圆角
        backgroundColor: isHovered ? '#f5f5f5' : 'white',
        color: '#333',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        outline: 'none',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)', // 添加轻微阴影
    };

    // 精美头像样式
    const avatarStyle = {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #6e8efb, #a777e3)', // 柔和的渐变背景
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', // 添加阴影增加立体感
        border: '2px solid white', // 白色边框使头像更突出
    };

    // 头像图标容器
    const avatarIconStyle = {
        transform: 'translateY(2px)', // 微调图标位置
    };

    return (
        <button style={buttonStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
            {/* 精美默认头像 */}
            <div style={avatarStyle}>
                <div style={avatarIconStyle}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="white" />
                        <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="white" />
                    </svg>
                </div>
            </div>
            <div>
                未登录
            </div>
        </button>
    );
};

export default ButtonWithAvatar;