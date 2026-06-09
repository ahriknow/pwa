// AhriKnow WPA 主应用逻辑
class AhriKnowApp {
    constructor() {
        this.collects = [];
        this.currentFilter = 'all';
        this.deferredPrompt = null;
        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.renderCollects();
        this.updateStats();
        this.checkTheme();
        this.registerServiceWorker();
        this.setupInstallPrompt();
    }

    // 数据持久化
    loadData() {
        try {
            const saved = localStorage.getItem('ahriknow_collects');
            this.collects = saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('加载数据失败:', e);
            this.collects = [];
        }
    }

    saveData() {
        try {
            localStorage.setItem('ahriknow_collects', JSON.stringify(this.collects));
        } catch (e) {
            console.error('保存数据失败:', e);
            alert('保存失败，可能是存储空间已满');
        }
    }

    // 绑定事件
    bindEvents() {
        // 导航切换
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // 移动端菜单
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.querySelector('.nav').classList.toggle('active');
            });
        }

        // 表单提交
        const form = document.getElementById('collectForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addCollect();
            });
        }

        // 筛选按钮
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderCollects();
            });
        });

        // 深色模式切换
        const darkModeToggle = document.getElementById('darkMode');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', (e) => {
                this.toggleDarkMode(e.target.checked);
            });
        }

        // 清除缓存
        const clearCacheBtn = document.getElementById('clearCache');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => this.clearCache());
        }

        // 清除数据
        const clearDataBtn = document.getElementById('clearData');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => this.clearAllData());
        }
    }

    // 切换标签页
    switchTab(tab) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tab);
        });
        // 移动端关闭菜单
        document.querySelector('.nav').classList.remove('active');
    }

    // 添加收集
    addCollect() {
        const title = document.getElementById('title').value.trim();
        const content = document.getElementById('content').value.trim();
        const category = document.getElementById('category').value;

        if (!title || !content) {
            alert('请填写标题和内容');
            return;
        }

        const collect = {
            id: Date.now(),
            title,
            content,
            category,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.collects.unshift(collect);
        this.saveData();
        this.renderCollects();
        this.updateStats();

        // 清空表单
        document.getElementById('collectForm').reset();
        
        // 显示成功提示
        this.showToast('收集成功！');
    }

    // 删除收集
    deleteCollect(id) {
        if (confirm('确定要删除这条收集吗？')) {
            this.collects = this.collects.filter(c => c.id !== id);
            this.saveData();
            this.renderCollects();
            this.updateStats();
            this.showToast('已删除');
        }
    }

    // 渲染收集列表
    renderCollects() {
        const list = document.getElementById('collectList');
        const emptyTip = document.getElementById('emptyTip');
        
        let filtered = this.collects;
        if (this.currentFilter !== 'all') {
            filtered = this.collects.filter(c => c.category === this.currentFilter);
        }

        if (filtered.length === 0) {
            list.innerHTML = '';
            emptyTip.style.display = 'block';
            return;
        }

        emptyTip.style.display = 'none';
        list.innerHTML = filtered.map(item => `
            <li class="collect-item" data-id="${item.id}">
                <div class="collect-item-content">
                    <div class="collect-item-title">${this.escapeHtml(item.title)}</div>
                    <div class="collect-item-text">${this.escapeHtml(item.content)}</div>
                    <div class="collect-item-meta">
                        <span class="badge">${this.getCategoryName(item.category)}</span>
                        <span>${this.formatDate(item.createdAt)}</span>
                    </div>
                </div>
                <div class="collect-item-actions">
                    <button class="btn-icon delete" onclick="app.deleteCollect(${item.id})" title="删除">🗑️</button>
                </div>
            </li>
        `).join('');
    }

    // 更新统计
    updateStats() {
        const countEl = document.getElementById('collectCount');
        const todayEl = document.getElementById('todayCount');
        
        if (countEl) countEl.textContent = this.collects.length;
        
        if (todayEl) {
            const today = new Date().toDateString();
            const todayCount = this.collects.filter(c => 
                new Date(c.createdAt).toDateString() === today
            ).length;
            todayEl.textContent = todayCount;
        }
    }

    // 获取分类名称
    getCategoryName(category) {
        const names = {
            note: '笔记',
            idea: '想法',
            task: '任务',
            other: '其他'
        };
        return names[category] || '其他';
    }

    // 格式化日期
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
        
        return date.toLocaleDateString('zh-CN');
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 显示提示
    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 1000;
            animation: fadeInOut 2s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 2000);
    }

    // 主题切换
    toggleDarkMode(enabled) {
        document.documentElement.setAttribute('data-theme', enabled ? 'dark' : 'light');
        localStorage.setItem('ahriknow_theme', enabled ? 'dark' : 'light');
    }

    checkTheme() {
        const saved = localStorage.getItem('ahriknow_theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = saved ? saved === 'dark' : prefersDark;
        
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        const toggle = document.getElementById('darkMode');
        if (toggle) toggle.checked = isDark;
    }

    // 清除缓存
    async clearCache() {
        if (confirm('确定要清除缓存吗？')) {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(name => caches.delete(name))
                );
                this.showToast('缓存已清除');
                this.updateCacheStatus();
            } catch (e) {
                console.error('清除缓存失败:', e);
                alert('清除缓存失败');
            }
        }
    }

    // 清除所有数据
    clearAllData() {
        if (confirm('确定要清除所有收集数据吗？此操作不可恢复！')) {
            this.collects = [];
            this.saveData();
            this.renderCollects();
            this.updateStats();
            this.showToast('数据已清除');
        }
    }

    // 更新缓存状态
    async updateCacheStatus() {
        const statusEl = document.getElementById('cacheStatus');
        if (statusEl) {
            try {
                const cacheNames = await caches.keys();
                statusEl.textContent = cacheNames.length > 0 ? '已缓存' : '未缓存';
            } catch (e) {
                statusEl.textContent = '未知';
            }
        }
    }

    // 注册Service Worker
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', async () => {
                try {
                    const registration = await navigator.serviceWorker.register('/ahriknow-wpa/sw.js');
                    console.log('SW registered:', registration.scope);
                    this.updateCacheStatus();
                } catch (error) {
                    console.log('SW registration failed:', error);
                }
            });
        }
    }

    // 安装提示
    setupInstallPrompt() {
        // 检测是否已安装
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return; // 已安装，不显示提示
        }

        // 监听自动安装事件
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            
            const installPrompt = document.getElementById('installPrompt');
            if (installPrompt) {
                installPrompt.style.display = 'block';
            }
        });

        const installBtn = document.getElementById('installBtn');
        const dismissBtn = document.getElementById('dismissBtn');

        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (this.deferredPrompt) {
                    this.deferredPrompt.prompt();
                    const { outcome } = await this.deferredPrompt.userChoice;
                    console.log('User response:', outcome);
                    this.deferredPrompt = null;
                }
                document.getElementById('installPrompt').style.display = 'none';
            });
        }

        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                document.getElementById('installPrompt').style.display = 'none';
            });
        }

        window.addEventListener('appinstalled', () => {
            console.log('App installed');
            document.getElementById('installPrompt').style.display = 'none';
        });

        // 设置手动安装指引
        this.setupInstallGuide();
    }

    // 手动安装指引
    setupInstallGuide() {
        const showBtn = document.getElementById('showInstallGuide');
        const closeBtn = document.getElementById('closeInstallGuide');
        const modal = document.getElementById('installGuideModal');

        if (showBtn) {
            showBtn.addEventListener('click', () => {
                this.showInstallGuide();
                modal.style.display = 'flex';
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        // 点击背景关闭
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }

        // 更新安装提示文本
        const installTip = document.getElementById('installTip');
        if (installTip) {
            const browser = this.detectBrowser();
            if (browser === 'safari-ios') {
                installTip.textContent = '使用Safari浏览器，点击分享按钮安装';
            } else if (browser === 'miui' || browser === 'xiaomi') {
                installTip.textContent = '使用小米浏览器，点击菜单添加到桌面';
            } else if (browser === 'chrome') {
                installTip.textContent = '点击菜单 → 添加到主屏幕';
            } else {
                installTip.textContent = '点击按钮查看安装指引';
            }
        }
    }

    // 检测浏览器
    detectBrowser() {
        const ua = navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(ua) && /safari/.test(ua) && !/chrome/.test(ua)) {
            return 'safari-ios';
        }
        if (/miui/.test(ua) || /xiaomi/.test(ua)) {
            return 'miui';
        }
        if (/chrome/.test(ua) && !/edge/.test(ua)) {
            return 'chrome';
        }
        if (/samsungbrowser/.test(ua)) {
            return 'samsung';
        }
        if (/firefox/.test(ua)) {
            return 'firefox';
        }
        return 'other';
    }

    // 显示安装指引
    showInstallGuide() {
        const content = document.getElementById('installGuideContent');
        if (!content) return;

        const browser = this.detectBrowser();
        let steps = [];

        switch (browser) {
            case 'safari-ios':
                steps = [
                    { icon: '📱', text: '确保使用Safari浏览器打开本页面' },
                    { icon: '📤', text: '点击底部工具栏的「分享」按钮' },
                    { icon: '⬇️', text: '在弹出菜单中找到「添加到主屏幕」' },
                    { icon: '✅', text: '点击「添加」完成安装' }
                ];
                break;
            case 'miui':
            case 'xiaomi':
                steps = [
                    { icon: '📱', text: '使用小米浏览器打开本页面' },
                    { icon: '☰', text: '点击底部或右上角的「菜单」按钮' },
                    { icon: '➕', text: '找到「添加到桌面」或「添加快捷方式」' },
                    { icon: '✅', text: '确认添加即可' }
                ];
                break;
            case 'samsung':
                steps = [
                    { icon: '📱', text: '使用三星浏览器打开本页面' },
                    { icon: '☰', text: '点击右下角的「菜单」按钮' },
                    { icon: '➕', text: '选择「添加页面到」→「主屏幕」' },
                    { icon: '✅', text: '点击「添加」完成安装' }
                ];
                break;
            case 'chrome':
                steps = [
                    { icon: '📱', text: '使用Chrome浏览器打开本页面' },
                    { icon: '⋮', text: '点击右上角的「更多」菜单(三个点)' },
                    { icon: '➕', text: '选择「添加到主屏幕」' },
                    { icon: '✅', text: '确认名称后点击「添加」' }
                ];
                break;
            case 'firefox':
                steps = [
                    { icon: '📱', text: '使用Firefox浏览器打开本页面' },
                    { icon: '⋮', text: '点击右上角的「更多」菜单' },
                    { icon: '➕', text: '选择「添加到主屏幕」' },
                    { icon: '✅', text: '确认添加即可' }
                ];
                break;
            default:
                steps = [
                    { icon: '📱', text: '使用浏览器打开本页面' },
                    { icon: '☰', text: '点击浏览器菜单按钮' },
                    { icon: '➕', text: '找到「添加到主屏幕」或「添加快捷方式」' },
                    { icon: '✅', text: '确认添加即可' }
                ];
        }

        const browserNames = {
            'safari-ios': 'Safari (iOS)',
            'miui': '小米浏览器',
            'xiaomi': '小米浏览器',
            'samsung': '三星浏览器',
            'chrome': 'Chrome',
            'firefox': 'Firefox',
            'other': '当前浏览器'
        };

        content.innerHTML = `
            <div class="install-browser-tag">${browserNames[browser] || '当前浏览器'}</div>
            ${steps.map((step, i) => `
                <div class="install-guide-step">
                    <div class="step-number">${i + 1}</div>
                    <div class="step-content">
                        <p><span class="step-icon">${step.icon}</span>${step.text}</p>
                    </div>
                </div>
            `).join('')}
        `;
    }
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, 20px); }
        20% { opacity: 1; transform: translate(-50%, 0); }
        80% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -20px); }
    }
`;
document.head.appendChild(style);

// 初始化应用
const app = new AhriKnowApp();
