/**
 * ============================================
 * 主程序入口 - Main
 * 版本：v2.0.0
 * 功能：游戏初始化、场景管理、主界面逻辑
 * ============================================
 */

const Game = {
    init: async function() {
        console.log('🎮 游戏初始化开始 v2.0.0');
        
        try {
            // 加载进度动画
            await this.updateProgress(20, '加载玩家数据...');
            GameData.init();
            
            await this.updateProgress(50, '加载场景资源...');
            Scene.preload('upgrade-screen');
            Scene.preload('shop-screen');
            Scene.preload('settings-screen');
            
            await this.updateProgress(80, '初始化完成');
            await this.updateProgress(100, '启动游戏...');
            
            // 切换到主界面
            setTimeout(() => {
                Scene.switchTo('main-menu');
                GameData.updateUI();
                this.bindEvents();
                console.log('✅ 游戏启动完成 v2.0.0');
            }, 500);
            
        } catch (error) {
            console.error('❌ 初始化失败:', error);
            // 强制显示主界面
            Scene.switchTo('main-menu');
            GameData.updateUI();
            this.bindEvents();
        }
    },
    
    updateProgress: function(percent, text) {
        return new Promise(resolve => {
            const progress = document.getElementById('loading-progress');
            const loadingText = document.getElementById('loading-text');
            if (progress) progress.style.width = percent + '%';
            if (loadingText) loadingText.textContent = text;
            setTimeout(resolve, 200);
        });
    },
    
    bindEvents: function() {
        // 主界面按钮
        const btnStart = document.getElementById('btn-start');
        const btnUpgrade = document.getElementById('btn-upgrade');
        const btnShop = document.getElementById('btn-shop');
        const btnSettings = document.getElementById('btn-settings');
        
        if (btnStart) btnStart.onclick = () => this.startGame();
        if (btnUpgrade) btnUpgrade.onclick = () => Scene.switchTo('upgrade-screen');
        if (btnShop) btnShop.onclick = () => Scene.switchTo('shop-screen');
        if (btnSettings) btnSettings.onclick = () => Scene.switchTo('settings-screen');
        
        console.log('[Main] 按钮事件绑定完成');
    },
    
    startGame: function() {
        alert('🎮 战斗系统开发中！\n\n当前版本：v2.0.0\n章节二已完成\n\n章节三将实装战斗系统');
    }
};

// 游戏启动
window.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
