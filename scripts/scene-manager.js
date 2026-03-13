/**
 * ============================================
 * 场景管理器 - SceneManager
 * 版本：v2.0.0
 * 功能：场景切换、动画、管理
 * ============================================
 */

const Scene = {
    currentScene: 'loading',
    history: [],
    
    // 切换到指定场景
    switchTo: function(sceneId) {
        console.log('[Scene] 切换到:', sceneId);
        
        // 记录历史
        if (this.currentScene !== sceneId) {
            this.history.push(this.currentScene);
        }
        
        // 隐藏所有场景
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 显示目标场景
        const target = document.getElementById(sceneId);
        if (target) {
            target.classList.add('active');
            this.currentScene = sceneId;
            
            // 触发自定义事件
            window.dispatchEvent(new CustomEvent('sceneChange', { 
                detail: { from: this.history[this.history.length - 1], to: sceneId } 
            }));
        } else {
            console.error('[Scene] 场景不存在:', sceneId);
        }
    },
    
    // 返回上一个场景
    back: function() {
        if (this.history.length > 0) {
            const prevScene = this.history.pop();
            this.switchTo(prevScene);
        } else {
            console.warn('[Scene] 没有历史记录');
        }
    },
    
    // 重置历史
    resetHistory: function() {
        this.history = [];
    },
    
    // 预加载场景资源
    preload: function(sceneId) {
        console.log('[Scene] 预加载:', sceneId);
        // 这里可以添加资源预加载逻辑
    }
};

// 绑定返回按钮事件
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => Scene.back());
    });
});
