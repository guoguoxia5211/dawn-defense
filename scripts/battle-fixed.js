/**
 * 战斗系统 - Battle System
 * 版本：v3.0.1
 * 功能：玩家控制、射击、敌人 AI、碰撞检测
 */

var Battle = (function() {
    var canvas, ctx;
    var running = false, paused = false;
    
    // 游戏数据
    var player = null;
    var bullets = [];
    var enemies = [];
    var particles = [];
    
    // 游戏状态
    var wave = 1, score = 0, baseHP = 100, maxBaseHP = 100;
    var enemySpawnTimer = 0, enemySpawnInterval = 60;
    
    // 初始化
    function init() {
        canvas = document.getElementById('game-canvas');
        if (!canvas) {
            console.error('❌ 找不到 canvas 元素');
            return;
        }
        
        ctx = canvas.getContext('2d');
        resize();
        
        window.addEventListener('resize', resize);
        
        // 玩家炮台
        player = {
            x: canvas.width / 2,
            y: canvas.height - 100,
            width: 40,
            height: 40,
            angle: -Math.PI / 2,
            shootTimer: 0,
            shootInterval: 15,
            color: '#00f3ff'
        };
        
        setupControls();
        console.log('⚔️ 战斗系统初始化完成 v3.0.1');
    }
    
    // 调整画布大小
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (player) {
            player.x = canvas.width / 2;
            player.y = canvas.height - 100;
        }
    }
    
    // 设置控制
    function setupControls() {
        canvas.addEventListener('mousemove', function(e) {
            if (!running || paused) return;
            var dx = e.clientX - player.x;
            var dy = e.clientY - player.y;
            player.angle = Math.atan2(dy, dx);
        });
        
        canvas.addEventListener('touchmove', function(e) {
            if (!running || paused) return;
            e.preventDefault();
            var touch = e.touches[0];
            var dx = touch.clientX - player.x;
            var dy = touch.clientY - player.y;
            player.angle = Math.atan2(dy, dx);
        }, { passive: false });
        
        canvas.addEventListener('click', function() {
            if (!running || paused) return;
            shoot();
        });
    }
    
    // 射击
    function shoot() {
        if (player.shootTimer > 0) return;
        
        var speed = 15;
        bullets.push({
            x: player.x,
            y: player.y,
            vx: Math.cos(player.angle) * speed,
            vy: Math.sin(player.angle) * speed,
            radius: 5,
            color: '#00ff88'
        });
        
        player.shootTimer = player.shootInterval;
    }
    
    // 生成敌人
    function spawnEnemy() {
        var size = 30 + Math.random() * 20;
        enemies.push({
            x: Math.random() * (canvas.width - size * 2) + size,
            y: -size,
            width: size,
            height: size,
            speed: 1 + Math.random() * 2 + wave * 0.3,
            hp: 1 + Math.floor(wave / 3),
            maxHp: 1 + Math.floor(wave / 3),
            color: '#ff4444'
        });
    }
    
    // 生成粒子
    function spawnParticles(x, y, color, count) {
        for (var i = 0; i < count; i++) {
            var angle = Math.random() * Math.PI * 2;
            var speed = Math.random() * 5 + 2;
            particles.push({
                x: x, y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 30,
                color: color,
                size: Math.random() * 4 + 2
            });
        }
    }
    
    // 更新
    function update() {
        if (!running || paused) return;
        
        // 玩家射击冷却
        if (player.shootTimer > 0) player.shootTimer--;
        
        // 自动射击
        if (player.shootTimer === 0 && Math.random() < 0.05) shoot();
        
        // 生成敌人
        enemySpawnTimer++;
        if (enemySpawnTimer >= enemySpawnInterval) {
            spawnEnemy();
            enemySpawnTimer = 0;
        }
        
        // 更新子弹
        for (var i = bullets.length - 1; i >= 0; i--) {
            var b = bullets[i];
            b.x += b.vx;
            b.y += b.vy;
            
            if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
                bullets.splice(i, 1);
            }
        }
        
        // 更新敌人
        for (var i = enemies.length - 1; i >= 0; i--) {
            var e = enemies[i];
            e.y += e.speed;
            
            if (e.y > canvas.height) {
                enemies.splice(i, 1);
                baseHP -= 10;
                updateUI();
                
                if (baseHP <= 0) {
                    gameOver();
                }
                continue;
            }
            
            // 子弹碰撞
            for (var j = bullets.length - 1; j >= 0; j--) {
                var b = bullets[j];
                var dx = b.x - e.x;
                var dy = b.y - e.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < e.width / 2 + b.radius) {
                    bullets.splice(j, 1);
                    e.hp--;
                    spawnParticles(e.x, e.y, e.color, 3);
                    
                    if (e.hp <= 0) {
                        enemies.splice(i, 1);
                        score++;
                        spawnParticles(e.x, e.y, '#ff6b35', 8);
                        updateUI();
                        
                        if (score % 10 === 0) {
                            wave++;
                            enemySpawnInterval = Math.max(20, 60 - wave * 5);
                            updateUI();
                        }
                    }
                    break;
                }
            }
        }
        
        // 更新粒子
        for (var i = particles.length - 1; i >= 0; i--) {
            var p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.vx *= 0.95;
            p.vy *= 0.95;
            
            if (p.life <= 0) particles.splice(i, 1);
        }
    }
    
    // 渲染
    function render() {
        ctx.fillStyle = 'rgba(10, 10, 15, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (!running) return;
        
        // 绘制玩家
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle);
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(-15, -15);
        ctx.lineTo(-15, 15);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        
        // 绘制子弹
        for (var i = 0; i < bullets.length; i++) {
            var b = bullets[i];
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 绘制敌人
        for (var i = 0; i < enemies.length; i++) {
            var e = enemies[i];
            ctx.fillStyle = e.color;
            ctx.fillRect(e.x - e.width / 2, e.y - e.height / 2, e.width, e.height);
            
            var hpPercent = e.hp / e.maxHp;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(e.x - 15, e.y - e.height / 2 - 8, 30, 4);
            ctx.fillStyle = hpPercent > 0.5 ? '#00ff88' : '#ff4444';
            ctx.fillRect(e.x - 15, e.y - e.height / 2 - 8, 30 * hpPercent, 4);
        }
        
        // 绘制粒子
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            ctx.globalAlpha = p.life / 30;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
    
    // 游戏循环
    function gameLoop() {
        update();
        render();
        requestAnimationFrame(gameLoop);
    }
    
    // 开始游戏
    function start() {
        running = true;
        paused = false;
        wave = 1;
        score = 0;
        baseHP = maxBaseHP;
        bullets = [];
        enemies = [];
        particles = [];
        enemySpawnInterval = 60;
        
        document.getElementById('main-menu').style.display = 'none';
        canvas.classList.add('active');
        document.getElementById('battle-ui').classList.add('active');
        document.getElementById('pause-menu').style.display = 'none';
        document.getElementById('gameover-menu').style.display = 'none';
        
        updateUI();
        console.log('🎮 战斗开始！');
    }
    
    // 暂停
    function pause() {
        paused = true;
        document.getElementById('pause-menu').style.display = 'flex';
    }
    
    // 继续
    function resume() {
        paused = false;
        document.getElementById('pause-menu').style.display = 'none';
    }
    
    // 游戏结束
    function gameOver() {
        running = false;
        document.getElementById('final-wave').textContent = wave;
        document.getElementById('final-score').textContent = score;
        document.getElementById('gameover-menu').style.display = 'flex';
        document.getElementById('battle-ui').classList.remove('active');
        console.log('💀 游戏结束 - 波次:', wave, '击杀:', score);
    }
    
    // 更新 UI
    function updateUI() {
        document.getElementById('base-hp').style.width = (baseHP / maxBaseHP * 100) + '%';
        document.getElementById('wave-num').textContent = wave;
        document.getElementById('score').textContent = score;
    }
    
    // 重启
    function restart() {
        document.getElementById('pause-menu').style.display = 'none';
        start();
    }
    
    // 退出
    function quit() {
        running = false;
        canvas.classList.remove('active');
        document.getElementById('battle-ui').classList.remove('active');
        document.getElementById('pause-menu').style.display = 'none';
        document.getElementById('gameover-menu').style.display = 'none';
        document.getElementById('main-menu').style.display = 'flex';
    }
    
    // 公开接口
    return {
        init: init,
        start: start,
        pause: pause,
        resume: resume,
        restart: restart,
        quit: quit
    };
})();

// 页面加载完成
window.onload = function() {
    try {
        Battle.init();
        
        // 绑定按钮
        document.getElementById('btn-start').onclick = function() { Battle.start(); };
        document.getElementById('btn-help').onclick = function() { 
            alert('🎮 游戏说明\n\n移动鼠标/手指控制炮台方向\n自动射击\n阻止敌人到达底部！\n\n版本：v3.0.1');
        };
        document.getElementById('btn-pause').onclick = function() { Battle.pause(); };
        document.getElementById('btn-resume').onclick = function() { Battle.resume(); };
        document.getElementById('btn-restart').onclick = function() { Battle.restart(); };
        document.getElementById('btn-quit').onclick = function() { Battle.quit(); };
        document.getElementById('btn-retry').onclick = function() { Battle.start(); };
        document.getElementById('btn-quit2').onclick = function() { Battle.quit(); };
        
        console.log('✅ 游戏加载完成 v3.0.1');
    } catch (e) {
        console.error('❌ 初始化失败:', e);
        alert('游戏加载失败：' + e.message);
    }
};
