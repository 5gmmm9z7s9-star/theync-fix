// ==UserScript==
// @name         TheYNC Absolute Annihilator
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  Hardcore absolute bypass for age verification on TheYNC.
// @match        https://theync.com/*
// @run-at       document-start
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/5gmmz7s9-star/theync-fix/main/theync.user.js
// @updateURL    https://raw.githubusercontent.com/5gmmz7s9-star/theync-fix/main/theync.user.js
// ==/UserScript==

(function() {
    'use strict';

    // 1. 开局瞬间注入最强毁灭性样式，直接剥夺所有遮罩和模糊的显示能力
    const style = document.createElement('style');
    style.innerHTML = `
        *, body, html {
            filter: none !important;
            backdrop-filter: none !important;
            overflow: auto !important;
        }
        div[class*="age"], div[id*="age"], 
        div[class*="verify"], div[id*="verify"], 
        div[class*="overlay"], iframe[src*="ageverif"],
        .cookiesBanner, div[style*="z-index: 99999"],
        div[style*="position: fixed"] {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
            z-index: -999999 !important;
        }
    `;
    
    // 抢在 head 出现前挂载到根节点
    const root = document.documentElement || document;
    if (root) {
        root.appendChild(style);
    }

    // 2. 根源拦截 Node.appendChild：只要网页试图往页面里塞任何带 age / verify 的垃圾节点，直接没收
    const originalAppendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function(child) {
        if (child && child.outerHTML) {
            const html = child.outerHTML.toLowerCase();
            if (html.includes('ageverif') || html.includes('verify your age') || html.includes('age-verify')) {
                return child; // 表面上放行，实际上根本不把它挂载到真实 DOM 树上
            }
        }
        return originalAppendChild.call(this, child);
    };

    // 3. 根源拦截 insertBefore，防止通过插入节点绕过
    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function(newNode, referenceNode) {
        if (newNode && newNode.outerHTML) {
            const html = newNode.outerHTML.toLowerCase();
            if (html.includes('ageverif') || html.includes('verify your age') || html.includes('age-verify')) {
                return newNode;
            }
        }
        return originalInsertBefore.call(this, newNode, referenceNode);
    };

    // 4. 终极 DOM 轮询清理（每 20 毫秒全网清扫一次残留）
    setInterval(() => {
        if (document.body) {
            document.body.style.setProperty('overflow', 'auto', 'important');
        }
        // 扫射所有带有特定字眼的元素直接物理摧毁
        const elements = document.querySelectorAll('div, section, iframe');
        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            const text = el.innerText || '';
            const cls = el.className || '';
            if (
                text.includes('Verify your age') || 
                text.includes('ageverif') ||
                (typeof cls === 'string' && (cls.includes('age') || cls.includes('verify')))
            ) {
                el.remove();
            }
        }
    }, 20);

})();
