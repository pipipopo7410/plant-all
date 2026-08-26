(function() {
    // ==========================================
    // 全域響應式排版修正引擎 (套用於所有分頁)
    // ==========================================
    function injectGlobalResponsiveStyles() {
        if (document.getElementById('global-responsive-styles')) return;
        const style = document.createElement('style');
        style.id = 'global-responsive-styles';
        style.innerHTML = `
            /* 1. 導覽列：平板尺寸時不滑動，自動縮小字體、內距與按鈕間距 */
            @media (max-width: 1180px) {
                #nav-tabs-bar { padding: 0 12px !important; gap: 4px !important; }
                #nav-tabs-bar .text-xl { font-size: 1.1rem !important; }
                #nav-tabs-bar .font-black { font-size: 1rem !important; letter-spacing: 0 !important; }
                #global-nav-buttons { gap: 4px !important; }
                .nav-btn { padding: 4px 8px !important; font-size: 13px !important; letter-spacing: -0.5px; }
                
                /* 縮小範圍徽章，並隱藏次要提示文字以節省空間 */
                #nav-phylo-badge { padding: 4px 8px !important; font-size: 11px !important; margin-left: 4px !important; }
                #nav-phylo-badge span:last-child { display: none; } 
            }

            /* 2. 底圖防裁切：全域強制所有作為背景的圖檔完整顯示，並貼齊底部 */
            #canvas img.absolute.inset-0.w-full.h-full {
                object-fit: contain !important;
                object-position: bottom !important;
            }

            /* 3. 面板防遮擋：全域針對所有分頁的兩側控制面板進行縮放 */
            @media (max-width: 1180px) {
                /* 抓取右側的浮動面板 (如環境參數、階段四的篩選器) */
                #canvas > div.absolute[class*="right-"] {
                    transform: scale(0.75);
                    transform-origin: top right;
                }
                /* 抓取左側的浮動面板 (如長條圖、階段四的提示板) */
                #canvas > div.absolute[class*="left-"] {
                    transform: scale(0.75);
                    transform-origin: bottom left;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 立即啟動全域排版修正
    injectGlobalResponsiveStyles();

    // 1. 判斷當前頁面階段
    const path = window.location.pathname.toLowerCase();
    let currentStage = 1;
    
    if (path.includes('stage2')) { currentStage = 2; }
    else if (path.includes('stage3')) { currentStage = 3; }
    else if (path.includes('stage4') || path.includes('pea') || path.includes('gene') || path.includes('quiz')) { currentStage = 4; }

    const stageInfo = {
        2: { badge: "📍 本單元範圍：維管束植物全體" },
        3: { badge: "📍 本單元範圍：綠色植物全體" },
        4: { badge: "📍 本單元範圍：開花植物(被子植物)" }
    };

    document.addEventListener("DOMContentLoaded", () => {
        const navSource = sessionStorage.getItem('nav_source');
        const navTarget = sessionStorage.getItem('nav_target');
        const layout = document.getElementById('global-layout');
        
        // --- ★ 進場動畫 A：巨觀鑽入微觀 (2 -> 3 或 2 -> 4) ---
        if (layout && navSource == 2 && navTarget == currentStage && (currentStage === 3 || currentStage === 4)) {
            layout.style.transformOrigin = 'center center';
            layout.style.transform = 'scale(3)'; 
            layout.style.opacity = '0';
            layout.style.transition = 'none';
            
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    layout.style.transition = 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.8s ease-out';
                    layout.style.transform = 'scale(1)';
                    layout.style.opacity = '1';
                });
            });
        }
        // --- ★ 進場動畫 B：微觀抽離回巨觀 (3 -> 2 或 4 -> 2) ---
        else if (layout && (navSource == 3 || navSource == 4) && currentStage === 2) {
            let originX = "50%", originY = "50%";
            if (navSource == 3) { originX = "65%"; originY = "50%"; } 
            else if (navSource == 4) { originX = "35%"; originY = "25%"; } 

            layout.style.transformOrigin = `${originX} ${originY}`;
            layout.style.transform = 'scale(8)'; 
            layout.style.opacity = '0';
            layout.style.filter = 'blur(4px)'; 
            layout.style.transition = 'none';
            
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    layout.style.transition = 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.8s ease-out, filter 0.8s ease-out';
                    layout.style.transform = 'scale(1)';
                    layout.style.opacity = '1';
                    layout.style.filter = 'blur(0px)';
                });
            });
        }

        sessionStorage.removeItem('nav_source');
        sessionStorage.removeItem('nav_target');

        const subtitleEl = document.querySelector('.text-xs.text-slate-400.font-mono');
        if (subtitleEl) subtitleEl.remove();

        const navTitle = document.querySelector('#nav-tabs-bar .font-black.text-lg.text-white');
        if (navTitle) navTitle.textContent = "會考總複習：植物大串聯";

        const navBtnContainer = document.getElementById('global-nav-buttons');
        if (navBtnContainer) navBtnContainer.className = "flex items-center justify-center gap-2 flex-1";

        const navBtns = document.querySelectorAll('#global-nav-buttons button');
        navBtns.forEach((btn, index) => {
            const btnStage = index + 1;
            let targetUrl = btn.getAttribute('data-target');
            if (!targetUrl && btn.getAttribute('onclick')) {
                const match = btn.getAttribute('onclick').match(/'([^']+)'/);
                if (match) targetUrl = match[1];
            }
            if (!targetUrl) return; 
            btn.removeAttribute('onclick');
            
            if (btnStage === currentStage) {
                // 當前高亮按鈕，移除發光硬邊，改用大範圍柔邊陰影
                btn.className = "nav-btn px-4 py-1.5 rounded-lg text-[15px] font-black transition-all bg-white text-emerald-600 shadow-[0_0_20px_rgba(100,116,139,0.35)] pointer-events-none relative z-10";
            } else {
                btn.className = "nav-btn px-4 py-1.5 rounded-lg text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all";
            }
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (btnStage === currentStage) return; 
                
                if (currentStage === 2 && (btnStage === 3 || btnStage === 4)) {
                    triggerMagnifierTransition(currentStage, btnStage, targetUrl);
                } else if ((currentStage === 3 || currentStage === 4) && btnStage === 2) {
                    triggerZoomOutTransition(currentStage, btnStage, targetUrl);
                } else {
                    window.location.href = targetUrl; 
                }
            });
        });

        if (currentStage > 1 && !sessionStorage.getItem(`tree_cleared_${currentStage}`)) {
            showPhylogeneticTree(currentStage);
        } else {
            mountNavBadge(currentStage);
        }
    });

    // ==========================================
    // 動畫一：巨觀鑽入微觀 (2 -> 3/4)
    // ==========================================
    function triggerMagnifierTransition(from, to, url) {
        sessionStorage.setItem('nav_source', from);
        sessionStorage.setItem('nav_target', to);

        if (!document.getElementById('mag-keyframes')) {
            const style = document.createElement('style');
            style.id = 'mag-keyframes';
            style.innerHTML = `
                @keyframes magFlyIn {
                    0% { left: 120%; top: 120%; transform: translate(-50%, -50%) scale(0.5) rotate(-30deg); }
                    35% { left: var(--target-x); top: var(--target-y); transform: translate(-50%, -50%) scale(1) rotate(0deg); }
                    55% { left: calc(var(--target-x) - 3%); top: calc(var(--target-y) + 3%); transform: translate(-50%, -50%) scale(1.1) rotate(-10deg); }
                    75% { left: calc(var(--target-x) + 3%); top: calc(var(--target-y) - 3%); transform: translate(-50%, -50%) scale(1.1) rotate(10deg); }
                    100% { left: var(--target-x); top: var(--target-y); transform: translate(-50%, -50%) scale(1.2) rotate(0deg); }
                }
            `;
            document.head.appendChild(style);
        }

        let targetX = "50%", targetY = "50%"; 
        if (from === 2 && to === 3) { targetX = "65%"; targetY = "50%"; } 
        else if (from === 2 && to === 4) { targetX = "35%"; targetY = "25%"; } 

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; inset: 0; z-index: 99999; pointer-events: none;
            background: rgba(0,0,0,0.4); transition: background 0.5s;
        `;

        const magGlass = document.createElement('div');
        magGlass.innerHTML = `
            <svg viewBox="0 0 100 100" style="width: 250px; height: 250px; filter: drop-shadow(15px 15px 15px rgba(0,0,0,0.6));">
                <circle cx="40" cy="40" r="35" fill="rgba(255,255,255,0.15)" stroke="#94a3b8" stroke-width="8"/>
                <circle cx="40" cy="40" r="28" fill="rgba(255,255,255,0.3)"/>
                <line x1="65" y1="65" x2="95" y2="95" stroke="#334155" stroke-width="14" stroke-linecap="round"/>
                <line x1="65" y1="65" x2="80" y2="80" stroke="#64748b" stroke-width="14" stroke-linecap="round"/>
            </svg>
        `;
        
        magGlass.style.setProperty('--target-x', targetX);
        magGlass.style.setProperty('--target-y', targetY);
        magGlass.style.cssText += `
            position: absolute; left: 120%; top: 120%;
            transform-origin: 40px 40px;
            animation: magFlyIn 2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        `;
        
        overlay.appendChild(magGlass);
        document.body.appendChild(overlay);

        setTimeout(() => {
            magGlass.style.animation = 'none'; 
            
            const layout = document.getElementById('global-layout');
            if (layout) {
                layout.style.transformOrigin = `${targetX} ${targetY}`;
                layout.style.transition = 'transform 0.8s cubic-bezier(0.5, 0, 0.2, 1), filter 0.8s';
                layout.style.transform = `scale(8)`;
                layout.style.filter = 'blur(2px)'; 
            }

            magGlass.style.transition = 'transform 0.8s cubic-bezier(0.5, 0, 0.2, 1), opacity 0.6s';
            magGlass.style.transform = `translate(-50%, -50%) scale(15)`; 
            magGlass.style.opacity = '0';
            
            const fader = document.createElement('div');
            fader.style.cssText = 'position: absolute; inset: 0; background: white; opacity: 0; transition: opacity 0.6s ease-in; z-index: 99998;';
            document.body.appendChild(fader);
            
            setTimeout(() => fader.style.opacity = '1', 100);

            setTimeout(() => { window.location.href = url; }, 800); 
        }, 2200); 
    }

    // ==========================================
    // 動畫二：微觀抽離回巨觀 (3/4 -> 2)
    // ==========================================
    function triggerZoomOutTransition(from, to, url) {
        sessionStorage.setItem('nav_source', from);
        sessionStorage.setItem('nav_target', to);

        const layout = document.getElementById('global-layout');
        if (layout) {
            layout.style.transformOrigin = 'center center';
            layout.style.transition = 'transform 0.6s cubic-bezier(0.5, 0, 0.2, 1), opacity 0.6s, filter 0.6s';
            layout.style.transform = 'scale(0.15)'; 
            layout.style.opacity = '0';
            layout.style.filter = 'blur(4px)';
        }

        const fader = document.createElement('div');
        fader.style.cssText = 'position: fixed; inset: 0; background: white; opacity: 0; transition: opacity 0.4s ease-in; z-index: 99999; pointer-events: none;';
        document.body.appendChild(fader);
        requestAnimationFrame(() => fader.style.opacity = '1');

        setTimeout(() => {
            window.location.href = url;
        }, 500);
    }

    // ==========================================
    // 功能三：迷你演化樹攔截彈窗
    // ==========================================
    function mountNavBadge(stage) {
        if(!stageInfo[stage] || document.getElementById('nav-phylo-badge')) return;
        
        const badge = document.createElement('div');
        badge.id = 'nav-phylo-badge';
        // 加入 shrink-0 避免在平板上被擠壓
        badge.className = 'cursor-pointer mx-3 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-600 text-emerald-300 text-[13px] font-bold flex items-center gap-1.5 hover:bg-slate-700 transition-colors shadow-md animate-pulse shrink-0';
        badge.innerHTML = `<span>${stageInfo[stage].badge}</span><span class="text-[10px] bg-emerald-600/20 text-emerald-200 px-1.5 py-0.5 rounded ml-1 border border-emerald-500/30">查看分類圖</span>`;
        badge.addEventListener('click', () => showPhylogeneticTree(stage, true));
        
        const navBtns = document.querySelectorAll('#global-nav-buttons button');
        if (navBtns.length >= stage) {
            navBtns[stage - 1].insertAdjacentElement('afterend', badge);
        }
    }

    function showPhylogeneticTree(stage, isReview = false) {
        const layout = document.getElementById('global-layout');
        if (layout && !isReview) layout.style.pointerEvents = 'none';

        const treeOverlay = document.createElement('div');
        treeOverlay.className = 'fixed inset-0 z-[88888] flex items-center justify-center bg-slate-900/80 backdrop-blur-md transition-opacity duration-500 opacity-0';
        
        let boxStyle = "", boxBounds = "";
        
        if (stage === 2) {
            boxStyle = "--glow-color: rgba(99, 102, 241, 0.8); --bg-color-max: rgba(99, 102, 241, 0.15); --bg-color-min: rgba(99, 102, 241, 0.05); border-color: #6366f1; color: #6366f1;";
            boxBounds = "top: 25%; left: 24%; width: 73%; height: 74%;"; 
        } else if (stage === 3) {
            boxStyle = "--glow-color: rgba(16, 185, 129, 0.8); --bg-color-max: rgba(16, 185, 129, 0.15); --bg-color-min: rgba(16, 185, 129, 0.05); border-color: #10b981; color: #10b981;";
            boxBounds = "top: 5%; left: 5%; width: 92%; height: 94%;"; 
        } else if (stage === 4) {
            boxStyle = "--glow-color: rgba(244, 63, 94, 0.8); --bg-color-max: rgba(244, 63, 94, 0.15); --bg-color-min: rgba(244, 63, 94, 0.05); border-color: #f43f5e; color: #f43f5e;";
            boxBounds = "top: 60%; left: 63%; width: 34%; height: 38%;"; 
        }

        const cBase = "absolute z-20 border-2 rounded-lg shadow-sm text-[13px] font-extrabold flex items-center justify-center tracking-wider w-[100px] h-[36px] transform -translate-x-1/2 -translate-y-1/2";
        const cDark = "bg-slate-800 border-slate-900 text-white";
        const cGreen = "bg-emerald-100 border-emerald-400 text-emerald-950";
        const cBlue = "bg-blue-100 border-blue-400 text-blue-950";

        treeOverlay.innerHTML = `
            <style>
                @keyframes boxGlowAnim {
                    0%, 100% { box-shadow: 0 0 5px var(--glow-color), inset 0 0 5px var(--glow-color); background-color: var(--bg-color-max); }
                    50% { box-shadow: 0 0 35px var(--glow-color), inset 0 0 25px var(--glow-color); background-color: var(--bg-color-min); }
                }
                .scope-glow-pulse { animation: boxGlowAnim 1.5s infinite ease-in-out; }
            </style>
            <div class="bg-slate-50 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center gap-6 w-[90%] max-w-[800px] transform scale-95 transition-transform duration-500" id="tree-content">
                <h2 class="text-2xl font-black text-slate-800 border-b-2 border-slate-200 pb-3 w-full text-center tracking-wider">🌿 現在講的是這群植物喔！</h2>
                
                <div class="relative w-[95%] aspect-[4/3] max-h-[450px] flex items-center justify-center bg-white rounded-xl border border-slate-200 overflow-hidden pb-4">
                    
                    <div class="absolute border-[3px] border-dashed rounded-2xl z-0 scope-glow-pulse" style="${boxStyle} ${boxBounds}">
                        <div class="absolute -top-3 left-4 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md whitespace-nowrap" style="background-color: ${boxStyle.match(/border-color:\s*([^;]+)/)[1]}">${stage === 2 ? '維管束植物' : (stage===4 ? '開花植物' : '綠色植物')} 包含範圍</div>
                    </div>

                    <svg class="absolute inset-0 w-full h-full pointer-events-none z-10">
                        <line x1="35%" y1="10%" x2="15%" y2="30%" stroke="#10b981" stroke-width="4" />
                        <line x1="35%" y1="10%" x2="55%" y2="30%" stroke="#10b981" stroke-width="4" />
                        
                        <line x1="55%" y1="30%" x2="35%" y2="50%" stroke="#10b981" stroke-width="4" />
                        <line x1="55%" y1="30%" x2="75%" y2="50%" stroke="#10b981" stroke-width="4" />

                        <line x1="75%" y1="50%" x2="55%" y2="70%" stroke="#10b981" stroke-width="4" />
                        <line x1="75%" y1="50%" x2="80%" y2="70%" stroke="#10b981" stroke-width="4" />
                        
                        <line x1="82%" y1="73%" x2="65%" y2="92%" stroke="#10b981" stroke-width="4" />
                        <line x1="82%" y1="73%" x2="88%" y2="92%" stroke="#10b981" stroke-width="4" />
                    </svg>

                    <div class="${cBase} ${cDark}" style="left: 35%; top: 10%;">植物界</div>
                    
                    <div class="${cBase} ${cGreen}" style="left: 15%; top: 30%;">蘚苔植物</div>
                    <div class="${cBase} ${cBlue}" style="left: 55%; top: 30%;">維管束植物</div>

                    <div class="${cBase} ${cGreen}" style="left: 35%; top: 50%;">蕨類植物</div>
                    <div class="${cBase} ${cBlue}" style="left: 75%; top: 50%;">種子植物</div>

                    <div class="${cBase} ${cGreen}" style="left: 55%; top: 70%;">裸子植物</div>
                    
                    <div class="${cBase} ${cGreen}" style="left: 80%; top: 70%; z-index: 25;">被子植物</div>
                    <div class="${cBase} ${cBlue}" style="left: 83%; top: 76%; z-index: 30; box-shadow: -2px -2px 10px rgba(0,0,0,0.1), 3px 5px 10px rgba(0,0,0,0.3);">開花植物</div>

                    <div class="${cBase} ${cBlue}" style="left: 65%; top: 92%;">單子葉植物</div>
                    <div class="${cBase} ${cBlue}" style="left: 88%; top: 92%;">雙子葉植物</div>
                </div>

                <button id="btn-confirm-tree" class="mt-2 w-64 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md transition-all text-xl tracking-widest">
                    ${isReview ? '我知道了' : '確認範圍，進入單元'}
                </button>
            </div>
        `;
        document.body.appendChild(treeOverlay);

        requestAnimationFrame(() => {
            treeOverlay.classList.remove('opacity-0');
            document.getElementById('tree-content').classList.remove('scale-95');
        });

        document.getElementById('btn-confirm-tree').addEventListener('click', () => {
            if (!isReview) {
                sessionStorage.setItem(`tree_cleared_${stage}`, 'true');
                mountNavBadge(stage);
            }
            treeOverlay.classList.add('opacity-0');
            document.getElementById('tree-content').classList.add('scale-95');
            setTimeout(() => {
                treeOverlay.remove();
                if (layout && !isReview) layout.style.pointerEvents = 'auto'; 
            }, 500);
        });
    }
})();