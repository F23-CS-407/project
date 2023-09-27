export class User {
    private id: number = -1;
    private username?: string = undefined;

    constructor(id : number) {
        this.id = id;
    }

    public get_id(id : number): number {
        return this.id;
    }

    public get_username() {
        return this.username;
    }

    public set_username(new_username? : string) {
        this.username = new_username;
    }
}