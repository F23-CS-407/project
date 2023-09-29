

export class User {
    private id: string = "-1";
    private username?: string = undefined;
    private email: string = "";
    private profile_pic: string = "";   // This will need to be type upload
    private bio: string = "No Bio Yet";


    constructor(id : string) {
        this.id = id;
    }

    public get_id(): string {
        return this.id;
    }

    public get_username() {
        return this.username;
    }

    public set_username(new_username? : string) {
        this.username = new_username;
    }

    public get_bio() {
        return this.get_bio;
    }

    public set_bio(new_bio: string) {
        this.bio = new_bio;
    }
}