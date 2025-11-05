// types/freefiresuper/index.d.ts
declare module "freefiresuper" {
    export interface Player {
        accountId: string;
        nickname: string;
        level?: number;
        bio?: string;
        clanName?: string;
        region?: string;
        stats(mode: string): Promise<any>;
        profile(): Promise<any>;
        checkBanned(): Promise<boolean>;
    }
    export function searchPlayerByNickname(
        nickname: string,
        region: string
    ): Promise<Player[]>;
    export function searchPlayerById(
        id: string,
        region: string
    ): Promise<Player>;
}

