export class ClassicTimer {
    constructor({ onTick, onComplete }) {
        this.onTick = onTick;
        this.onComplete = onComplete;
        this.interval = null;
        this.timeRemaining = 0;
    }

    start(seconds) {
        this.clear();
        this.timeRemaining = seconds;
        this.interval = setInterval(() => {
            this.timeRemaining -= 1;
            if (this.timeRemaining <= 0) {
                this.clear();
                if (this.onComplete) {
                    this.onComplete();
                }
            }
            this.onTick(this.timeRemaining);
        }, 1000);
    }

    clear() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

