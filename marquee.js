const marqueeConfig = {
    // Chữ chạy phía trên (màu vàng) – hỗ trợ nhiều câu luân phiên
    topMarquee: {
        texts: [
            "Ở khu vực Bắc Bộ và Bắc Trung Bộ phổ biến không mưa, đêm và sáng trời rét, vùng núi Bắc Bộ có nơi rét đậm.",
            "Vùng núi cao của Bắc Bộ đề phòng khả năng xảy ra sương muối.",
            "Nhiệt độ thấp nhất trong đợt không khí lạnh này ở khu vực Bắc Bộ và Bắc Trung Bộ phổ biến từ 12-15 độ, vùng núi Bắc Bộ 10-12 độ, vùng núi cao có nơi dưới 10 độ."
        ],
        color: "#FFFF00",
        fontSize: "35px",
        speed: 220, // Tốc độ chạy chữ
        pauseBetween: 2000, // Thời gian dừng giữa các câu (ms)
        enabled: false
    },  
    // Chữ chạy phía dưới (màu đỏ) – giữ nguyên
    bottomMarquee: {
        text: "Hãy cùng nhau chủ động phòng chống bão, lũ... giữ an toàn cho gia đình và cộng đồng!",
        color: "#FF0000",
        fontSize: "35px",
        speed: 15,
        enabled: true
    }
};

// KHỞI TẠO CHỮ CHẠY
function initMarquee() {
    // === XỬ LÝ DÒNG TRÊN: nhiều câu, chạy luân phiên ===
    if (marqueeConfig.topMarquee.enabled && Array.isArray(marqueeConfig.topMarquee.texts) && marqueeConfig.topMarquee.texts.length > 0) {
        const topContainer = document.getElementById('marquee-top');
        if (topContainer) {
            const wrapper = document.createElement('div');
            wrapper.className = 'marquee-wrapper';
            
            const content = document.createElement('div');
            content.className = 'marquee-content';
            content.id = 'top-marquee-content';
            
            wrapper.appendChild(content);
            topContainer.innerHTML = '';
            topContainer.appendChild(wrapper);

            let currentIndex = 0;
            
            function showTextWithAnimation() {
                const text = marqueeConfig.topMarquee.texts[currentIndex];
                content.textContent = text;
                
                // Đảm bảo chữ đã được render trước khi tính toán
                setTimeout(() => {
                    const containerWidth = wrapper.offsetWidth;
                    const textWidth = content.scrollWidth;
                    
                    // Tính thời gian animation dựa trên chiều dài văn bản
                    const duration = (textWidth + containerWidth) / marqueeConfig.topMarquee.speed;
                    
                    // Áp dụng animation
                    content.style.animation = `none`;
                    void content.offsetWidth; // Trigger reflow
                    content.style.animation = `scrollTopMarquee ${duration}s linear`;
                    
                    // Chuyển sang câu tiếp theo sau khi hoàn thành animation + thời gian dừng
                    setTimeout(() => {
                        currentIndex = (currentIndex + 1) % marqueeConfig.topMarquee.texts.length;
                        showTextWithAnimation();
                    }, (duration * 1000) + marqueeConfig.topMarquee.pauseBetween);
                    
                }, 50);
            }
            
            showTextWithAnimation();
        }
    }

    // === XỬ LÝ DÒNG DƯỚI: giữ nguyên <marquee> ===
    if (marqueeConfig.bottomMarquee.enabled) {
        const bottomContainer = document.getElementById('marquee-bottom');
        if (bottomContainer) {
            const bottomMarqueeHTML = `
                <marquee class="marquee-text" behavior="scroll" direction="left" scrollamount="${marqueeConfig.bottomMarquee.speed}">
                    ${marqueeConfig.bottomMarquee.text}
                </marquee>
            `;
            bottomContainer.innerHTML = bottomMarqueeHTML;
        }
    }

    applyMarqueeStyles();
}

// ÁP DỤNG CSS CHO HIỆU ỨNG
function applyMarqueeStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* --- DÒNG TRÊN: chạy mượt bằng CSS --- */
        .marquee-wrapper {
            overflow: hidden;
            width: 100%;
            white-space: nowrap;
            box-sizing: border-box;
            position: relative;
            height: 40px;
            display: flex;
            align-items: center;
        }
        .marquee-content {
            display: inline-block;
            color: ${marqueeConfig.topMarquee.color};
            font-weight: bold;
            font-size: ${marqueeConfig.topMarquee.fontSize};
            text-shadow: 1px 1px 1px rgba(0,0,0,0.9);
            padding: 5px 0;
            white-space: nowrap;
            position: absolute;
            left: 100%;
        }
        @keyframes scrollTopMarquee {
            0% { 
                transform: translateX(0); 
            }
            100% { 
                transform: translateX(calc(-100% - 100vw)); 
            }
        }

        /* --- DÒNG DƯỚI: giữ nguyên --- */
        .marquee-text {
            color: ${marqueeConfig.bottomMarquee.color};
            font-weight: bold;
            font-size: ${marqueeConfig.bottomMarquee.fontSize};
            text-shadow: 1px 1px 1px rgba(0,0,0,0.9);
            margin: 5px 0 8px 0;
            border-top: 1px solid red;
            border-bottom: 1px solid red;
            padding: 0px 0;
        }

        /* --- Responsive --- */
        @media (max-width: 768px) {
            .marquee-text {
                font-size: 26px;
                margin: 3px 0 6px 0;
                padding: 2px 0;
            }
            .marquee-content {
                font-size: 20px;
            }
            .marquee-wrapper {
                height: 35px;
            }
        }
    `;
    document.head.appendChild(style);
}

// KHỞI CHẠY
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMarquee);
} else {
    initMarquee();
}