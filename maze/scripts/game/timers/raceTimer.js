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
            // 保留小數點後2位的精確時間
            this.elapsedSeconds = Math.round((Date.now() - this.startTime) / 10) / 100;
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
            // 在清除前更新最終時間，確保精確度
            this.elapsedSeconds = Math.round((Date.now() - this.startTime) / 10) / 100;
            // 觸發最後一次更新，確保狀態同步
            if (this.onTick) {
                this.onTick(this.elapsedSeconds);
            }
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

