/**
 * 肉鸽升级系统 v2 - 自动锁定 + 自动射击 + 开局选道具
 * 版本：v3.2.0
 */

var RogueSystem = {
    canvas: null, ctx: null, running: false, paused: false,
    player: null, bullets: [], enemies: [], particles: [],
    wave: 1, score: 0, baseHP: 100, maxBaseHP: 100,
    enemySpawnTimer: 0, enemySpawnInterval: 60,
    
    playerLevel: 1, playerExp: 0, expToNextLevel: 100,
    skillPool: [], selectedSkills: [],
    autoShootTimer: 0,
    lockedEnemy: null,
    
    skills: [
        { id: 'bullet_damage_1', name: '强力子弹 I', icon: '🔫', desc: '子弹伤害 +20%', rarity: 'common', type: 'passive', effect: { damage: 0.2 } },
        { id: 'bullet_damage_2', name: '强力子弹 II', icon: '🔫', desc: '子弹伤害 +40%', rarity: 'rare', type: 'passive', effect: { damage: 0.4 } },
        { id: 'bullet_speed_1', name: '速射子弹 I', icon: '💨', desc: '射击速度 +15%', rarity: 'common', type: 'passive', effect: { fireRate: 0.15 } },
        { id: 'bullet_speed_2', name: '速射子弹 II', icon: '💨', desc: '射击速度 +30%', rarity: 'rare', type: 'passive', effect: { fireRate: 0.3 } },
        { id: 'bullet_pierce_1', name: '穿透子弹 I', icon: '📍', desc: '子弹穿透 +1', rarity: 'rare', type: 'passive', effect: { pierce: 1 } },
        { id: 'bullet_pierce_2', name: '穿透子弹 II', icon: '📍', desc: '子弹穿透 +2', rarity: 'epic', type: 'passive', effect: { pierce: 2 } },
        { id: 'bullet_size', name: '巨型子弹', icon: '🔴', desc: '子弹大小 +50%, 伤害 +30%', rarity: 'rare', type: 'passive', effect: { size: 0.5, damage: 0.3 } },
        { id: 'element_fire', name: '火焰附加', icon: '🔥', desc: '子弹附带燃烧效果，持续伤害', rarity: 'epic', type: 'element', element: 'fire' },
        { id: 'element_ice', name: '寒冰附加', icon: '❄️', desc: '子弹附带减速效果', rarity: 'epic', type: 'element', element: 'ice' },
        { id: 'element_lightning', name: '闪电附加', icon: '⚡', desc: '子弹有几率触发连锁闪电', rarity: 'epic', type: 'element', element: 'lightning' },
        { id: 'skill_wenya', name: '温压弹', icon: '💣', desc: '每 5 秒发射一枚温压弹，造成范围伤害', rarity: 'legendary', type: 'active', cooldown: 300 },
        { id: 'skill_electric', name: '电磁穿刺', icon: '🔷', desc: '发射穿透敌人的电弧', rarity: 'legendary', type: 'active', cooldown: 200 },
        { id: 'skill_vehicle', name: '装甲车', icon: '🚗', desc: '召唤装甲车碾压敌人', rarity: 'legendary', type: 'active', cooldown: 500 },
        { id: 'passive_crit', name: '致命一击', icon: '💀', desc: '暴击率 +10%, 暴击伤害 +50%', rarity: 'epic', type: 'passive', effect: { critRate: 0.1, critDamage: 0.5 } },
        { id: 'passive_gold', name: '幸运金币', icon: '💰', desc: '击杀获得金币 +25%', rarity: 'rare', type: 'passive', effect: { goldBonus: 0.25 } },
        { id: 'passive_hp', name: '生命强化', icon: '❤️', desc: '基地血量上限 +30%', rarity: 'rare', type: 'passive', effect: { maxHP: 0.3 } },
        { id: 'passive_regen', name: '基地修复', icon: '🔧', desc: '基地每秒恢复 1% 血量', rarity: 'epic', type: 'passive', effect: { regen: 0.01 } },
        { id: 'starter_rapid', name: '急速射击', icon: '⚡', desc: '开局射击速度 +50%', rarity: 'rare', type: 'starter', effect: { fireRate: 0.5 } },
        { id: 'starter_damage', name: '强力开局', icon: '💥', desc: '开局伤害 +30%', rarity: 'rare', type: 'starter', effect: { damage: 0.3 } },
        { id: 'starter_hp', name: '坚固防御', icon: '🛡️', desc: '开局基地血量 +50%', rarity: 'rare', type: 'starter', effect: { maxHP: 0.5 } }
    ],
    
    init: function() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', this.resize.bind(this));
        this.player = { x: this.canvas.width/2, y: this.canvas.height-100, angle: -Math.PI/2, shootTimer: 0, shootInterval: 15, color: '#00f3ff', damage: 1, fireRate: 1, pierce: 0, bulletSize: 1 };
        this.skillPool = JSON.parse(JSON.stringify(this.skills));
        console.log('⚔️ 肉鸽系统 v2.0 初始化完成 - 自动锁定 + 自动射击');
    },
    
    resize: function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.player) { this.player.x = this.canvas.width/2; this.player.y = this.canvas.height-100; }
    },
    
    // 查找最近敌人
    findNearestEnemy: function() {
        if (this.enemies.length === 0) return null;
        var nearest = null;
        var minDist = Infinity;
        for (var i = 0; i < this.enemies.length; i++) {
            var e = this.enemies[i];
            var dx = e.x - this.player.x;
            var dy = e.y - this.player.y;
            var dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < minDist) {
                minDist = dist;
                nearest = e;
            }
        }
        return nearest;
    },
    
    // 自动锁定并调整角度
    autoAim: function() {
        var target = this.findNearestEnemy();
        if (target) {
            this.lockedEnemy = target;
            var dx = target.x - this.player.x;
            var dy = target.y - this.player.y;
            var targetAngle = Math.atan2(dy, dx);
            // 平滑转向
            var angleDiff = targetAngle - this.player.angle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            this.player.angle += angleDiff * 0.3;
        }
    },
    
    // 自动射击
    autoShoot: function() {
        if (this.player.shootTimer > 0) return;
        if (this.lockedEnemy) {
            this.shoot();
        }
    },
    
    shoot: function() {
        if (this.player.shootTimer > 0) return;
        var speed = 15;
        this.bullets.push({ 
            x: this.player.x, y: this.player.y, 
            vx: Math.cos(this.player.angle)*speed, vy: Math.sin(this.player.angle)*speed, 
            radius: 5 * this.player.bulletSize, color: '#00ff88',
            damage: this.player.damage, pierce: this.player.pierce, hitCount: 0
        });
        this.player.shootTimer = Math.floor(this.player.shootInterval / this.player.fireRate);
    },
    
    spawnEnemy: function() {
        var size = 30 + Math.random()*20;
        this.enemies.push({ x: Math.random()*(this.canvas.width-size*2)+size, y: -size, width: size, height: size, speed: 1+Math.random()*2+this.wave*0.3, hp: 1+Math.floor(this.wave/3), maxHp: 1+Math.floor(this.wave/3), color: '#ff4444' });
    },
    
    spawnParticles: function(x, y, color, count) {
        for (var i = 0; i < count; i++) {
            var a = Math.random()*Math.PI*2, s = Math.random()*5+2;
            this.particles.push({ x: x, y: y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, life: 30, color: color, size: Math.random()*4+2 });
        }
    },
    
    addExp: function(amount) {
        this.playerExp += amount;
        if (this.playerExp >= this.expToNextLevel) {
            this.playerExp -= this.expToNextLevel;
            this.playerLevel++;
            this.expToNextLevel = Math.floor(this.expToNextLevel * 1.2);
            this.levelUp();
        }
        this.updateExpUI();
    },
    
    levelUp: function() {
        this.paused = true;
        this.showLevelUpModal();
    },
    
    showStartSelect: function() {
        // 显示开局选择弹窗
        var modal = document.getElementById('start-select-modal');
        var cardsContainer = document.getElementById('start-skill-cards');
        cardsContainer.innerHTML = '';
        
        // 从 starter 类型技能中选 3 个
        var starters = this.skills.filter(function(s) { return s.type === 'starter'; });
        var options = starters.sort(function() { return 0.5 - Math.random(); }).slice(0, 3);
        
        var self = this;
        options.forEach(function(skill) {
            var card = document.createElement('div');
            card.className = 'skill-card ' + skill.rarity;
            card.innerHTML = '<div class="skill-icon">' + skill.icon + '</div><div class="skill-name">' + skill.name + '</div><div class="skill-desc">' + skill.desc + '</div><div class="skill-rarity">' + skill.rarity + '</div>';
            card.onclick = function() { self.selectStartSkill(skill); };
            cardsContainer.appendChild(card);
        });
        
        modal.classList.add('active');
    },
    
    selectStartSkill: function(skill) {
        console.log('选择初始技能:', skill.name);
        if (skill.effect) {
            if (skill.effect.damage) this.player.damage *= (1 + skill.effect.damage);
            if (skill.effect.fireRate) this.player.fireRate *= (1 + skill.effect.fireRate);
            if (skill.effect.maxHP) { this.maxBaseHP *= (1 + skill.effect.maxHP); this.baseHP = this.maxBaseHP; }
        }
        this.selectedSkills.push(skill);
        document.getElementById('start-select-modal').classList.remove('active');
        this.startBattle();
    },
    
    showLevelUpModal: function() {
        var modal = document.getElementById('levelup-modal');
        var levelText = document.getElementById('levelup-level');
        var cardsContainer = document.getElementById('skill-cards');
        levelText.textContent = '当前等级：' + this.playerLevel;
        cardsContainer.innerHTML = '';
        
        var options = this.getRandomSkills(3);
        var self = this;
        options.forEach(function(skill) {
            var card = document.createElement('div');
            card.className = 'skill-card ' + skill.rarity;
            card.innerHTML = '<div class="skill-icon">' + skill.icon + '</div><div class="skill-name">' + skill.name + '</div><div class="skill-desc">' + skill.desc + '</div><div class="skill-rarity">' + skill.rarity + '</div>';
            card.onclick = function() { self.selectSkill(skill); };
            cardsContainer.appendChild(card);
        });
        
        modal.classList.add('active');
    },
    
    getRandomSkills: function(count) {
        var shuffled = this.skills.filter(function(s) { return s.type !== 'starter'; }).sort(function() { return 0.5 - Math.random(); });
        return shuffled.slice(0, count);
    },
    
    selectSkill: function(skill) {
        console.log('选择技能:', skill.name);
        if (skill.effect) {
            if (skill.effect.damage) this.player.damage *= (1 + skill.effect.damage);
            if (skill.effect.fireRate) this.player.fireRate *= (1 + skill.effect.fireRate);
            if (skill.effect.pierce) this.player.pierce += skill.effect.pierce;
            if (skill.effect.size) this.player.bulletSize *= (1 + skill.effect.size);
            if (skill.effect.critRate) this.player.critRate = (this.player.critRate || 0) + skill.effect.critRate;
            if (skill.effect.maxHP) { this.maxBaseHP *= (1 + skill.effect.maxHP); this.baseHP = this.maxBaseHP; }
        }
        this.selectedSkills.push(skill);
        document.getElementById('levelup-modal').classList.remove('active');
        this.paused = false;
    },
    
    update: function() {
        if (!this.running || this.paused) return;
        
        // 自动锁定
        this.autoAim();
        
        // 自动射击
        this.autoShootTimer++;
        if (this.autoShootTimer >= 5) {
            this.autoShoot();
            this.autoShootTimer = 0;
        }
        
        if (this.player.shootTimer > 0) this.player.shootTimer--;
        
        this.enemySpawnTimer++;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) { this.spawnEnemy(); this.enemySpawnTimer = 0; }
        
        for (var i = this.bullets.length-1; i >= 0; i--) {
            var b = this.bullets[i]; b.x += b.vx; b.y += b.vy;
            if (b.x < 0 || b.x > this.canvas.width || b.y < 0 || b.y > this.canvas.height) this.bullets.splice(i, 1);
        }
        
        for (var i = this.enemies.length-1; i >= 0; i--) {
            var e = this.enemies[i]; e.y += e.speed;
            if (e.y > this.canvas.height) {
                this.enemies.splice(i, 1); this.baseHP -= 10; this.updateUI();
                if (this.baseHP <= 0) { this.gameOver(); }
                continue;
            }
            for (var j = this.bullets.length-1; j >= 0; j--) {
                var b = this.bullets[j];
                var dx = b.x - e.x, dy = b.y - e.y, dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < e.width/2 + b.radius) {
                    this.bullets.splice(j, 1); e.hp -= b.damage; this.spawnParticles(e.x, e.y, e.color, 3);
                    if (e.hp <= 0) {
                        this.enemies.splice(i, 1); this.score++; this.addExp(10);
                        this.spawnParticles(e.x, e.y, '#ff6b35', 8); this.updateUI();
                        if (this.score % 10 === 0) { this.wave++; this.enemySpawnInterval = Math.max(20, 60-this.wave*5); this.updateUI(); }
                    }
                    break;
                }
            }
        }
        
        for (var i = this.particles.length-1; i >= 0; i--) {
            var p = this.particles[i]; p.x += p.vx; p.y += p.vy; p.life--; p.vx *= 0.95; p.vy *= 0.95;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    },
    
    render: function() {
        this.ctx.fillStyle = 'rgba(10,10,15,0.3)'; this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (!this.running) return;
        
        // 绘制玩家
        this.ctx.save(); this.ctx.translate(this.player.x, this.player.y); this.ctx.rotate(this.player.angle);
        this.ctx.fillStyle = this.player.color; this.ctx.beginPath(); this.ctx.moveTo(20,0); this.ctx.lineTo(-15,-15); this.ctx.lineTo(-15,15); this.ctx.closePath(); this.ctx.fill();
        // 绘制锁定线
        if (this.lockedEnemy) {
            this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(this.lockedEnemy.x - this.player.x, this.lockedEnemy.y - this.player.y);
            this.ctx.stroke();
        }
        this.ctx.restore();
        
        for (var i = 0; i < this.bullets.length; i++) { var b = this.bullets[i]; this.ctx.fillStyle = b.color; this.ctx.beginPath(); this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2); this.ctx.fill(); }
        for (var i = 0; i < this.enemies.length; i++) { var e = this.enemies[i]; this.ctx.fillStyle = e.color; this.ctx.fillRect(e.x-e.width/2, e.y-e.height/2, e.width, e.height); var hp = e.hp/e.maxHp; this.ctx.fillStyle = 'rgba(0,0,0,0.5)'; this.ctx.fillRect(e.x-15, e.y-e.height/2-8, 30, 4); this.ctx.fillStyle = hp > 0.5 ? '#00ff88' : '#ff4444'; this.ctx.fillRect(e.x-15, e.y-e.height/2-8, 30*hp, 4); }
        for (var i = 0; i < this.particles.length; i++) { var p = this.particles[i]; this.ctx.globalAlpha = p.life/30; this.ctx.fillStyle = p.color; this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); this.ctx.fill(); }
        this.ctx.globalAlpha = 1;
    },
    
    gameLoop: function() { this.update(); this.render(); requestAnimationFrame(this.gameLoop.bind(this)); },
    
    startBattle: function() {
        this.running = true; this.paused = false; this.wave = 1; this.score = 0; this.baseHP = this.maxBaseHP;
        this.playerLevel = 1; this.playerExp = 0; this.expToNextLevel = 100;
        this.bullets = []; this.enemies = []; this.particles = []; this.enemySpawnInterval = 60;
        this.selectedSkills = [];
        document.getElementById('main-menu').classList.remove('active');
        document.getElementById('game-canvas').classList.add('active');
        document.getElementById('battle-ui').classList.add('active');
        document.getElementById('pause-menu').style.display = 'none';
        document.getElementById('gameover-menu').style.display = 'none';
        document.getElementById('levelup-modal').classList.remove('active');
        this.updateUI();
        this.updateExpUI();
        console.log('🎮 战斗开始 - 自动锁定模式');
    },
    
    pause: function() { this.paused = true; document.getElementById('pause-menu').style.display = 'flex'; },
    resume: function() { this.paused = false; document.getElementById('pause-menu').style.display = 'none'; },
    
    gameOver: function() {
        this.running = false;
        document.getElementById('final-wave').textContent = this.wave;
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-level').textContent = this.playerLevel;
        document.getElementById('gameover-menu').style.display = 'flex';
        document.getElementById('battle-ui').classList.remove('active');
    },
    
    updateUI: function() {
        document.getElementById('base-hp').style.width = (this.baseHP/this.maxBaseHP*100) + '%';
        document.getElementById('wave-num').textContent = this.wave;
        document.getElementById('score').textContent = this.score;
    },
    
    updateExpUI: function() {
        var percent = (this.playerExp / this.expToNextLevel * 100);
        document.getElementById('exp-fill').style.width = percent + '%';
        document.getElementById('exp-text').textContent = 'LV.' + this.playerLevel + ' ' + Math.floor(this.playerExp) + '/' + this.expToNextLevel;
    },
    
    restart: function() { document.getElementById('pause-menu').style.display = 'none'; document.getElementById('gameover-menu').style.display = 'none'; this.startBattle(); },
    quit: function() { this.running = false; this.canvas.classList.remove('active'); document.getElementById('battle-ui').classList.remove('active'); document.getElementById('pause-menu').style.display = 'none'; document.getElementById('gameover-menu').style.display = 'none'; document.getElementById('levelup-modal').classList.remove('active'); document.getElementById('start-select-modal').classList.remove('active'); Scene.switchTo('main-menu'); }
};
