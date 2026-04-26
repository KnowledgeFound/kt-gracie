import { Gender } from '../ENUMS/gender'

export class Gracie {
    private name: string;
    private gender: Gender;

    constructor(gender: Gender) {
        this.name = "Gracie";
        this.gender = gender;
    }

    public getName(): string {
        return this.name;
    }

    public getGender(): Gender {
        return this.gender;
    }

    public setGender(gender: Gender): void {
        this.gender = gender;
    }
}
