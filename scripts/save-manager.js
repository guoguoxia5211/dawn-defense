/**
 * ============================================
 * 存档管理器 - SaveManager
 * 版本：v1.0.0
 * 功能：负责游戏数据的持久化存储
 * ============================================
 */

class SaveManager {
    constructor() {
        this.storageKey = 'dawn_defense_save';
        this.backupKey = 'dawn_defense_save_backup';
        this.version = '1.0.0';
    }

    /**
     * 保存游戏数据
     * @param {Object} data - 要保存的游戏数据
     * @returns {boolean} 保存是否成功
     */
    save(data) {
        try {
            // 添加元数据
            const saveData = {
                version: this.version,
                timestamp: Date.now(),
                data: data
            };

            // 序列化并加密 (Base64 编码)
            const jsonString = JSON.stringify(saveData);
            const encrypted = btoa(unescape(encodeURIComponent(jsonString)));

            // 备份当前存档
            const currentSave = localStorage.getItem(this.storageKey);
            if (currentSave) {
                localStorage.setItem(this.backupKey, currentSave);
            }

            // 保存新数据
            localStorage.setItem(this.storageKey, encrypted);
            
            console.log('[SaveManager] 存档保存成功', saveData);
            return true;
        } catch (error) {
            console.error('[SaveManager] 存档保存失败:', error);
            return false;
        }
    }

    /**
     * 加载游戏数据
     * @returns {Object|null} 加载的游戏数据，失败返回 null
     */
    load() {
        try {
            const encrypted = localStorage.getItem(this.storageKey);
            
            if (!encrypted) {
                console.log('[SaveManager] 未找到存档，将创建新存档');
                return null;
            }

            // 解密并解析
            const jsonString = decodeURIComponent(escape(atob(encrypted)));
            const saveData = JSON.parse(jsonString);

            // 验证版本
            if (saveData.version !== this.version) {
                console.warn('[SaveManager] 存档版本不匹配:', saveData.version, '当前:', this.version);
                // 这里可以添加版本迁移逻辑
            }

            console.log('[SaveManager] 存档加载成功', saveData);
            return saveData.data;
        } catch (error) {
            console.error('[SaveManager] 存档加载失败:', error);
            
            // 尝试从备份恢复
            const backup = localStorage.getItem(this.backupKey);
            if (backup) {
                console.log('[SaveManager] 尝试从备份恢复...');
                try {
                    const jsonString = decodeURIComponent(escape(atob(backup)));
                    const saveData = JSON.parse(jsonString);
                    return saveData.data;
                } catch (backupError) {
                    console.error('[SaveManager] 备份恢复失败:', backupError);
                }
            }
            
            return null;
        }
    }

    /**
     * 删除存档
     * @returns {boolean} 删除是否成功
     */
    delete() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.backupKey);
            console.log('[SaveManager] 存档已删除');
            return true;
        } catch (error) {
            console.error('[SaveManager] 删除存档失败:', error);
            return false;
        }
    }

    /**
     * 检查是否有存档
     * @returns {boolean} 是否存在存档
     */
    hasSave() {
        return localStorage.getItem(this.storageKey) !== null;
    }

    /**
     * 获取存档元数据
     * @returns {Object|null} 存档元数据
     */
    getSaveMeta() {
        try {
            const encrypted = localStorage.getItem(this.storageKey);
            if (!encrypted) return null;

            const jsonString = decodeURIComponent(escape(atob(encrypted)));
            const saveData = JSON.parse(jsonString);

            return {
                version: saveData.version,
                timestamp: saveData.timestamp,
                date: new Date(saveData.timestamp).toLocaleString('zh-CN')
            };
        } catch (error) {
            console.error('[SaveManager] 获取存档元数据失败:', error);
            return null;
        }
    }

    /**
     * 导出存档为 JSON 字符串
     * @returns {string|null} JSON 字符串
     */
    exportSave() {
        try {
            const encrypted = localStorage.getItem(this.storageKey);
            if (!encrypted) return null;

            const jsonString = decodeURIComponent(escape(atob(encrypted)));
            return jsonString;
        } catch (error) {
            console.error('[SaveManager] 导出存档失败:', error);
            return null;
        }
    }

    /**
     * 从 JSON 字符串导入存档
     * @param {string} jsonString - JSON 字符串
     * @returns {boolean} 导入是否成功
     */
    importSave(jsonString) {
        try {
            const saveData = JSON.parse(jsonString);
            const encrypted = btoa(unescape(encodeURIComponent(jsonString)));
            localStorage.setItem(this.storageKey, encrypted);
            console.log('[SaveManager] 存档导入成功');
            return true;
        } catch (error) {
            console.error('[SaveManager] 存档导入失败:', error);
            return false;
        }
    }
}

// 导出单例
window.SaveManager = new SaveManager();
