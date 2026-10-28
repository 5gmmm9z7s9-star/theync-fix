// ==UserScript==
// @name         TheYNC Fix
// @match        https://theync.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
(function () {
  'use strict';

  // 1) 站点自带的 18+ 弹窗：写入它认的 cookie，弹窗就不会出现
  document.cookie = 'cookiesBanner=true; path=/; max-age=' + 60 * 60 * 24 * 30;

  // 2) AgeVerif 的弹窗在 <ageverif-checker> 的 closed shadow DOM 里，
  //    外部选择器和 remove() 都碰不到（删除还会触发它的防篡改，重画一个报错框）。
  //    所以在它创建 shadow root 时，往里面塞一条样式，只隐藏遮罩层。
  const orig = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function (init) {
    const root = orig.call(this, Object.assign({}, init, { mode: 'open' }));
    if (this.localName === 'ageverif-checker') {
      const s = document.createElement('style');
      s.textContent = '#overlay { display: none !important; }';
      root.appendChild(s);
    }
    return root;
  };

  // 3) 它会把 body 设成 overflow:hidden，这里压回去；顺便清除可能的页面模糊
  const st = document.createElement('style');
  st.textContent = `
    html:root, html:root body { overflow: auto !important; }
    html:root, html:root body, html:root body > * { filter: none !important; }
  `;
  document.documentElement.appendChild(st);
})();
