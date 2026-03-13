/**
 * ============================================
 * 游戏数据结构 - GameData
 * 版本：v1.0.0
 * 功能：定义游戏数据结构和初始化逻辑
 * ============================================
 */

class GameData {
    constructor() {
        this.version = '1.0.0';
        this.data = null;
    }

    /**
     * 创建默认玩家数据
     * @returns {Object} 默认玩家数据
     */
    createDefaultData() {
        return {
            // 玩家基础信息
            playerId: this.generateUUID(),
            playerName: '指挥官',
            level: 1,
            exp: 0,
            maxExp: 100,
            
            // 资源
            resources: {
                gold: 1000,      // 信用点
                diamond: 100,    // 晶体
                skillToken: 10   // 技能点数
            },
            
            // 关卡进度
            progress: {
                maxLevelUnlocked: 1,
                currentLevel: 1,
                bestScore: 0,
                totalKills: 0,
                totalDeaths: 0
            },
            
            // 已解锁技能
            skills: {
                // 格式：{ skillId: { level: 1, unlocked: true } }
            },
            
            // 装备的宝石
            gems: {
                head: null,
                chest: null,
                legs: null,
                boots: null,
                weapon: null
            },
            
            // 设置
            settings: {
                musicVolume: 0.7,
                sfxVolume: 1.0,
                language: 'zh-CN',
                notifications: true
            },
            
            // 统计数据
            stats: {
                playTime: 0,          // 游戏时间 (秒)
                missionsCompleted: 0, // 完成任务数
                highestWave: 0        // 最高波次
            },
            
            // 存档时间
            lastSaveTime: Date.now(),
            createdAt: Date.now()
        };
    }

    /**
     * 生成 UUID
     * @returns {string} UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * 初始化游戏数据
     * @returns {Object} 初始化后的数据
     */
    init() {
        // 尝试加载存档
        const savedData = window.SaveManager.load();
        
        if (savedData) {
            console.log('[GameData] 加载存档成功');
            this.data = savedData;
            
            // 数据迁移和验证
            this.migrateData();
            this.validateData();
        } else {
            console.log('[GameData] 创建新存档');
            this.data = this.createDefaultData();
            this.save();
        }
        
        return this.data;
    }

    /**
     * 保存当前数据
     * @returns {boolean} 保存是否成功
     */
    save() {
        if (!this.data) {
            console.error('[GameData] 没有数据可保存');
            return false;
        }
        
        this.data.lastSaveTime = Date.now();
        const success = window.SaveManager.save(this.data);
        
        if (success) {
            console.log('[GameData] 数据已保存');
        }
        
        return success;
    }

    /**
     * 数据迁移 (处理版本差异)
     */
    migrateData() {
        if (!this.data.version) {
            // v1.0.0 之前的版本迁移逻辑
            console.log('[GameData] 执行数据迁移...');
        }
        
        // 更新版本号
        this.data.version = this.version;
    }

    /**
     * 验证数据完整性
     */
    validateData() {
        const defaultData = this.createDefaultData();
        
        // 检查必填字段
        if (!this.data.playerId) {
            this.data.playerId = defaultData.playerId;
        }
        
        if (!this.data.resources) {
            this.data.resources = defaultData.resources;
        }
        
        // 补充缺失字段
        this.recursiveMerge(defaultData, this.data);
    }

    /**
     * 递归合并对象 (用默认值补充缺失字段)
     * @param {Object} defaultObj - 默认对象
     * @param {Object} targetObj - 目标对象
     */
    recursiveMerge(defaultObj, targetObj) {
        for (const key in defaultObj) {
            if (typeof defaultObj[key] === 'object' && defaultObj[key] !== null) {
                if (!targetObj[key]) {
                    targetObj[key] = defaultObj[key];
                } else {
                    this.recursiveMerge(defaultObj[key], targetObj[key]);
                }
            } else if (targetObj[key] === undefined) {
                targetObj[key] = defaultObj[key];
            }
        }
    }

    /**
     * 获取玩家等级
     * @returns {number} 等级
     */
    getLevel() {
        return this.data.level;
    }

    /**
     * 获取玩家经验
     * @returns {number} 经验值
     */
    getExp() {
        return this.data.exp;
    }

    /**
     * 添加经验
     * @param {number} amount - 经验值
     * @returns {Object} 升级信息 { leveledUp: boolean, newLevel: number }
     */
    addExp(amount) {
        this.data.exp += amount;
        
        let leveledUp = false;
        let newLevel = this.data.level;
        
        while (this.data.exp >= this.data.maxExp) {
            this.data.exp -= this.data.maxExp;
            this.data.level++;
            this.data.maxExp = Math.floor(this.data.maxExp * 1.2);
            leveledUp = true;
            newLevel = this.data.level;
        }
        
        this.save();
        
        return { leveledUp, newLevel };
    }

    /**
     * 获取资源
     * @param {string} type - 资源类型 (gold/diamond/skillToken)
     * @returns {number} 资源数量
     */
    getResource(type) {
        return this.data.resources[type] || 0;
    }

    /**
     * 添加资源
     * @param {string} type - 资源类型
     * @param {number} amount - 数量
     * @returns {boolean} 是否成功
     */
    addResource(type, amount) {
        if (!this.data.resources[type]) {
            console.error('[GameData] 无效的资源类型:', type);
            return false;
        }
        
        this.data.resources[type] += amount;
        this.save();
        return true;
    }

    /**
     * 消耗资源
     * @param {string} type - 资源类型
     * @param {number} amount - 数量
     * @returns {boolean} 是否成功
     */
    consumeResource(type, amount) {
        if (!this.data.resources[type]) {
            console.error('[GameData] 无效的资源类型:', type);
            return false;
        }
        
        if (this.data.resources[type] < amount) {
            console.warn('[GameData] 资源不足:', type, '需要:', amount, '当前:', this.data.resources[type]);
            return false;
        }
        
        this.data.resources[type] -= amount;
        this.save();
        return true;
    }

    /**
     * 获取完整数据
     * @returns {Object} 完整数据
     */
    getAllData() {
        return this.data;
    }

    /**
     * 重置游戏数据 (谨慎使用)
     */
    reset() {
        this.data = this.createDefaultData();
        this.save();
        console.log('[GameData] 数据已重置');
    }
}

// 导出单例
window.GameData = new GameData();
