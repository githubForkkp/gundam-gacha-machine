import { prizePool, prizePoolById } from './gacha_data.js';

/**
 * 高达抽卡游戏主程序
 * 功能包括：单次/十连抽卡、物品收集、统计信息、设置管理、音效系统等
 */
// ==================== 全局错误处理 ====================
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
    showNotification('游戏遇到错误，请刷新页面', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
    showNotification('游戏遇到异步错误', 'error');
});

document.addEventListener('DOMContentLoaded', () => {

    // ==================== DOM元素引用 ====================
    const tokenBalanceEl = document.getElementById('token-balance');
    const singlePullBtn = document.getElementById('single-pull-btn');
    const tenPullBtn = document.getElementById('ten-pull-btn');
    const hangarBtn = document.getElementById('hangar-btn');
    const shopBtn = document.getElementById('shop-btn');
    const achievementsBtn = document.getElementById('achievements-btn');

    const resultModal = document.getElementById('result-modal');
    const modalBody = document.getElementById('modal-body');
    const closeResultModalBtn = document.getElementById('close-result-modal-btn');

    const hangarModal = document.getElementById('hangar-modal');
    const hangarBody = document.getElementById('hangar-body');
    const closeHangarModalBtn = document.getElementById('close-hangar-modal-btn');

    const shopModal = document.getElementById('shop-modal');
    const shopBody = document.getElementById('shop-body');
    const closeShopModalBtn = document.getElementById('close-shop-modal-btn');

    const achievementsModal = document.getElementById('achievements-modal');
    const achievementsBody = document.getElementById('achievements-body');
    const closeAchievementsModalBtn = document.getElementById('close-achievements-modal-btn');

    const statsBtn = document.getElementById('stats-btn');
    const statsModal = document.getElementById('stats-modal');
    const statsBody = document.getElementById('stats-body');
    const closeStatsModalBtn = document.getElementById('close-stats-modal-btn');

    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModalBtn = document.getElementById('close-settings-modal-btn');
    const soundToggle = document.getElementById('sound-toggle');
    const animationToggle = document.getElementById('animation-toggle');
    const signinToggle = document.getElementById('signin-toggle');
    const resetDataBtn = document.getElementById('reset-data-btn');
    const testSoundBtn = document.getElementById('test-sound-btn');

    // ==================== 游戏状态变量 ====================
    let tokens = 1000; // 代币数量
    let collection = {}; // 收集的物品 {itemId: count}
    let stats = {
        totalPulls: 0,      // 总抽取次数
        singlePulls: 0,     // 单次抽取次数
        tenPulls: 0,        // 十连抽取次数
        ssrCount: 0,        // SSR物品数量
        srCount: 0,         // SR物品数量
        rCount: 0,          // R物品数量
        nCount: 0,          // N物品数量
        lastSignIn: null,   // 最后签到日期
        totalTokensSpent: 0, // 总花费代币
        totalTokensEarned: 0 // 总获得代币
    };

    // ==================== 商店物品配置 ====================
    const shopItems = [
        {
            id: 'tokens_100',
            name: '代币包（小）',
            description: '获得100代币',
            price: 0, // 免费
            type: 'tokens',
            value: 100,
            dailyLimit: 1,
            icon: '💰'
        },
        {
            id: 'tokens_500',
            name: '代币包（中）',
            description: '获得500代币',
            price: 50, // 需要50代币购买（通过观看广告等方式获得）
            type: 'tokens',
            value: 500,
            dailyLimit: 3,
            icon: '💎'
        },
        {
            id: 'single_pull_discount',
            name: '单抽折扣券',
            description: '单次抽取只需50代币',
            price: 200,
            type: 'discount',
            value: 50, // 折扣后价格
            dailyLimit: 5,
            icon: '🎫'
        },
        {
            id: 'ten_pull_discount',
            name: '十连折扣券',
            description: '十连抽取只需800代币',
            price: 500,
            type: 'discount',
            value: 800, // 折扣后价格
            dailyLimit: 2,
            icon: '🎟️'
        },
        {
            id: 'ssr_guarantee',
            name: 'SSR保底券',
            description: '下次十连必出SSR',
            price: 2000,
            type: 'guarantee',
            value: 'ssr',
            dailyLimit: 1,
            icon: '⭐'
        }
    ];

    // ==================== 成就系统配置 ====================
    const achievements = [
        {
            id: 'first_pull',
            name: '初次抽取',
            description: '完成第一次抽取',
            condition: (stats) => stats.totalPulls >= 1,
            reward: { tokens: 100 },
            icon: '🎯',
            completed: false
        },
        {
            id: 'ten_pulls',
            name: '抽取达人',
            description: '完成10次抽取',
            condition: (stats) => stats.totalPulls >= 10,
            reward: { tokens: 200 },
            icon: '🎮',
            completed: false
        },
        {
            id: 'hundred_pulls',
            name: '抽取大师',
            description: '完成100次抽取',
            condition: (stats) => stats.totalPulls >= 100,
            reward: { tokens: 1000 },
            icon: '🏆',
            completed: false
        },
        {
            id: 'first_ssr',
            name: '传说收集者',
            description: '获得第一个SSR机体',
            condition: (stats) => stats.ssrCount >= 1,
            reward: { tokens: 500 },
            icon: '⭐',
            completed: false
        },
        {
            id: 'ten_ssr',
            name: 'SSR收藏家',
            description: '收集10个SSR机体',
            condition: (stats) => stats.ssrCount >= 10,
            reward: { tokens: 2000 },
            icon: '🌟',
            completed: false
        },
        {
            id: 'daily_signin_7',
            name: '坚持不懈',
            description: '连续签到7天',
            condition: (stats) => stats.consecutiveSignIns >= 7,
            reward: { tokens: 700 },
            icon: '📅',
            completed: false
        },
        {
            id: 'collector_50',
            name: '机体收藏家',
            description: '收集50种不同机体',
            condition: (stats, collection) => Object.keys(collection).length >= 50,
            reward: { tokens: 1500 },
            icon: '🏛️',
            completed: false
        }
    ];
    
    // ==================== 游戏设置 ====================
    let settings = {
        soundEnabled: true,      // 音效开关
        animationEnabled: true,  // 动画开关
        signinReminder: true,    // 签到提醒开关
        bgMusicEnabled: true     // 背景音乐开关
    };

    // ==================== 游戏状态 ====================
    let purchasedItems = {}; // 已购买的商店物品 {itemId: {count: number, lastPurchase: date}}
    let completedAchievements = []; // 已完成的成就ID列表
    let guaranteeNextSSR = false; // 下次十连是否保底SSR
    
    // ==================== 音效系统 ====================
    let audioContext = null; // 音频上下文
    let bgMusic = null; // 背景音乐对象
    let bgMusicEnabled = true; // 背景音乐开关
    
    /**
     * 初始化音频上下文
     * @returns {AudioContext|null} 音频上下文对象，失败时返回null
     */
    const initAudioContext = () => {
        if (!audioContext) {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('AudioContext初始化成功');
            } catch (error) {
                console.log('AudioContext初始化失败:', error);
            }
        }
        return audioContext;
    };

    /**
     * 创建激情动感的高达经典背景音乐
     * 基于《翔べ！ガンダム》(飞翔吧！高达) 的经典旋律
     */
    const createGundamBGM = () => {
        if (!bgMusicEnabled) return;

        try {
            const ctx = initAudioContext();
            if (!ctx) return;

            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            // 主旋律 - 基于《翔べ！ガンダム》的激情旋律
            const createMainMelody = () => {
                const melodyNotes = [
                    // 开场：激昂的上升旋律 "燃え上がれ〜"
                    { freq: 440.00, duration: 0.3, type: 'sawtooth', volume: 0.02 },   // A4
                    { freq: 493.88, duration: 0.3, type: 'sawtooth', volume: 0.025 },  // B4
                    { freq: 523.25, duration: 0.4, type: 'sawtooth', volume: 0.03 },   // C5
                    { freq: 587.33, duration: 0.4, type: 'sawtooth', volume: 0.035 },  // D5
                    { freq: 659.25, duration: 0.6, type: 'sawtooth', volume: 0.04 },   // E5

                    // 第一段主题："ガンダム〜"
                    { freq: 783.99, duration: 0.4, type: 'sawtooth', volume: 0.045 },  // G5
                    { freq: 880.00, duration: 0.4, type: 'sawtooth', volume: 0.05 },   // A5
                    { freq: 987.77, duration: 0.6, type: 'sawtooth', volume: 0.055 },  // B5
                    { freq: 1046.50, duration: 0.8, type: 'sawtooth', volume: 0.06 },  // C6

                    // 激情高潮："君よ走れ〜"
                    { freq: 1174.66, duration: 0.3, type: 'sawtooth', volume: 0.065 }, // D6
                    { freq: 1318.51, duration: 0.3, type: 'sawtooth', volume: 0.07 },  // E6
                    { freq: 1396.91, duration: 0.4, type: 'sawtooth', volume: 0.075 }, // F6
                    { freq: 1567.98, duration: 0.6, type: 'sawtooth', volume: 0.08 },  // G6
                    { freq: 1760.00, duration: 0.8, type: 'sawtooth', volume: 0.085 }, // A6

                    // 回落与重复："立て！立て！立て！"
                    { freq: 1318.51, duration: 0.2, type: 'sawtooth', volume: 0.06 },  // E6
                    { freq: 1174.66, duration: 0.2, type: 'sawtooth', volume: 0.055 }, // D6
                    { freq: 1046.50, duration: 0.2, type: 'sawtooth', volume: 0.05 },  // C6
                    { freq: 987.77, duration: 0.3, type: 'sawtooth', volume: 0.045 },  // B5
                    { freq: 880.00, duration: 0.4, type: 'sawtooth', volume: 0.04 },   // A5

                    // 结尾的英雄气概
                    { freq: 1046.50, duration: 0.4, type: 'sawtooth', volume: 0.05 },  // C6
                    { freq: 1318.51, duration: 0.4, type: 'sawtooth', volume: 0.06 },  // E6
                    { freq: 1567.98, duration: 0.6, type: 'sawtooth', volume: 0.07 },  // G6
                    { freq: 2093.00, duration: 1.0, type: 'sawtooth', volume: 0.08 },  // C7
                ];
                
                let currentTime = 0;
                melodyNotes.forEach((note, index) => {
                    setTimeout(() => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        const filter = ctx.createBiquadFilter();
                        const delay = ctx.createDelay();
                        const feedback = ctx.createGain();
                        
                        // 创建延迟效果
                        delay.delayTime.setValueAtTime(0.3, ctx.currentTime);
                        feedback.gain.setValueAtTime(0.3, ctx.currentTime);
                        
                        osc.connect(filter);
                        filter.connect(gain);
                        gain.connect(delay);
                        delay.connect(feedback);
                        feedback.connect(delay);
                        delay.connect(ctx.destination);
                        gain.connect(ctx.destination);
                        
                        osc.frequency.setValueAtTime(note.freq, ctx.currentTime);
                        osc.type = note.type;
                        
                        // 动态滤波器
                        filter.type = 'lowpass';
                        filter.frequency.setValueAtTime(2000 + note.freq * 0.5, ctx.currentTime);
                        filter.Q.setValueAtTime(2, ctx.currentTime);
                        
                        // 动态音量包络 - 使用note.volume参数
                        gain.gain.setValueAtTime(0, ctx.currentTime);
                        gain.gain.linearRampToValueAtTime(note.volume, ctx.currentTime + 0.02);
                        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.duration);
                        
                        osc.start(ctx.currentTime);
                        osc.stop(ctx.currentTime + note.duration);
                    }, currentTime * 1000);
                    currentTime += note.duration;
                });
            };
            
            // 激情和声轨道 - 模拟管弦乐团的宏大感
            const createHarmony = () => {
                const harmonyChords = [
                    [261.63, 329.63, 392.00, 523.25], // C大调七和弦 - 雄壮开场
                    [293.66, 369.99, 440.00, 587.33], // D小调七和弦 - 深沉力量
                    [329.63, 415.30, 493.88, 659.25], // E小调七和弦 - 英雄气概
                    [392.00, 493.88, 587.33, 783.99], // G大调七和弦 - 胜利凯歌
                ];
                
                harmonyChords.forEach((chord, chordIndex) => {
                    setTimeout(() => {
                        chord.forEach((freq) => {
                            const osc = ctx.createOscillator();
                            const gain = ctx.createGain();
                            const filter = ctx.createBiquadFilter();
                            const compressor = ctx.createDynamicsCompressor();

                            // 创建更丰富的音色链
                            osc.connect(filter);
                            filter.connect(compressor);
                            compressor.connect(gain);
                            gain.connect(ctx.destination);

                            osc.frequency.setValueAtTime(freq, ctx.currentTime);
                            osc.type = 'sawtooth'; // 使用锯齿波获得更厚重的音色

                            // 动态滤波器模拟弦乐的表现力
                            filter.type = 'lowpass';
                            filter.frequency.setValueAtTime(freq * 1.5, ctx.currentTime);
                            filter.frequency.exponentialRampToValueAtTime(freq * 3, ctx.currentTime + 0.4);
                            filter.frequency.exponentialRampToValueAtTime(freq * 1.2, ctx.currentTime + 1.6);
                            filter.Q.setValueAtTime(1.8, ctx.currentTime);

                            // 压缩器设置增加冲击力
                            compressor.threshold.setValueAtTime(-20, ctx.currentTime);
                            compressor.knee.setValueAtTime(25, ctx.currentTime);
                            compressor.ratio.setValueAtTime(8, ctx.currentTime);

                            // 渐强的音量包络
                            const baseVolume = 0.012 + (chordIndex * 0.003); // 逐渐增强
                            gain.gain.setValueAtTime(0, ctx.currentTime);
                            gain.gain.linearRampToValueAtTime(baseVolume, ctx.currentTime + 0.1);
                            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6);

                            osc.start(ctx.currentTime);
                            osc.stop(ctx.currentTime + 1.6);
                        });
                    }, chordIndex * 1600);
                });
            };
            
            // 强力低音轨道 - 提供震撼的节奏基础
            const createBass = () => {
                const bassLine = [
                    { freq: 65.41, duration: 0.8, volume: 0.08 },  // C2 - 深沉开场
                    { freq: 73.42, duration: 0.8, volume: 0.075 }, // D2
                    { freq: 82.41, duration: 0.8, volume: 0.08 },  // E2
                    { freq: 87.31, duration: 0.8, volume: 0.085 }, // F2 - 强力支撑
                    { freq: 98.00, duration: 0.8, volume: 0.09 },  // G2
                    { freq: 110.00, duration: 0.8, volume: 0.095 }, // A2
                    { freq: 123.47, duration: 0.8, volume: 0.1 },  // B2
                    { freq: 130.81, duration: 0.8, volume: 0.105 }, // C3 - 高潮
                ];
                
                let currentTime = 0;
                bassLine.forEach((note, index) => {
                    setTimeout(() => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        const filter = ctx.createBiquadFilter();
                        
                        osc.connect(filter);
                        filter.connect(gain);
                        gain.connect(ctx.destination);
                        
                        osc.frequency.setValueAtTime(note.freq, ctx.currentTime);
                        osc.type = 'sawtooth';
                        
                        // 低通滤波器增强低音质感
                        filter.type = 'lowpass';
                        filter.frequency.setValueAtTime(note.freq * 3, ctx.currentTime);
                        filter.Q.setValueAtTime(0.5, ctx.currentTime);
                        
                        // 使用note.volume参数
                        gain.gain.setValueAtTime(0, ctx.currentTime);
                        gain.gain.linearRampToValueAtTime(note.volume, ctx.currentTime + 0.05);
                        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.duration);
                        
                        osc.start(ctx.currentTime);
                        osc.stop(ctx.currentTime + note.duration);
                    }, currentTime * 1000);
                    currentTime += note.duration;
                });
            };
            
            // 鼓点轨道 - 更复杂的节奏模式
            const createDrums = () => {
                const drumPattern = [
                    { time: 0, type: 'kick' },
                    { time: 0.4, type: 'snare' },
                    { time: 0.8, type: 'kick' },
                    { time: 1.2, type: 'snare' },
                    { time: 1.6, type: 'kick' },
                    { time: 2.0, type: 'snare' },
                    { time: 2.4, type: 'kick' },
                    { time: 2.8, type: 'snare' },
                    { time: 3.2, type: 'kick' },
                    { time: 3.6, type: 'snare' },
                    { time: 4.0, type: 'kick' },
                    { time: 4.4, type: 'snare' },
                    { time: 4.8, type: 'kick' },
                    { time: 5.2, type: 'snare' },
                    { time: 5.6, type: 'kick' },
                    { time: 6.0, type: 'snare' },
                    { time: 6.4, type: 'kick' },
                    { time: 6.8, type: 'snare' },
                ];
                
                drumPattern.forEach((drum, index) => {
                    setTimeout(() => {
                        if (drum.type === 'kick') {
                            // 底鼓
                            const osc = ctx.createOscillator();
                            const gain = ctx.createGain();
                            
                            osc.connect(gain);
                            gain.connect(ctx.destination);
                            
                            osc.frequency.setValueAtTime(80, ctx.currentTime);
                            osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.1);
                            osc.type = 'sine';
                            
                            gain.gain.setValueAtTime(0.08, ctx.currentTime);
                            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
                            
                            osc.start(ctx.currentTime);
                            osc.stop(ctx.currentTime + 0.1);
                        } else if (drum.type === 'snare') {
                            // 军鼓
                            const osc = ctx.createOscillator();
                            const gain = ctx.createGain();
                            const noise = ctx.createOscillator();
                            const noiseGain = ctx.createGain();
                            
                            osc.connect(gain);
                            noise.connect(noiseGain);
                            gain.connect(ctx.destination);
                            noiseGain.connect(ctx.destination);
                            
                            osc.frequency.setValueAtTime(200, ctx.currentTime);
                            osc.type = 'triangle';
                            
                            noise.frequency.setValueAtTime(1000, ctx.currentTime);
                            noise.type = 'sawtooth';
                            
                            gain.gain.setValueAtTime(0.04, ctx.currentTime);
                            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
                            
                            noiseGain.gain.setValueAtTime(0.02, ctx.currentTime);
                            noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
                            
                            osc.start(ctx.currentTime);
                            osc.stop(ctx.currentTime + 0.1);
                            noise.start(ctx.currentTime);
                            noise.stop(ctx.currentTime + 0.1);
                        }
                    }, drum.time * 1000);
                });
            };
            
            // 机甲音效轨道 - 添加高达特色的机械音效
            const createMechSounds = () => {
                const mechEffects = [
                    { time: 0.2, type: 'servo' },
                    { time: 1.0, type: 'hydraulic' },
                    { time: 2.2, type: 'servo' },
                    { time: 3.0, type: 'hydraulic' },
                    { time: 4.2, type: 'servo' },
                    { time: 5.0, type: 'hydraulic' },
                    { time: 6.2, type: 'servo' },
                    { time: 7.0, type: 'hydraulic' },
                ];
                
                mechEffects.forEach((effect, index) => {
                    setTimeout(() => {
                        if (effect.type === 'servo') {
                            // 伺服电机音效
                            const osc = ctx.createOscillator();
                            const gain = ctx.createGain();
                            const filter = ctx.createBiquadFilter();
                            
                            osc.connect(filter);
                            filter.connect(gain);
                            gain.connect(ctx.destination);
                            
                            osc.frequency.setValueAtTime(800, ctx.currentTime);
                            osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.2);
                            osc.type = 'square';
                            
                            filter.type = 'bandpass';
                            filter.frequency.setValueAtTime(600, ctx.currentTime);
                            filter.Q.setValueAtTime(5, ctx.currentTime);
                            
                            gain.gain.setValueAtTime(0.01, ctx.currentTime);
                            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
                            
                            osc.start(ctx.currentTime);
                            osc.stop(ctx.currentTime + 0.2);
                        } else if (effect.type === 'hydraulic') {
                            // 液压系统音效
                            const osc = ctx.createOscillator();
                            const gain = ctx.createGain();
                            const filter = ctx.createBiquadFilter();
                            
                            osc.connect(filter);
                            filter.connect(gain);
                            gain.connect(ctx.destination);
                            
                            osc.frequency.setValueAtTime(120, ctx.currentTime);
                            osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.3);
                            osc.type = 'sawtooth';
                            
                            filter.type = 'lowpass';
                            filter.frequency.setValueAtTime(200, ctx.currentTime);
                            filter.Q.setValueAtTime(2, ctx.currentTime);
                            
                            gain.gain.setValueAtTime(0.015, ctx.currentTime);
                            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                            
                            osc.start(ctx.currentTime);
                            osc.stop(ctx.currentTime + 0.3);
                        }
                    }, effect.time * 1000);
                });
            };
            
            // 播放所有轨道
            createMainMelody();
            setTimeout(createHarmony, 200);
            setTimeout(createBass, 400);
            setTimeout(createDrums, 600);
            setTimeout(createMechSounds, 800);
            
        } catch (error) {
            console.log('背景音乐播放失败:', error);
        }
    };

    /**
     * 播放背景音乐
     * 循环播放高达风格的背景音乐
     */
    const playBGM = () => {
        if (!bgMusicEnabled) return;
        
        createGundamBGM();
        
        // 每8秒循环一次背景音乐
        setTimeout(() => {
            if (bgMusicEnabled) {
                playBGM();
            }
        }, 8000);
    };

    /**
     * 停止背景音乐
     */
    const stopBGM = () => {
        bgMusicEnabled = false;
    };

    /**
     * 播放音效
     * @param {string} type - 音效类型 ('pull' | 'rare' | 'ssr')
     * pull: 抽取音效 - 短促的上升音调
     * rare: 稀有物品音效 - 欢快的和弦
     * ssr: SSR物品音效 - 史诗级音效
     */
    const playSound = (type) => {
        if (!settings.soundEnabled) return;
        
        try {
            const ctx = initAudioContext();
            if (!ctx) {
                console.log('AudioContext不可用');
                return;
            }
            
            // 如果AudioContext被暂停，需要恢复
            if (ctx.state === 'suspended') {
                ctx.resume();
            }
            
            if (type === 'pull') {
                // 抽取音效 - 高达光束剑启动音效风格
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                const filter = ctx.createBiquadFilter();
                const distortion = ctx.createWaveShaper();

                // 创建轻微失真效果模拟能量充电声
                const makeDistortionCurve = (amount) => {
                    const samples = 44100;
                    const curve = new Float32Array(samples);
                    for (let i = 0; i < samples; i++) {
                        const x = (i * 2) / samples - 1;
                        curve[i] = ((3 + amount) * x * 20) / (Math.PI + amount * Math.abs(x));
                    }
                    return curve;
                };

                distortion.curve = makeDistortionCurve(0.8);
                distortion.oversample = '2x';

                oscillator.connect(distortion);
                distortion.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(ctx.destination);

                oscillator.type = 'sawtooth';
                // 模拟光束剑的"嗡嗡"声 - 从低频到高频再回落
                oscillator.frequency.setValueAtTime(150, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
                oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.4);

                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(800, ctx.currentTime);
                filter.frequency.exponentialRampToValueAtTime(2500, ctx.currentTime + 0.2);
                filter.Q.setValueAtTime(3, ctx.currentTime);

                gainNode.gain.setValueAtTime(0, ctx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.4);
                
            } else if (type === 'rare') {
                // 稀有物品音效 - 高达雷达锁定/警报音效风格
                const frequencies = [440, 554, 659, 880, 1109]; // A4, C#5, E5, A5, C#6 - 和谐的五度音程
                frequencies.forEach((freq, index) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    const filter = ctx.createBiquadFilter();
                    const delay = ctx.createDelay();
                    const feedback = ctx.createGain();

                    // 创建回声效果模拟雷达扫描
                    delay.delayTime.setValueAtTime(0.15, ctx.currentTime);
                    feedback.gain.setValueAtTime(0.4, ctx.currentTime);

                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(delay);
                    delay.connect(feedback);
                    feedback.connect(delay);
                    delay.connect(ctx.destination);
                    gain.connect(ctx.destination);

                    osc.frequency.setValueAtTime(freq, ctx.currentTime);
                    osc.type = 'square'; // 使用方波模拟电子警报声

                    // 动态滤波器模拟雷达扫描效果
                    filter.type = 'bandpass';
                    filter.frequency.setValueAtTime(freq * 0.8, ctx.currentTime);
                    filter.frequency.exponentialRampToValueAtTime(freq * 2.5, ctx.currentTime + 0.3);
                    filter.Q.setValueAtTime(6, ctx.currentTime);

                    // 脉冲式音量包络
                    const baseVolume = 0.05 + (index * 0.008);
                    gain.gain.setValueAtTime(0, ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(baseVolume, ctx.currentTime + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

                    osc.start(ctx.currentTime + index * 0.08);
                    osc.stop(ctx.currentTime + 0.5 + index * 0.08);
                });
                
            } else if (type === 'ssr') {
                // SSR物品音效 - 史诗级高达主题音效（模拟《翔べ！ガンダム》高潮部分）
                const epicFrequencies = [
                    [261.63, 523.25, 1046.50, 2093.00], // C大调八度和弦 - 雄壮开场
                    [329.63, 659.25, 1318.51, 2637.02], // E大调八度和弦 - 英雄气概
                    [392.00, 783.99, 1567.98, 3135.96], // G大调八度和弦 - 胜利凯歌
                    [523.25, 1046.50, 2093.00, 4186.01] // C大调高八度 - 史诗终章
                ];
                
                epicFrequencies.forEach((chord, chordIndex) => {
                    setTimeout(() => {
                        chord.forEach((freq) => {
                            const osc = ctx.createOscillator();
                            const gain = ctx.createGain();
                            const filter = ctx.createBiquadFilter();
                            const delay = ctx.createDelay();
                            const feedback = ctx.createGain();
                            const compressor = ctx.createDynamicsCompressor();

                            // 创建延迟效果增加史诗感
                            delay.delayTime.setValueAtTime(0.25, ctx.currentTime);
                            feedback.gain.setValueAtTime(0.4, ctx.currentTime);

                            // 音频链：振荡器 -> 滤波器 -> 压缩器 -> 延迟 -> 增益
                            osc.connect(filter);
                            filter.connect(compressor);
                            compressor.connect(delay);
                            delay.connect(feedback);
                            feedback.connect(delay);
                            delay.connect(gain);
                            gain.connect(ctx.destination);

                            // 直接信号也连接到输出
                            compressor.connect(gain);

                            osc.frequency.setValueAtTime(freq, ctx.currentTime);
                            osc.type = 'sawtooth'; // 使用锯齿波获得丰富的泛音

                            // 动态滤波器模拟管弦乐的表现力
                            filter.type = 'lowpass';
                            filter.frequency.setValueAtTime(freq * 1.5, ctx.currentTime);
                            filter.frequency.exponentialRampToValueAtTime(freq * 6, ctx.currentTime + 0.3);
                            filter.frequency.exponentialRampToValueAtTime(freq * 2, ctx.currentTime + 1.0);
                            filter.Q.setValueAtTime(2, ctx.currentTime);

                            // 压缩器设置增加冲击力
                            compressor.threshold.setValueAtTime(-12, ctx.currentTime);
                            compressor.knee.setValueAtTime(30, ctx.currentTime);
                            compressor.ratio.setValueAtTime(12, ctx.currentTime);

                            // 史诗级音量包络
                            const baseVolume = 0.08 + (chordIndex * 0.015); // 逐渐增强到高潮
                            gain.gain.setValueAtTime(0, ctx.currentTime);
                            gain.gain.linearRampToValueAtTime(baseVolume, ctx.currentTime + 0.1);
                            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

                            osc.start(ctx.currentTime);
                            osc.stop(ctx.currentTime + 1.2);
                        });
                    }, chordIndex * 300); // 延长间隔增加史诗感
                });
            }
        } catch (error) {
            console.log('音效播放失败:', error);
            // 备用方案：使用系统提示音
            try {
                const audio = new Audio();
                audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
                audio.volume = 0.1;
                audio.play().catch(() => {});
            } catch (e) {
                console.log('备用音效也失败了');
            }
        }
    };

    // ==================== 游戏常量 ====================
    const SINGLE_PULL_COST = 100;    // 单次抽取费用
    const TEN_PULL_COST = 1000;      // 十连抽取费用
    const DAILY_SIGN_IN_REWARD = 200; // 每日签到奖励
    
    // ==================== 抽卡概率配置 ====================
    const rarityProbabilities = { SSR: 5, SR: 10, R: 25, N: 60 };
    
    // ==================== 按稀有度分组的物品 ====================
    const itemsByRarity = {
        SSR: prizePool.filter(item => item.rarity === 'SSR'),
        SR: prizePool.filter(item => item.rarity === 'SR'),
        R: prizePool.filter(item => item.rarity === 'R'),
        N: prizePool.filter(item => item.rarity === 'N')
    };

    // ==================== 数据管理 ====================
    /**
     * 从本地存储加载游戏状态
     * 包括代币、收集物品、统计数据、设置等
     */
    const loadState = () => {
        try {
            const savedTokens = localStorage.getItem('gundamGachaTokens');
            const savedCollection = localStorage.getItem('gundamGachaCollection');
            const savedStats = localStorage.getItem('gundamGachaStats');
            const savedSettings = localStorage.getItem('gundamGachaSettings');
            const savedPurchasedItems = localStorage.getItem('gundamGachaPurchasedItems');
            const savedCompletedAchievements = localStorage.getItem('gundamGachaCompletedAchievements');
            const savedGuaranteeSSR = localStorage.getItem('gundamGachaGuaranteeSSR');

            // 安全解析数据，如果解析失败使用默认值
            tokens = savedTokens ? Math.max(0, parseInt(savedTokens, 10)) : 1000;

            try {
                collection = savedCollection ? JSON.parse(savedCollection) : {};
                // 验证collection数据完整性
                if (typeof collection !== 'object' || collection === null) {
                    collection = {};
                }
            } catch (e) {
                console.warn('收集数据损坏，使用默认值');
                collection = {};
            }

            try {
                stats = savedStats ? JSON.parse(savedStats) : {};
                // 确保stats包含所有必需字段
                stats = {
                    totalPulls: 0,
                    singlePulls: 0,
                    tenPulls: 0,
                    ssrCount: 0,
                    srCount: 0,
                    rCount: 0,
                    nCount: 0,
                    lastSignIn: null,
                    totalTokensSpent: 0,
                    totalTokensEarned: 0,
                    consecutiveSignIns: 0,
                    ...stats
                };
                // 确保数值字段为非负数
                Object.keys(stats).forEach(key => {
                    if (typeof stats[key] === 'number' && stats[key] < 0) {
                        stats[key] = 0;
                    }
                });
            } catch (e) {
                console.warn('统计数据损坏，使用默认值');
                stats = {
                    totalPulls: 0,
                    singlePulls: 0,
                    tenPulls: 0,
                    ssrCount: 0,
                    srCount: 0,
                    rCount: 0,
                    nCount: 0,
                    lastSignIn: null,
                    totalTokensSpent: 0,
                    totalTokensEarned: 0,
                    consecutiveSignIns: 0
                };
            }

            try {
                settings = savedSettings ? JSON.parse(savedSettings) : {};
                settings = {
                    soundEnabled: true,
                    animationEnabled: true,
                    signinReminder: true,
                    bgMusicEnabled: true,
                    ...settings
                };
            } catch (e) {
                console.warn('设置数据损坏，使用默认值');
                settings = {
                    soundEnabled: true,
                    animationEnabled: true,
                    signinReminder: true,
                    bgMusicEnabled: true
                };
            }

            try {
                purchasedItems = savedPurchasedItems ? JSON.parse(savedPurchasedItems) : {};
                if (typeof purchasedItems !== 'object' || purchasedItems === null) {
                    purchasedItems = {};
                }
            } catch (e) {
                console.warn('购买记录损坏，使用默认值');
                purchasedItems = {};
            }

            try {
                completedAchievements = savedCompletedAchievements ? JSON.parse(savedCompletedAchievements) : [];
                if (!Array.isArray(completedAchievements)) {
                    completedAchievements = [];
                }
            } catch (e) {
                console.warn('成就数据损坏，使用默认值');
                completedAchievements = [];
            }

            try {
                guaranteeNextSSR = savedGuaranteeSSR ? JSON.parse(savedGuaranteeSSR) : false;
                if (typeof guaranteeNextSSR !== 'boolean') {
                    guaranteeNextSSR = false;
                }
            } catch (e) {
                console.warn('保底数据损坏，使用默认值');
                guaranteeNextSSR = false;
            }

            // 同步背景音乐设置
            bgMusicEnabled = settings.bgMusicEnabled;

            updateTokenDisplay();
            updateSettingsUI();
            if (settings.signinReminder) {
                checkDailySignIn();
            }

            // 检查成就
            checkAchievements();

            // 启动背景音乐
            if (bgMusicEnabled) {
                setTimeout(() => {
                    playBGM();
                }, 1000);
            }

        } catch (error) {
            console.error('加载游戏状态失败:', error);
            showNotification('游戏数据加载失败，使用默认设置', 'error');

            // 使用默认值
            tokens = 1000;
            collection = {};
            stats = {
                totalPulls: 0,
                singlePulls: 0,
                tenPulls: 0,
                ssrCount: 0,
                srCount: 0,
                rCount: 0,
                nCount: 0,
                lastSignIn: null,
                totalTokensSpent: 0,
                totalTokensEarned: 0,
                consecutiveSignIns: 0
            };
            settings = {
                soundEnabled: true,
                animationEnabled: true,
                signinReminder: true,
                bgMusicEnabled: true
            };
            purchasedItems = {};
            completedAchievements = [];
            guaranteeNextSSR = false;

            updateTokenDisplay();
            updateSettingsUI();
        }
    };

    /**
     * 保存游戏状态到本地存储
     * 包括代币、收集物品、统计数据、设置等
     */
    const saveState = () => {
        try {
            localStorage.setItem('gundamGachaTokens', tokens.toString());
            localStorage.setItem('gundamGachaCollection', JSON.stringify(collection));
            localStorage.setItem('gundamGachaStats', JSON.stringify(stats));
            localStorage.setItem('gundamGachaSettings', JSON.stringify(settings));
            localStorage.setItem('gundamGachaPurchasedItems', JSON.stringify(purchasedItems));
            localStorage.setItem('gundamGachaCompletedAchievements', JSON.stringify(completedAchievements));
            localStorage.setItem('gundamGachaGuaranteeSSR', JSON.stringify(guaranteeNextSSR));
        } catch (error) {
            console.error('保存游戏状态失败:', error);
            showNotification('游戏数据保存失败', 'error');

            // 尝试清理localStorage空间
            try {
                // 删除一些可能的旧数据
                const keysToClean = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && !key.startsWith('gundamGacha')) {
                        keysToClean.push(key);
                    }
                }

                if (keysToClean.length > 0) {
                    keysToClean.forEach(key => localStorage.removeItem(key));
                    showNotification('已清理存储空间，请重试', 'info');
                }
            } catch (cleanError) {
                console.error('清理存储空间失败:', cleanError);
            }
        }
    };

    /**
     * 更新代币显示和按钮状态
     * 根据当前代币数量启用/禁用抽取按钮
     */
    const updateTokenDisplay = () => {
        tokenBalanceEl.textContent = tokens;
        const canAffordSingle = tokens >= SINGLE_PULL_COST;
        const canAffordTen = tokens >= TEN_PULL_COST;
        singlePullBtn.disabled = !canAffordSingle;
        tenPullBtn.disabled = !canAffordTen;
        singlePullBtn.style.opacity = canAffordSingle ? '1' : '0.5';
        tenPullBtn.style.opacity = canAffordTen ? '1' : '0.5';
    };

    // ==================== 抽卡核心逻辑 ====================
    /**
     * 将物品添加到收集库
     * @param {Object} item - 要添加的物品对象
     */
    const addToCollection = (item) => {
        collection[item.id] = (collection[item.id] || 0) + 1;
        stats[`${item.rarity.toLowerCase()}Count`]++;
    };

    /**
     * 根据稀有度随机获取一个物品
     * @param {string} rarity - 稀有度 ('SSR' | 'SR' | 'R' | 'N')
     * @returns {Object} 随机选择的物品对象
     */
    const getRandomItemByRarity = (rarity) => {
        try {
            const items = itemsByRarity[rarity];
            if (!items || items.length === 0) {
                console.warn(`没有找到稀有度为 ${rarity} 的物品，使用N级物品`);
                return itemsByRarity['N'][0] || prizePool[0];
            }
            return items[Math.floor(Math.random() * items.length)];
        } catch (error) {
            console.error('获取随机物品失败:', error);
            // 返回第一个可用物品作为备用
            return prizePool[0];
        }
    };

    /**
     * 执行单次抽卡
     * 根据概率配置随机抽取一个物品
     * @returns {Object} 抽取到的物品对象
     */
    const drawOne = () => {
        const rand = Math.random() * 100;
        let cumulativeProb = 0;
        for (const rarity in rarityProbabilities) {
            cumulativeProb += rarityProbabilities[rarity];
            if (rand < cumulativeProb) return getRandomItemByRarity(rarity);
        }
        return getRandomItemByRarity('N'); 
    };

    /**
     * 执行抽取操作的核心方法
     * @param {number} cost - 抽取费用
     * @param {Function} pullFn - 具体的抽取逻辑函数
     */
    const performPull = (cost, pullFn) => {
        if (tokens < cost) {
            showNotification("代币不足！", "error");
            return;
        }

        // 显示加载状态
        showLoadingState();

        // 禁用按钮防止重复点击
        singlePullBtn.disabled = true;
        tenPullBtn.disabled = true;

        setTimeout(() => {
            tokens -= cost;
            stats.totalPulls++;
            stats.totalTokensSpent += cost;
            pullFn();
            updateTokenDisplay();
            saveState();
            playSound('pull');

            // 恢复按钮状态
            hideLoadingState();
            updateTokenDisplay(); // 这会重新启用按钮
        }, 500); // 添加短暂延迟增加仪式感
    };

    /**
     * 显示加载状态
     */
    const showLoadingState = () => {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
        loadingOverlay.innerHTML = `
            <div class="pixel-box p-8 text-center">
                <div class="text-4xl mb-4">🎰</div>
                <div class="text-xl text-cyan-300 animate-pulse">抽取中...</div>
                <div class="mt-4 flex justify-center space-x-2">
                    <div class="w-3 h-3 bg-cyan-300 rounded-full animate-bounce"></div>
                    <div class="w-3 h-3 bg-cyan-300 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-3 h-3 bg-cyan-300 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    };

    /**
     * 隐藏加载状态
     */
    const hideLoadingState = () => {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    };

    /**
     * 处理单次抽取
     * 抽取一个物品并显示结果，如果是SSR或SR会播放稀有音效
     */
    const handleSinglePull = () => performPull(SINGLE_PULL_COST, () => {
        stats.singlePulls++;
        const result = drawOne();
        addToCollection(result);
        displaySingleResult(result);
        if (result.rarity === 'SSR') {
            playSound('ssr');
        } else if (result.rarity === 'SR') {
            playSound('rare');
        }

        // 检查成就
        checkAchievements();
    });

    /**
     * 处理十连抽取
     * 抽取10个物品，包含保底机制：如果没有R级或以上物品，随机替换一个N级物品为R级
     */
    const handleTenPull = () => performPull(TEN_PULL_COST, () => {
        stats.tenPulls++;
        let results = Array.from({ length: 10 }, drawOne);

        // SSR保底机制
        if (guaranteeNextSSR) {
            // 确保至少有一个SSR
            const hasSSR = results.some(item => item.rarity === 'SSR');
            if (!hasSSR) {
                // 随机替换一个物品为SSR
                const randomIndex = Math.floor(Math.random() * results.length);
                results[randomIndex] = getRandomItemByRarity('SSR');
            }
            guaranteeNextSSR = false; // 重置保底状态
        }

        // 普通保底机制：如果没有R级或以上物品，随机替换一个N级物品为R级
        const hasRareOrBetter = results.some(item => ['R', 'SR', 'SSR'].includes(item.rarity));
        if (!hasRareOrBetter) {
            const nItemIndices = results.map((item, index) => item.rarity === 'N' ? index : -1).filter(index => index !== -1);
            if (nItemIndices.length > 0) {
                const indexToReplace = nItemIndices[Math.floor(Math.random() * nItemIndices.length)];
                results[indexToReplace] = getRandomItemByRarity('R');
            }
        }

        results.forEach(addToCollection);
        displayMultiResult(results);

        const hasSSR = results.some(item => item.rarity === 'SSR');
        const hasSR = results.some(item => item.rarity === 'SR');

        if (hasSSR) {
            playSound('ssr');
        } else if (hasSR) {
            playSound('rare');
        }

        // 检查成就
        checkAchievements();
    });

    // ==================== 界面显示 ====================
    /**
     * 创建结果卡片的HTML
     * @param {Object} item - 物品对象
     * @returns {string} 卡片的HTML字符串
     */
    const createResultCardHTML = (item) => `
        <div class="result-card card-${item.rarity} text-center ${settings.animationEnabled ? 'animate-pulse' : ''}" ${settings.animationEnabled ? 'style="cursor: pointer;"' : ''}>
            <img src="${item.image_url}" alt="${item.name}" class="w-24 h-24 md:w-32 md:h-32 object-contain pixel-art mb-2">
            <p class="text-sm md:text-base font-bold rarity-${item.rarity}">${item.rarity}</p>
            <p class="text-xs md:text-sm">${item.name}</p>
            <p class="text-xs text-gray-400">${item.model}</p>
        </div>`;

    /**
     * 显示单次抽取结果
     * @param {Object} item - 抽取到的物品
     * 包含动画效果和点击停止动画功能
     */
    const displaySingleResult = (item) => {
        modalBody.innerHTML = `
            <div class="flex flex-col items-center justify-center">
                <div class="result-card card-${item.rarity} text-center p-4 ${settings.animationEnabled ? 'animate-bounce' : ''}" style="cursor: pointer;">
                     <img src="${item.image_url}" alt="${item.name}" class="w-48 h-48 md:w-64 md:h-64 object-contain pixel-art mb-4">
                     <p class="text-2xl md:text-3xl font-bold rarity-${item.rarity}">${item.rarity}</p>
                     <p class="text-xl md:text-2xl mt-2">${item.name}</p>
                     <p class="text-base text-gray-400 mt-1">${item.model}</p>
                     <div class="mt-4 text-sm text-gray-300">
                         <p>总抽取次数: ${stats.totalPulls}</p>
                         <p>${item.rarity}级物品: ${stats[`${item.rarity.toLowerCase()}Count`]}个</p>
                     </div>
                     ${settings.animationEnabled ? '<p class="text-xs text-gray-500 mt-2">点击停止动画</p>' : ''}
                </div>
            </div>`;
        showModal(resultModal);
        
        // 添加点击停止动画功能
        if (settings.animationEnabled) {
            const resultCard = modalBody.querySelector('.result-card');
            if (resultCard) {
                resultCard.addEventListener('click', () => {
                    resultCard.classList.remove('animate-bounce');
                    resultCard.style.cursor = 'default';
                    const hint = resultCard.querySelector('p:last-child');
                    if (hint && hint.textContent === '点击停止动画') {
                        hint.remove();
                    }
                });
            }
            
            // 3秒后自动停止动画
            setTimeout(() => {
                const resultCard = modalBody.querySelector('.result-card');
                if (resultCard && resultCard.classList.contains('animate-bounce')) {
                    resultCard.classList.remove('animate-bounce');
                    resultCard.style.cursor = 'default';
                    const hint = resultCard.querySelector('p:last-child');
                    if (hint && hint.textContent === '点击停止动画') {
                        hint.remove();
                    }
                }
            }, 3000);
        }
    };

    /**
     * 显示十连抽取结果
     * @param {Array} items - 抽取到的物品数组
     * 显示稀有度统计和所有物品卡片，包含动画效果
     */
    const displayMultiResult = (items) => {
        const rarityCounts = { SSR: 0, SR: 0, R: 0, N: 0 };
        items.forEach(item => rarityCounts[item.rarity]++);
        
        modalBody.innerHTML = `
            <div class="mb-4 text-center">
                <h3 class="text-xl font-bold mb-2">十连抽取结果</h3>
                <div class="flex justify-center space-x-4 text-sm">
                    ${Object.entries(rarityCounts).map(([rarity, count]) => 
                        count > 0 ? `<span class="rarity-${rarity}">${rarity}: ${count}</span>` : ''
                    ).join('')}
                </div>
                ${settings.animationEnabled ? '<p class="text-xs text-gray-500 mt-2">点击任意卡片停止动画</p>' : ''}
            </div>
            <div class="result-grid">${items.map(createResultCardHTML).join('')}</div>
        `;
        showModal(resultModal);
        
        // 添加点击停止动画功能
        if (settings.animationEnabled) {
            const resultCards = modalBody.querySelectorAll('.result-card');
            resultCards.forEach(card => {
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => {
                    card.classList.remove('animate-pulse');
                    card.style.cursor = 'default';
                });
            });
            
            // 5秒后自动停止所有动画
            setTimeout(() => {
                const resultCards = modalBody.querySelectorAll('.result-card');
                resultCards.forEach(card => {
                    if (card.classList.contains('animate-pulse')) {
                        card.classList.remove('animate-pulse');
                        card.style.cursor = 'default';
                    }
                });
                const hint = modalBody.querySelector('p:last-child');
                if (hint && hint.textContent === '点击任意卡片停止动画') {
                    hint.remove();
                }
            }, 5000);
        }
    };
    
    /**
     * 显示机库（收集物品展示）
     * 按稀有度排序显示所有收集的物品，包含收集统计信息
     */
    const displayHangar = () => {
        const collectedIds = Object.keys(collection);
        if (collectedIds.length === 0) {
            hangarBody.innerHTML = '<p class="text-center text-gray-400">机库是空的。快去扭蛋吧！</p>';
            showModal(hangarModal);
            return;
        }

        // 按稀有度排序：SSR > SR > R > N
        const rarityOrder = { 'SSR': 0, 'SR': 1, 'R': 2, 'N': 3 };
        collectedIds.sort((a, b) => {
            const itemA = prizePoolById[a];
            const itemB = prizePoolById[b];
            return rarityOrder[itemA.rarity] - rarityOrder[itemB.rarity];
        });

        const totalItems = Object.values(collection).reduce((sum, count) => sum + count, 0);
        const uniqueItems = collectedIds.length;

        const hangarHTML = `
            <div class="mb-6 text-center">
                <h3 class="text-xl font-bold mb-2">收集统计</h3>
                <div class="flex justify-center space-x-4 text-sm">
                    <span>总物品: ${totalItems}</span>
                    <span>独特物品: ${uniqueItems}</span>
                    <span>收集率: ${Math.round((uniqueItems / prizePool.length) * 100)}%</span>
                </div>
                <div class="flex justify-center space-x-4 text-sm mt-2">
                    <span class="rarity-SSR">SSR: ${stats.ssrCount}</span>
                    <span class="rarity-SR">SR: ${stats.srCount}</span>
                    <span class="rarity-R">R: ${stats.rCount}</span>
                    <span class="rarity-N">N: ${stats.nCount}</span>
                </div>
            </div>
            <div class="hangar-grid">${collectedIds.map(id => {
                const item = prizePoolById[id];
                const count = collection[id];
                return `
                    <div class="hangar-card card-${item.rarity} text-center">
                        <div class="count">x${count}</div>
                        <img src="${item.image_url}" alt="${item.name}" class="w-24 h-24 md:w-32 md:h-32 object-contain pixel-art mb-2">
                        <p class="text-sm md:text-base font-bold rarity-${item.rarity}">${item.rarity}</p>
                        <p class="text-xs md:text-sm">${item.name}</p>
                    </div>`;
            }).join('')}</div>
        `;

        hangarBody.innerHTML = hangarHTML;
        showModal(hangarModal);
    };

    // ==================== 商店系统 ====================
    /**
     * 显示商店界面
     * 展示可购买的物品和玩家的购买历史
     */
    const displayShop = () => {
        const today = new Date().toDateString();

        const shopHTML = `
            <div class="mb-6 text-center">
                <h3 class="text-xl font-bold mb-2">每日商店</h3>
                <p class="text-sm text-gray-400">每日限购，午夜重置</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${shopItems.map(item => {
                    const purchased = purchasedItems[item.id];
                    const todayPurchased = purchased && purchased.lastPurchase === today ? purchased.count : 0;
                    const canPurchase = todayPurchased < item.dailyLimit && tokens >= item.price;
                    const remaining = item.dailyLimit - todayPurchased;

                    return `
                        <div class="pixel-box p-4 text-center ${canPurchase ? '' : 'opacity-50'}">
                            <div class="text-4xl mb-2">${item.icon}</div>
                            <h4 class="text-lg font-bold mb-2">${item.name}</h4>
                            <p class="text-sm text-gray-300 mb-3">${item.description}</p>
                            <div class="mb-3">
                                <span class="text-yellow-400 font-bold">${item.price === 0 ? '免费' : item.price + ' 代币'}</span>
                            </div>
                            <div class="mb-3 text-xs">
                                <span class="text-blue-400">剩余: ${remaining}/${item.dailyLimit}</span>
                            </div>
                            <button
                                class="pixel-button small-button ${canPurchase ? '' : 'opacity-50 cursor-not-allowed'}"
                                onclick="purchaseItem('${item.id}')"
                                ${canPurchase ? '' : 'disabled'}
                            >
                                ${canPurchase ? '购买' : (tokens < item.price ? '代币不足' : '已售完')}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        shopBody.innerHTML = shopHTML;
        showModal(shopModal);
    };

    /**
     * 购买商店物品
     * @param {string} itemId - 物品ID
     */
    window.purchaseItem = (itemId) => {
        const item = shopItems.find(i => i.id === itemId);
        if (!item) return;

        const today = new Date().toDateString();
        const purchased = purchasedItems[itemId] || { count: 0, lastPurchase: null };
        const todayPurchased = purchased.lastPurchase === today ? purchased.count : 0;

        if (todayPurchased >= item.dailyLimit) {
            showNotification("今日购买次数已达上限！", "error");
            return;
        }

        if (tokens < item.price) {
            showNotification("代币不足！", "error");
            return;
        }

        // 扣除代币
        tokens -= item.price;
        stats.totalTokensSpent += item.price;

        // 更新购买记录
        purchasedItems[itemId] = {
            count: purchased.lastPurchase === today ? purchased.count + 1 : 1,
            lastPurchase: today
        };

        // 应用物品效果
        switch (item.type) {
            case 'tokens':
                tokens += item.value;
                stats.totalTokensEarned += item.value;
                showNotification(`获得 ${item.value} 代币！`, "success");
                break;
            case 'discount':
                // 这里可以设置折扣券状态
                showNotification(`获得 ${item.name}！`, "success");
                break;
            case 'guarantee':
                if (item.value === 'ssr') {
                    guaranteeNextSSR = true;
                    showNotification("下次十连必出SSR！", "success");
                }
                break;
        }

        updateTokenDisplay();
        saveState();
        displayShop(); // 刷新商店界面
    };

    // ==================== 成就系统 ====================
    /**
     * 检查并更新成就进度
     */
    const checkAchievements = () => {
        achievements.forEach(achievement => {
            if (!completedAchievements.includes(achievement.id) &&
                achievement.condition(stats, collection)) {

                // 完成成就
                completedAchievements.push(achievement.id);
                achievement.completed = true;

                // 发放奖励
                if (achievement.reward.tokens) {
                    tokens += achievement.reward.tokens;
                    stats.totalTokensEarned += achievement.reward.tokens;
                    updateTokenDisplay();
                }

                // 显示成就完成通知
                showAchievementNotification(achievement);
                saveState();
            }
        });
    };

    /**
     * 显示成就完成通知
     * @param {Object} achievement - 成就对象
     */
    const showAchievementNotification = (achievement) => {
        const notification = document.createElement('div');
        notification.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pixel-box p-6 bg-yellow-600 text-center max-w-md';
        notification.innerHTML = `
            <div class="text-4xl mb-2">${achievement.icon}</div>
            <h3 class="text-xl font-bold mb-2">成就达成！</h3>
            <p class="text-lg mb-2">${achievement.name}</p>
            <p class="text-sm mb-3">${achievement.description}</p>
            ${achievement.reward.tokens ? `<p class="text-yellow-300 font-bold">奖励: ${achievement.reward.tokens} 代币</p>` : ''}
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    };

    /**
     * 显示成就界面
     */
    const displayAchievements = () => {
        const completedCount = completedAchievements.length;
        const totalCount = achievements.length;
        const completionRate = Math.round((completedCount / totalCount) * 100);

        const achievementsHTML = `
            <div class="mb-6 text-center">
                <h3 class="text-xl font-bold mb-2">成就进度</h3>
                <div class="flex justify-center space-x-4 text-sm">
                    <span>已完成: ${completedCount}/${totalCount}</span>
                    <span>完成率: ${completionRate}%</span>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${achievements.map(achievement => {
                    const isCompleted = completedAchievements.includes(achievement.id);
                    const progress = achievement.condition(stats, collection);

                    return `
                        <div class="pixel-box p-4 ${isCompleted ? 'bg-green-900 bg-opacity-30' : 'bg-gray-800 bg-opacity-30'}">
                            <div class="flex items-center mb-3">
                                <div class="text-3xl mr-3">${achievement.icon}</div>
                                <div class="flex-1">
                                    <h4 class="text-lg font-bold ${isCompleted ? 'text-green-400' : 'text-white'}">${achievement.name}</h4>
                                    <p class="text-sm text-gray-300">${achievement.description}</p>
                                </div>
                                ${isCompleted ? '<div class="text-green-400 text-2xl">✓</div>' : ''}
                            </div>
                            <div class="text-sm">
                                ${achievement.reward.tokens ? `<span class="text-yellow-400">奖励: ${achievement.reward.tokens} 代币</span>` : ''}
                            </div>
                            ${isCompleted ? '<div class="text-green-400 text-sm mt-2">已完成</div>' :
                              progress ? '<div class="text-blue-400 text-sm mt-2">可完成</div>' :
                              '<div class="text-gray-500 text-sm mt-2">未完成</div>'}
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        achievementsBody.innerHTML = achievementsHTML;
        showModal(achievementsModal);
    };

    // ==================== 签到系统 ====================
    /**
     * 检查每日签到
     * 如果今天还没有签到，显示签到弹窗
     */
    const checkDailySignIn = () => {
        const today = new Date().toDateString();
        if (stats.lastSignIn !== today) {
            showDailySignInModal();
        }
    };

    /**
     * 显示每日签到弹窗
     * 提供每日奖励领取功能
     */
    const showDailySignInModal = () => {
        const signInModal = document.createElement('div');
        signInModal.className = 'modal-overlay show';
        signInModal.innerHTML = `
            <div class="modal-content pixel-box w-full max-w-md bg-gray-900 bg-opacity-80 p-6 text-center">
                <h2 class="text-2xl text-cyan-300 text-shadow mb-4">每日签到</h2>
                <p class="mb-4">欢迎回来！领取你的每日奖励</p>
                <div class="text-3xl font-bold text-yellow-400 mb-4">+${DAILY_SIGN_IN_REWARD} 代币</div>
                <button id="claim-daily-btn" class="pixel-button">领取奖励</button>
            </div>
        `;
        
        document.body.appendChild(signInModal);
        
        document.getElementById('claim-daily-btn').addEventListener('click', () => {
            tokens += DAILY_SIGN_IN_REWARD;
            stats.lastSignIn = new Date().toDateString();
            updateTokenDisplay();
            saveState();
            showNotification(`获得 ${DAILY_SIGN_IN_REWARD} 代币！`, "success");
            document.body.removeChild(signInModal);
        });
        
        signInModal.addEventListener('click', (e) => {
            if (e.target === signInModal) {
                document.body.removeChild(signInModal);
            }
        });
    };

    // ==================== 工具方法 ====================
    /**
     * 显示通知消息
     * @param {string} message - 通知消息内容
     * @param {string} type - 通知类型 ('info' | 'success' | 'error')
     */
    const showNotification = (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg text-white font-bold ${
            type === 'error' ? 'bg-red-500' : 
            type === 'success' ? 'bg-green-500' : 'bg-blue-500'
        }`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    };

    /**
     * 更新设置界面UI状态
     * 根据当前设置更新复选框状态
     */
    const updateSettingsUI = () => {
        soundToggle.checked = settings.soundEnabled;
        animationToggle.checked = settings.animationEnabled;
        signinToggle.checked = settings.signinReminder;
        
        // 添加背景音乐控制
        const bgMusicToggle = document.getElementById('bgmusic-toggle');
        if (bgMusicToggle) {
            bgMusicToggle.checked = settings.bgMusicEnabled;
        }
    };

    // ==================== 统计功能 ====================
    /**
     * 显示统计信息
     * 包括抽取统计、收集统计、稀有度统计、游戏信息等
     * 计算各稀有度的实际抽取概率
     */
    const displayStats = () => {
        const totalItems = Object.values(collection).reduce((sum, count) => sum + count, 0);
        const uniqueItems = Object.keys(collection).length;
        const collectionRate = Math.round((uniqueItems / prizePool.length) * 100);
        
        // 计算各稀有度的实际抽取概率
        const ssrRate = stats.totalPulls > 0 ? Math.round((stats.ssrCount / stats.totalPulls) * 10000) / 100 : 0;
        const srRate = stats.totalPulls > 0 ? Math.round((stats.srCount / stats.totalPulls) * 10000) / 100 : 0;
        const rRate = stats.totalPulls > 0 ? Math.round((stats.rCount / stats.totalPulls) * 10000) / 100 : 0;
        const nRate = stats.totalPulls > 0 ? Math.round((stats.nCount / stats.totalPulls) * 10000) / 100 : 0;

        statsBody.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="pixel-box p-4">
                    <h3 class="text-xl font-bold mb-4 text-cyan-300">抽取统计</h3>
                    <div class="space-y-2">
                        <p>总抽取次数: <span class="text-yellow-400">${stats.totalPulls}</span></p>
                        <p>单次抽取: <span class="text-blue-400">${stats.singlePulls}</span></p>
                        <p>十连抽取: <span class="text-purple-400">${stats.tenPulls}</span></p>
                    </div>
                </div>
                <div class="pixel-box p-4">
                    <h3 class="text-xl font-bold mb-4 text-cyan-300">收集统计</h3>
                    <div class="space-y-2">
                        <p>总物品数量: <span class="text-yellow-400">${totalItems}</span></p>
                        <p>独特物品: <span class="text-blue-400">${uniqueItems}</span></p>
                        <p>收集率: <span class="text-green-400">${collectionRate}%</span></p>
                    </div>
                </div>
                <div class="pixel-box p-4">
                    <h3 class="text-xl font-bold mb-4 text-cyan-300">稀有度统计</h3>
                    <div class="space-y-2">
                        <p class="rarity-SSR">SSR: ${stats.ssrCount} (${ssrRate}%)</p>
                        <p class="rarity-SR">SR: ${stats.srCount} (${srRate}%)</p>
                        <p class="rarity-R">R: ${stats.rCount} (${rRate}%)</p>
                        <p class="rarity-N">N: ${stats.nCount} (${nRate}%)</p>
                    </div>
                </div>
                <div class="pixel-box p-4">
                    <h3 class="text-xl font-bold mb-4 text-cyan-300">游戏信息</h3>
                    <div class="space-y-2">
                        <p>当前代币: <span class="text-yellow-400">${tokens}</span></p>
                        <p>最后签到: <span class="text-blue-400">${stats.lastSignIn || '从未签到'}</span></p>
                        <p>奖池大小: <span class="text-green-400">${prizePool.length}</span></p>
                    </div>
                </div>
            </div>
        `;
        showModal(statsModal);
    };

    // ==================== 设置功能 ====================
    /**
     * 重置游戏数据
     * 清除所有本地存储数据并重新加载页面
     */
    const resetGameData = () => {
        if (confirm('确定要重置所有游戏数据吗？此操作不可撤销！')) {
            localStorage.clear();
            location.reload();
        }
    };

    /**
     * 测试音效功能
     * 播放抽取音效和稀有音效进行测试
     */
    const testSound = () => {
        // 初始化AudioContext（在第一次用户交互时）
        if (!audioContext) {
            initAudioContext();
        }
        
        showNotification("测试音效中...", "info");
        
        // 测试抽取音效
        playSound('pull');
        
        // 1秒后测试稀有音效
        setTimeout(() => {
            playSound('rare');
            showNotification("音效测试完成！", "success");
        }, 1000);
    };

    // ==================== 模态框管理 ====================
    /**
     * 显示模态框
     * @param {HTMLElement} modal - 要显示的模态框元素
     */
    const showModal = (modal) => {
        modal.classList.remove('hide');
        modal.classList.add('show');
    };

    /**
     * 关闭模态框
     * @param {HTMLElement} modal - 要关闭的模态框元素
     */
    const closeModal = (modal) => {
        modal.classList.add('hide');
        const onAnimationEnd = () => {
            modal.classList.remove('show', 'hide');
            modal.removeEventListener('animationend', onAnimationEnd);
        };
        modal.addEventListener('animationend', onAnimationEnd);
    };

    // ==================== 事件监听器 ====================
    /**
     * 键盘快捷键监听
     * 1: 单次抽取, 0: 十连抽取, h: 打开机库
     */
    document.addEventListener('keydown', (e) => {
        // 初始化AudioContext（在第一次用户交互时）
        if (!audioContext) {
            initAudioContext();
        }
        
        if (e.key === '1' && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            if (tokens >= SINGLE_PULL_COST) {
                handleSinglePull();
            }
        } else if (e.key === '0' && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            if (tokens >= TEN_PULL_COST) {
                handleTenPull();
            }
        } else if (e.key === 'h' && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            displayHangar();
        }
    });

    // 按钮事件监听器
    singlePullBtn.addEventListener('click', () => {
        // 初始化AudioContext（在第一次用户交互时）
        if (!audioContext) {
            initAudioContext();
        }
        handleSinglePull();
    });
    tenPullBtn.addEventListener('click', () => {
        // 初始化AudioContext（在第一次用户交互时）
        if (!audioContext) {
            initAudioContext();
        }
        handleTenPull();
    });
    hangarBtn.addEventListener('click', displayHangar);
    shopBtn.addEventListener('click', displayShop);
    achievementsBtn.addEventListener('click', displayAchievements);
    statsBtn.addEventListener('click', displayStats);
    settingsBtn.addEventListener('click', () => showModal(settingsModal));

    // 模态框关闭事件
    closeResultModalBtn.addEventListener('click', () => closeModal(resultModal));
    resultModal.addEventListener('click', (e) => e.target === resultModal && closeModal(resultModal));

    closeHangarModalBtn.addEventListener('click', () => closeModal(hangarModal));
    hangarModal.addEventListener('click', (e) => e.target === hangarModal && closeModal(hangarModal));

    closeShopModalBtn.addEventListener('click', () => closeModal(shopModal));
    shopModal.addEventListener('click', (e) => e.target === shopModal && closeModal(shopModal));

    closeAchievementsModalBtn.addEventListener('click', () => closeModal(achievementsModal));
    achievementsModal.addEventListener('click', (e) => e.target === achievementsModal && closeModal(achievementsModal));

    closeStatsModalBtn.addEventListener('click', () => closeModal(statsModal));
    statsModal.addEventListener('click', (e) => e.target === statsModal && closeModal(statsModal));

    closeSettingsModalBtn.addEventListener('click', () => closeModal(settingsModal));
    settingsModal.addEventListener('click', (e) => e.target === settingsModal && closeModal(settingsModal));

    // 设置事件监听器
    soundToggle.addEventListener('change', () => {
        settings.soundEnabled = soundToggle.checked;
        saveState();
    });

    animationToggle.addEventListener('change', () => {
        settings.animationEnabled = animationToggle.checked;
        saveState();
    });

    signinToggle.addEventListener('change', () => {
        settings.signinReminder = signinToggle.checked;
        saveState();
    });

    // 背景音乐控制
    const bgMusicToggle = document.getElementById('bgmusic-toggle');
    if (bgMusicToggle) {
        bgMusicToggle.addEventListener('change', () => {
            settings.bgMusicEnabled = bgMusicToggle.checked;
            bgMusicEnabled = bgMusicToggle.checked;
            
            if (bgMusicEnabled) {
                playBGM();
            } else {
                stopBGM();
            }
            
            saveState();
        });
    }

    resetDataBtn.addEventListener('click', resetGameData);
    testSoundBtn.addEventListener('click', testSound);

    // ==================== 游戏初始化 ====================
    /**
     * 初始化游戏
     * 加载游戏状态并设置初始界面
     */
    loadState();
});
