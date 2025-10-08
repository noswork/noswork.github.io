import { getThemeColors } from '../utils/theme.js';

export class MazeRenderer {
    constructor({ canvas, state, getTheme }) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = state;
        this.getTheme = getTheme;
        this.dpr = window.devicePixelRatio || 1;
    }

    setDevicePixelRatio(dpr = 1) {
        this.dpr = dpr;
        if (!this.ctx) return;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (dpr !== 1) {
            this.ctx.scale(dpr, dpr);
        }
    }

    render() {
        const { maze, path, player, anim, start, end, mode } = this.state;
        const gridSize = this.state.gridSize;
        const cellSize = this.state.cellSize;
        const themeColors = getThemeColors(this.getTheme());
        const ctx = this.ctx;
        const canvasWidth = this.canvas.width / this.dpr;
        const canvasHeight = this.canvas.height / this.dpr;

        // Always use theme background (white or theme color)
        ctx.fillStyle = themeColors.bg;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

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

