import { getThemeColors } from '../utils/theme.js';

export class MazeRenderer {
    constructor({ canvas, state, getTheme }) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = state;
        this.getTheme = getTheme;
        
        if (!this.ctx) {
            console.error('[Renderer] 无法获取Canvas 2D上下文');
            throw new Error('Canvas 2D context initialization failed');
        }
        
        console.log('[Renderer] 渲染器初始化成功');
    }

    render() {
        try {
            const { maze, path, player, anim, start, end, mode } = this.state;
            const gridSize = this.state.gridSize;
            const cellSize = this.state.cellSize;
            const themeColors = getThemeColors(this.getTheme());
            const ctx = this.ctx;

            // 验证必要的数据
            if (!maze || !maze.length) {
                console.error('[Renderer] 迷宫数据无效:', maze);
                return;
            }

            // Always use theme background (white or theme color)
            ctx.fillStyle = themeColors.bg;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (path.length > 1) {
            ctx.strokeStyle = themeColors.pathStroke;
            ctx.lineWidth = cellSize * 0.15;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(path[0].x * cellSize + cellSize / 2, path[0].y * cellSize + cellSize / 2);
            for (let i = 1; i < path.length; i++) {
                ctx.lineTo(path[i].x * cellSize + cellSize / 2, path[i].y * cellSize + cellSize / 2);
            }
            ctx.stroke();
        }

        ctx.strokeStyle = themeColors.wall;
        ctx.lineWidth = 2;
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const cell = maze[y]?.[x];
                if (!cell) continue;
                const px = x * cellSize;
                const py = y * cellSize;

                ctx.beginPath();
                if (cell.top) {
                    ctx.moveTo(px, py);
                    ctx.lineTo(px + cellSize, py);
                }
                if (cell.right) {
                    ctx.moveTo(px + cellSize, py);
                    ctx.lineTo(px + cellSize, py + cellSize);
                }
                if (cell.bottom) {
                    ctx.moveTo(px, py + cellSize);
                    ctx.lineTo(px + cellSize, py + cellSize);
                }
                if (cell.left) {
                    ctx.moveTo(px, py);
                    ctx.lineTo(px, py + cellSize);
                }
                ctx.stroke();
            }
        }

        ctx.fillStyle = themeColors.start;
        ctx.beginPath();
        ctx.arc(start.x * cellSize + cellSize / 2, start.y * cellSize + cellSize / 2, cellSize * 0.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = themeColors.end;
        ctx.beginPath();
        ctx.arc(end.x * cellSize + cellSize / 2, end.y * cellSize + cellSize / 2, cellSize * 0.25, 0, Math.PI * 2);
        ctx.fill();

        const animX = anim.player.x * cellSize + cellSize / 2;
        const animY = anim.player.y * cellSize + cellSize / 2;

        ctx.fillStyle = themeColors.player;
        ctx.beginPath();
        ctx.arc(animX, animY, cellSize * 0.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = themeColors.wall;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dark mode: Apply fog of war
        if (mode === 'dark') {
            this.renderDarkModeFog(cellSize, themeColors);
        }
        } catch (error) {
            console.error('[Renderer] 渲染过程中出错:', error);
            // 显示错误信息在canvas上
            this.ctx.fillStyle = '#000000';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('渲染错误', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    renderDarkModeFog(cellSize, themeColors) {
        const { player, visionRadius } = this.state;
        const ctx = this.ctx;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        // Create a radial gradient: transparent in vision area, black outside
        const playerCenterX = player.x * cellSize + cellSize / 2;
        const playerCenterY = player.y * cellSize + cellSize / 2;
        const visionRadiusPixels = visionRadius * cellSize;

        const gradient = ctx.createRadialGradient(
            playerCenterX, playerCenterY, 0,
            playerCenterX, playerCenterY, visionRadiusPixels
        );
        
        // Vision area: transparent (can see maze)
        // Outside: black mask (fog of war)
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');      // Center: fully transparent
        gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0)');    // Most of vision: transparent
        gradient.addColorStop(0.85, 'rgba(0, 0, 0, 0.7)'); // Edge: fading to black
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');   // Outside: nearly black

        // Apply black mask outside vision range
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
}

