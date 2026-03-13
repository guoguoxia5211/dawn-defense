/**
 * ============================================
 * 主程序入口 - Main
 * 版本：v1.0.0
 * 功能：游戏初始化、场景管理、主界面逻辑
 * ============================================
 */

class Main {
    constructor() {
        this.gameData = null;
        this.currentScene = 'loading';
        this.loadingProgress = 0;
    }

    /**
     * 游戏初始化
     */
    async init() {
        console.log('[Main] 游戏初始化开始...');
        
        try {
            // 1. 初始化游戏数据
            await this.initGameData();
            
            // 2. 预加载资源
            await this.preloadAssets();
            
            // 3. 绑定 UI 事件
            this.bindEvents();
            
            // 4. 更新 UI
            this.updateUI();
            
            // 5. 切换到主界面
            this.switchScene('main-menu');
            
            console.log('[Main] 游戏初始化完成');
        } catch (error) {
            console.error('[Main] 初始化失败:', error);
            this.showError('初始化失败，请刷新页面重试');
        }
    }

    /**
     * 初始化游戏数据
     */
    async initGameData() {
        this.updateLoadingProgress(20, '加载玩家数据...');
        
        return new Promise((resolve) => {
            setTimeout(() => {
                this.gameData = window.GameData.init();
                this.updateLoadingProgress(40, '数据加载完成');
                resolve();
            }, 300);
        });
    }

    /**
     * 预加载资源
     */
    async preloadAssets() {
        this.updateLoadingProgress(50, '加载资源...');
        
        const assets = [
            // 这里添加需要预加载的资源
            // 示例：'assets/images/logo.png',
            // 示例：'assets/audio/bgm.mp3'
        ];
        
        return new Promise((resolve) => {
            // 模拟资源加载
            let loaded = 0;
            const total = assets.length || 1;
            
            if (assets.length === 0) {
                this.updateLoadingProgress(80, '资源准备完成');
                setTimeout(resolve, 200);
                return;
            }
            
            assets.forEach((src, index) => {
                const img = new Image();
                img.onload = () => {
                    loaded++;
                    this.updateLoadingProgress(50 + (loaded / total) * 30, `加载资源 ${loaded}/${total}`);
                    if (loaded === total) resolve();
                };
                img.onerror = () => {
                    loaded++;
                    console.warn('[Main] 资源加载失败:', src);
                    if (loaded === total) resolve();
                };
                img.src = src;
            });
        });
    }

    /**
     * 更新加载进度
     * @param {number} progress - 进度 (0-100)
     * @param {string} text - 加载文本
     */
    updateLoadingProgress(progress, text) {
        this.loadingProgress = Math.min(100, Math.max(0, progress));
        
        const progressBar = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');
        
        if (progressBar) {
            progressBar.style.width = `${this.loadingProgress}%`;
        }
        
        if (loadingText) {
            loadingText.textContent = text;
        }
    }

    /**
     * 绑定 UI 事件
     */
    bindEvents() {
        // 开始游戏按钮
        const btnStart = document.getElementById('btn-start');
        if (btnStart) {
            btnStart.addEventListener('click', () => this.startGame());
        }

        // 强化系统按钮
        const btnUpgrade = document.getElementById('btn-upgrade');
        if (btnUpgrade) {
            btnUpgrade.addEventListener('click', () => this.showUpgrade());
        }

        // 补给站按钮
        const btnShop = document.getElementById('btn-shop');
        if (btnShop) {
            btnShop.addEventListener('click', () => this.showShop());
        }

        // 设置按钮
        const btnSettings = document.getElementById('btn-settings');
        if (btnSettings) {
            btnSettings.addEventListener('click', () => this.showSettings());
        }

        console.log('[Main] UI 事件绑定完成');
    }

    /**
     * 更新 UI 显示
     */
    updateUI() {
        if (!this.gameData) return;

        // 更新玩家信息
        const levelEl = document.getElementById('player-level');
        const goldEl = document.getElementById('player-gold');
        const diamondEl = document.getElementById('player-diamond');

        if (levelEl) levelEl.textContent = this.gameData.level;
        if (goldEl) goldEl.textContent = this.gameData.resources.gold.toLocaleString();
        if (diamondEl) diamondEl.textContent = this.gameData.resources.diamond.toLocaleString();

        console.log('[Main] UI 更新完成');
    }

    /**
     * 切换场景
     * @param {string} sceneName - 场景名称
     */
    switchScene(sceneName) {
        // 隐藏所有场景
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById('game-canvas').classList.add('hidden');
        document.getElementById('loading-screen').classList.add('hidden');

        // 显示目标场景
        if (sceneName === 'loading') {
            document.getElementById('loading-screen').classList.remove('hidden');
        } else if (sceneName === 'main-menu') {
            document.getElementById('main-menu').classList.remove('hidden');
        } else if (sceneName === 'game') {
            document.getElementById('game-canvas').classList.remove('hidden');
        }

        this.currentScene = sceneName;
        console.log('[Main] 切换到场景:', sceneName);
    }

    /**
     * 开始游戏
     */
    startGame() {
        console.log('[Main] 开始游戏');
        // 后续章节将实现战斗场景
        alert('战斗系统将在后续章节实装！\n当前版本：v1.0.0');
    }

    /**
     * 显示强化系统
     */
    showUpgrade() {
        console.log('[Main] 打开强化系统');
        alert('强化系统将在章节七实装！\n当前版本：v1.0.0');
    }

    /**
     * 显示补给站
     */
    showShop() {
        console.log('[Main] 打开补给站');
        alert('补给站将在章节十实装！\n当前版本：v1.0.0');
    }

    /**
     * 显示设置
     */
    showSettings() {
        console.log('[Main] 打开设置');
        alert('设置界面将在章节十二实装！\n当前版本：v1.0.0');
    }

    /**
     * 显示错误信息
     * @param {string} message - 错误信息
     */
    showError(message) {
        alert(`❌ ${message}`);
    }
}

// 游戏启动
window.addEventListener('DOMContentLoaded', () => {
    console.log('[Main] DOM 加载完成，启动游戏...');
    window.game = new Main();
    window.game.init();
});
