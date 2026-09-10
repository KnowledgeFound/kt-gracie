import { CityState } from "../ENUMS/enums";

export class City {
    private name: string;
    private health: number = 0;
    private decay: number = 5;
    private contentScore: number = 0;
    private finalAssessmentScore: number = 0;

    constructor(name: string) {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    getContentScore(): number {
        return this.contentScore;
    }

    setContentScore(score: number): void {
        this.contentScore = score;
        this.recalculateHealth();
    }

    getFinalAssessmentScore(): number {
        return this.finalAssessmentScore;
    }

    setFinalAssessmentScore(score: number): void {
        this.finalAssessmentScore = score;
        this.recalculateHealth();
    }

    // `health` is the single source of truth. It starts at 0 and is derived
    // from the scores (minus decay) whenever they change, or set/decayed
    // directly. getHealth() always returns the stored value.
    public getHealth(): number {
        return this.health;
    }

    public setHealth(health: number): void {
        this.health = health;
    }

    public decayCityHealth(): void {
        this.health -= this.decay;
    }

    private recalculateHealth(): void {
        this.health = (0.5 * this.contentScore) + (0.5 * this.finalAssessmentScore) - this.decay;
    }

    public getCityState(): CityState {
        const health = this.getHealth();

        if (health >= 60) {
            return CityState.VIBRANT;
        } else if (health >= 40) {
            return CityState.NORMAL;
        } else{
            return CityState.CORRUPT;
        }
    }
}