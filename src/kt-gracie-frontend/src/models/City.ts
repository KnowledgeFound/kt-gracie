export class City {
    private name: string;
    private health: number;

    constructor() {
        this.name = "Generic City Name";
        this.health = 100;
    }

    public getName(): string {
        return this.name;
    }

    public getHealth(): number {
        return this.health;
    }

    public setHealth(health: number): void {
        this.health = health;
    }
}