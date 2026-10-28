// ==UserScript==
// @name         TheYNC Ultimate Fix & Bypass
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Bypass age verification, remove overlays, and clear blur effects on TheYNC.
// @match        https://theync.com/*
// @run-at       document-start
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/5gmmz7s9-star/theync-fix/main/theync.user.js
// @updateURL    https://raw.githubusercontent.com/5gmmz7s9-star/theync-fix/main/theync.user.js
// ==/UserScript==

(function() {
    'use strict';

    // 1. 注入强力全局 CSS：强制清除所有模糊、彻底隐藏弹窗并保持页面可滚动
    const injectStyle = () => {
        if (!document.head) return;
        if (document.head.querySelector('#theync-ultimate-style')) return;

        const style = document.createElement('style');
        style.id = 'theync-ultimate-style';
        style.innerHTML = `
            *, body, html {
                filter: none !important;
                backdrop-filter: none !important;
            }
            .cookiesBanner, 
            div[class*="age"], 
            div[class*="verify"], 
            div[class*="overlay"],
            div[id*="age"],
            div[id*="verify"] {
                display: none !important;
                pointer-events: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
            }
            body {
                overflow: auto !important;
            }
        `;
        document.head.appendChild(style);
    };

    // 2. 核心清理函数：移除验证脚本、清除弹窗、恢复样式
    const cleanPage = () => {
        injectStyle();
        
        // 移除年龄验证外部脚本
        document.querySelectorAll('script[src*="ageverif.com"]').forEach(s => s.remove());
        
        // 移除残留的弹窗 DOM 节点
        document.querySelectorAll('.cookiesBanner, div[class*="age"], div[class*="verify"]').forEach(el => {
            el.remove();
        });

        // 确保滚动条正常
        if (document.body) {
            document.body.style.overflow = 'auto';
        }
    };

    // 3. 动态拦截：阻止浏览器后续创建加载 ageverif 脚本
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(document, tagName);
        if (tagName.toLowerCase() === 'script') {
            const originalSetAttribute = element.setAttribute;
            element.setAttribute = function(name, value) {
                if (name === 'src' && value && value.includes('ageverif.com')) return;
                return originalSetAttribute.apply(this, arguments);
            };
            Object.defineProperty(element, 'src', {
                set(url) {
                    if (url && url.includes('ageverif.com')) return;
                    element.setAttribute('src', url);
                },
                get() {
                    return element.getAttribute('src');
                }
            });
        }
        return element;
    };

    // 4. 多重保障机制
    // ① 初始加载时立即执行
    injectStyle();
    window.addEventListener('DOMContentLoaded', cleanPage);
    window.addEventListener('load', cleanPage);

    // ② DOM 变化实时监听（应对局部动态刷新）
    if (document.documentElement) {
        const observer = new MutationObserver(cleanPage);
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    // ③ 定时巡检（每 500 毫秒强制兜底，防止单页跳转遗漏）
    setInterval(cleanPage, 500);

    // ④ 监听浏览器历史记录与路由跳转（点视频、返回主页时触发）
    window.addEventListener('popstate', cleanPage);
    window.addEventListener('pushState', cleanPage);
    window.addEventListener('replaceState', cleanPage);
})();
