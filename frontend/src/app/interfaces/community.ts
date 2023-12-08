export interface CommunityInterface {
    _id: string;
    name: string;
    description: string;
    mods: any[];
    posts: any[];
    boards: any[];
    followers: any[];
    __v: number;
    banner: string;
}