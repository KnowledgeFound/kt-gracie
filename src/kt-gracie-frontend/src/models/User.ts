import { Gender } from "src/ENUMS/gender";
import { Gracie } from "./Gracie";
import { Progress } from "./Progress";

export class User{

    private id: string;
    private progress: Progress;
    private gracie: Gracie;

    constructor(
        userId: string,
        gender: Gender
    ){
        this.id = userId;
        this.progress = new Progress(0);
        this.gracie = new Gracie(gender);
    }

    public getId(): string {
        return this.id;
    }

}