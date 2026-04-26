export class User{

    private id: string;

    constructor(
        public userId: string,
    ){
        this.id = userId;
    }

    public getId(): string {
        return this.id;
    }

}