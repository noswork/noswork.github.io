export class GameState {
    constructor({ gridSize }) {
        this.gridSize = gridSize;
        this.reset();
    }

    reset() {
        this.maze = [];
        this.path = [];
        this.stepCount = 0;
        this.player = { x: 0, y: 0 };
        this.start = { x: 0, y: 0 };
        this.end = { x: 0, y: 0 };
        this.anim = {
            progress: 1,
            player: { x: 0, y: 0 },
            start: { x: 0, y: 0 }
        };
        this.gameWon = false;
        this.gameOver = false;
        this.paused = false;
        this.mode = 'just-maze';
        this.race = {
            mazesCompleted: 0,
            totalSteps: 0,
            timeRemaining: null,
            timeLimit: null,
            mazeTarget: null,
            timerInterval: null,
            startTime: 0,
            elapsed: 0,
            session: null,
            sessionStartInProgress: false,
            latestSessionToken: null
        };
        // Dark mode settings
        this.visionRadius = 3; // How many cells the player can see around them
    }
}

