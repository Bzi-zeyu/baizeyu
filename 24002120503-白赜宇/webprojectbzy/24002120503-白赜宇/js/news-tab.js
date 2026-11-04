/**
 * 新闻 Tab 选项卡模块
 * 提供可复用的 bzy_Tab 构造器，封装"清除所有选中态 → 设置当前选中态"的切换逻辑
 * 使用方式: new bzy_Tab({ tabSelector: '.bzy_tab', panelSelector: '.bzy_panel', defaultIndex: 0 })
 */

/**
 * Tab 选项卡可复用构造器
 * @param {Object} options - 配置对象
 * @param {string} options.tabSelector    - tab 按钮的 CSS 选择器（如 '.bzy_tab-item'）
 * @param {string} options.panelSelector  - 对应内容面板的 CSS 选择器（如 '.bzy_tab-panel'）
 * @param {number} [options.defaultIndex] - 默认激活的 tab 下标，从 0 开始，默认 0
 * @param {string} [options.activeClass]  - 选中态 class 名，默认 'bzy_active'
 * @returns {void}
 */
function bzy_Tab(options) {
    // 默认值
    this.tabSelector   = options.tabSelector   || '.bzy_tab-item';
    this.panelSelector = options.panelSelector || '.bzy_tab-panel';
    this.defaultIndex  = (typeof options.defaultIndex === 'number') ? options.defaultIndex : 0;
    this.activeClass   = options.activeClass   || 'bzy_active';

    // 获取 DOM
    this.tabs   = document.querySelectorAll(this.tabSelector);
    this.panels = document.querySelectorAll(this.panelSelector);

    // 保护：tab 与 panel 数量必须一致
    if (this.tabs.length !== this.panels.length) {
        console.warn('[bzy_Tab] tab 数量 (' + this.tabs.length + ') 与 panel 数量 (' + this.panels.length + ') 不一致');
    }

    // 绑定事件监听 + 初始化
    this.bzy_bindEvents();
    this.bzy_switch(this.defaultIndex);
}

/**
 * 为每个 tab 按钮绑定 click 事件监听
 * 点击后把当前 tab 在兄弟集合中的下标传给 bzy_switch 完成切换
 * @returns {void}
 */
bzy_Tab.prototype.bzy_bindEvents = function () {
    var self = this;
    this.tabs.forEach(function (tabEl, index) {
        tabEl.addEventListener('click', function () {
            self.bzy_switch(index);
        });
    });
};

/**
 * 核心切换逻辑：先清除所有选中态，再设置目标选中态
 * @param {number} index - 要激活的 tab 下标
 * @returns {void}
 */
bzy_Tab.prototype.bzy_switch = function (index) {
    // ── 第一步：先清除所有选中状态 ──
    this.tabs.forEach(function (tabEl) {
        tabEl.classList.remove(this.activeClass);
    }, this);

    this.panels.forEach(function (panelEl) {
        panelEl.classList.remove(this.activeClass);
    }, this);

    // ── 第二步：再设置当前元素的选中状态 ──
    if (this.tabs[index]) {
        this.tabs[index].classList.add(this.activeClass);
    }
    if (this.panels[index]) {
        this.panels[index].classList.add(this.activeClass);
    }
};
