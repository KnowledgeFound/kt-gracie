import { CityState } from "../ENUMS/enums";

export class City {
    private name: string;
    private health: number = 100;
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
    }

    getFinalAssessmentScore(): number {
        return this.finalAssessmentScore;
    }

    setFinalAssessmentScore(score: number): void {
        this.finalAssessmentScore = score;
    }

    public getHealth(): number {
        return (0.5 * this.contentScore) + (0.5 * this.finalAssessmentScore) - this.decay;
    }

    public setHealth(health: number): void {
        this.health = health;
    }

    public decayCityHealth(): void {
        this.health -= this.decay;
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