/**
 * 战斗系统 - Battle System
 * 版本：v3.0.0
 * 功能：玩家控制、射击、敌人 AI、碰撞检测
 */

var Battle = {
    canvas: null,
    ctx: null,
    running: false,
    paused: false,
    
    // 游戏数据
    player: null,
    bullets: [],
    enemies: [],
    particles: [],
    
    // 游戏状态
    wave: 1,
    score: 0,
    baseHP: 100,
    maxBaseHP: 100,
    
    // 生成控制
    enemySpawnTimer: 0,
    enemySpawnInterval: 60,
    
    // 初始化
    init: function() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        window.addEventListener('resize', function() { this.resize(); }.bind(this));
        
        // 玩家炮台
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 100,
            width: 40,
            height: 40,
            angle: -Math.PI / 2,
            shootTimer: 0,
            shootInterval: 15,
            color: '#00f3ff'
        };
        
        // 输入控制
        this.setupControls();
        
        console.log('⚔️ 战斗系统初始化完成 v3.0.0');
    },
    
    // 调整画布大小
    resize: function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.player) {
            this.player.x = this.canvas.width / 2;
            this.player.y = this.canvas.height - 100;
        }
    },
    
    // 设置控制
    setupControls: function() {
        var self = this;
        
        // 鼠标移动
        this.canvas.addEventListener('mousemove', function(e) {
            if (!self.running || self.paused) return;
            var dx = e.clientX - self.player.x;
            var dy = e.clientY - self.player.y;
            self.player.angle = Math.atan2(dy, dx);
        });
        
        // 触摸移动
        this.canvas.addEventListener('touchmove', function(e) {
            if (!self.running || self.paused) return;
            e.preventDefault();
            var touch = e.touches[0];
            var dx = touch.clientX - self.player.x;
            var dy = touch.clientY - self.player.y;
            self.player.angle = Math.atan2(dy, dx);
        }, { passive: false });
        
        // 点击射击
        this.canvas.addEventListener('click', function(e) {
            if (!self.running || self.paused) return;
            self.shoot();
        });
    },
    
    // 射击
    shoot: function() {
        if (this.player.shootTimer > 0) return;
        
        var speed = 15;
        this.bullets.push({
            x: this.player.x,
            y: this.player.y,
            vx: Math.cos(this.player.angle) * speed,
            vy: Math.sin(this.player.angle) * speed,
            radius: 5,
            color: '#00ff88'
        });
        
        this.player.shootTimer = this.player.shootInterval;
    },
    
    // 生成敌人
    spawnEnemy: function() {
        var size = 30 + Math.random() * 20;
        this.enemies.push({
            x: Math.random() * (this.canvas.width - size * 2) + size,
            y: -size,
            width: size,
            height: size,
            speed: 1 + Math.random() * 2 + this.wave * 0.3,
            hp: 1 + Math.floor(this.wave / 3),
            maxHp: 1 + Math.floor(this.wave / 3),
            color: '#ff4444'
        });
    },
    
    // 生成粒子
    spawnParticles: function(x, y, color, count) {
        for (var i = 0; i < count; i++) {
            var angle = Math.random() * Math.PI * 2;
            var speed = Math.random() * 5 + 2;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 30,
                color: color,
                size: Math.random() * 4 + 2
            });
        }
    },
    
    // 更新
    update: function() {
        if (!this.running || this.paused) return;
        
        var self = this;
        
        // 玩家射击冷却
        if (this.player.shootTimer > 0) this.player.shootTimer--;
        
        // 自动射击 (每 0.5 秒)
        if (this.player.shootTimer === 0 && Math.random() < 0.05) {
            this.shoot();
        }
        
        // 生成敌人
        this.enemySpawnTimer++;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }
        
        // 更新子弹
        for (var i = this.bullets.length - 1; i >= 0; i--) {
            var b = this.bullets[i];
            b.x += b.vx;
            b.y += b.vy;
            
            // 移除出界子弹
            if (b.x < 0 || b.x > this.canvas.width || b.y < 0 || b.y > this.canvas.height) {
                this.bullets.splice(i, 1);
            }
        }
        
        // 更新敌人
        for (var i = this.enemies.length - 1; i >= 0; i--) {
            var e = this.enemies[i];
            e.y += e.speed;
            
            // 到达底部，扣基地血量
            if (e.y > this.canvas.height) {
                this.enemies.splice(i, 1);
                this.baseHP -= 10;
                this.updateUI();
                
                if (this.baseHP <= 0) {
                    this.gameOver();
                }
                continue;
            }
            
            // 子弹碰撞检测
            for (var j = this.bullets.length - 1; j >= 0; j--) {
                var b = this.bullets[j];
                var dx = b.x - e.x;
                var dy = b.y - e.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < e.width / 2 + b.radius) {
                    // 命中
                    this.bullets.splice(j, 1);
                    e.hp--;
                    this.spawnParticles(e.x, e.y, e.color, 3);
                    
                    if (e.hp <= 0) {
                        // 敌人死亡
                        this.enemies.splice(i, 1);
                        this.score++;
                        this.spawnParticles(e.x, e.y, '#ff6b35', 8);
                        this.updateUI();
                        
                        // 波次提升
                        if (this.score % 10 === 0) {
                            this.wave++;
                            this.enemySpawnInterval = Math.max(20, 60 - this.wave * 5);
                            this.updateUI();
                        }
                    }
                    break;
                }
            }
        }
        
        // 更新粒子
        for (var i = this.particles.length - 1; i >= 0; i--) {
            var p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.vx *= 0.95;
            p.vy *= 0.95;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    },
    
    // 渲染
    render: function() {
        // 清空画布
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.running) return;
        
        // 绘制玩家
        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);
        this.ctx.rotate(this.player.angle);
        this.ctx.fillStyle = this.player.color;
        this.ctx.beginPath();
        this.ctx.moveTo(20, 0);
        this.ctx.lineTo(-15, -15);
        this.ctx.lineTo(-15, 15);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
        
        // 绘制子弹
        for (var i = 0; i < this.bullets.length; i++) {
            var b = this.bullets[i];
            this.ctx.fillStyle = b.color;
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 绘制敌人
        for (var i = 0; i < this.enemies.length; i++) {
            var e = this.enemies[i];
            this.ctx.fillStyle = e.color;
            this.ctx.fillRect(e.x - e.width / 2, e.y - e.height / 2, e.width, e.height);
            
            // 血条
            var hpPercent = e.hp / e.maxHp;
            this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
            this.ctx.fillRect(e.x - 15, e.y - e.height / 2 - 8, 30, 4);
            this.ctx.fillStyle = hpPercent > 0.5 ? '#00ff88' : '#ff4444';
            this.ctx.fillRect(e.x - 15, e.y - e.height / 2 - 8, 30 * hpPercent, 4);
        }
        
        // 绘制粒子
        for (var i = 0; i < this.particles.length; i++) {
            var p = this.particles[i];
            this.ctx.globalAlpha = p.life / 30;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
    },
    
    // 游戏循环
    gameLoop: function() {
        Battle.update();
        Battle.render();
        requestAnimationFrame(function() { Battle.gameLoop(); });
    },
    
    // 开始游戏
    start: function() {
        this.running = true;
        this.paused = false;
        this.wave = 1;
        this.score = 0;
        this.baseHP = this.maxBaseHP;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.enemySpawnInterval = 60;
        
        document.getElementById('main-menu').classList.remove('active');
        document.getElementById('game-canvas').classList.add('active');
        document.getElementById('battle-ui').classList.add('active');
        document.getElementById('pause-menu').style.display = 'none';
        document.getElementById('gameover-menu').style.display = 'none';
        
        this.updateUI();
        console.log('🎮 战斗开始！');
    },
    
    // 暂停
    pause: function() {
        this.paused = true;
        document.getElementById('pause-menu').style.display = 'flex';
    },
    
    // 继续
    resume: function() {
        this.paused = false;
        document.getElementById('pause-menu').style.display = 'none';
    },
    
    // 游戏结束
    gameOver: function() {
        this.running = false;
        document.getElementById('final-wave').textContent = this.wave;
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('gameover-menu').style.display = 'flex';
        document.getElementById('battle-ui').classList.remove('active');
        console.log('💀 游戏结束 - 波次:', this.wave, '击杀:', this.score);
    },
    
    // 更新 UI
    updateUI: function() {
        document.getElementById('base-hp').style.width = (this.baseHP / this.maxBaseHP * 100) + '%';
        document.getElementById('wave-num').textContent = this.wave;
        document.getElementById('score').textContent = this.score;
    },
    
    // 重启
    restart: function() {
        document.getElementById('pause-menu').style.display = 'none';
        this.start();
    },
    
    // 退出
    quit: function() {
        this.running = false;
        document.getElementById('game-canvas').classList.remove('active');
        document.getElementById('battle-ui').classList.remove('active');
        document.getElementById('pause-menu').style.display = 'none';
        document.getElementById('gameover-menu').style.display = 'none';
        document.getElementById('main-menu').classList.add('active');
    }
};

// 页面加载完成
window.onload = function() {
    Battle.init();
    
    // 绑定按钮事件
    document.getElementById('btn-start').onclick = function() { Battle.start(); };
    document.getElementById('btn-help').onclick = function() { 
        alert('🎮 游戏说明\n\n移动鼠标/手指控制炮台方向\n点击屏幕射击\n阻止敌人到达底部！\n\n版本：v3.0.0');
    };
    document.getElementById('btn-pause').onclick = function() { Battle.pause(); };
    document.getElementById('btn-resume').onclick = function() { Battle.resume(); };
    document.getElementById('btn-restart').onclick = function() { Battle.restart(); };
    document.getElementById('btn-quit').onclick = function() { Battle.quit(); };
    document.getElementById('btn-retry').onclick = function() { Battle.start(); };
    document.getElementById('btn-quit2').onclick = function() { Battle.quit(); };
    
    // 启动游戏循环
    Battle.gameLoop();
    
    console.log('✅ 游戏加载完成 v3.0.0');
};
