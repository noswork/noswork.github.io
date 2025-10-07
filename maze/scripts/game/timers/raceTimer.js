export class RaceTimer {
    constructor({ onTick, onComplete }) {
        this.onTick = onTick;
        this.onComplete = onComplete;
        this.interval = null;
        this.startTime = 0;
        this.elapsedSeconds = 0;
    }

    start() {
        this.clear();
        this.startTime = Date.now();
        this.interval = setInterval(() => {
            this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
            this.onTick(this.elapsedSeconds);
        }, 100);
    }

    complete() {
        this.clear();
        if (this.onComplete) {
            this.onComplete(this.elapsedSeconds);
        }
    }

    clear() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

