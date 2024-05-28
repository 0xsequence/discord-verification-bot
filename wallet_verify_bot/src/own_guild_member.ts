export interface OwnGuildMember {
    communication_disabled_until?: any;
    flags: number;
    joined_at: string;
    nick: string;
    pending: boolean;
    premium_since?: any;
    roles: string[];
    user: User;
    mute: boolean;
    deaf: boolean;
}

export interface User {
    id: string;
    username: string;
    flags: number;
    global_name: string;
    clan?: any;
}
