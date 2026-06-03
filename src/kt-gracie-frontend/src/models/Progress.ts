export class Progress {
    private progress: number;

    constructor(progress: number) {
        this.progress = progress;
    }

    public getProgress(): number {
        return this.progress;
    }

    public setProgress(progress: number): void {
        this.progress = progress;
    }
}