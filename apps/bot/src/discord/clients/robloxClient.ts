// robloxClient.ts
import ky from "ky";
import type * as nobloxT from "noblox.js";
import pino from "pino";

const log = pino({ level: "info" });

/* ---------- Tipos ---------- */
export interface UserLookup {
    id: number;
    name: string;
    displayName: string;
}
export interface UserDetails {
    id: number;
    created?: string;
    description?: string;
    [k: string]: any;
}
export interface GroupRole {
    group: { id: number; name: string };
    role: { id: number; name: string };
}
export interface FriendEntry { id: number; username: string; }
export interface GameInfo { id?: number; name?: string; description?: string; rootPlaceId?: number; plays?: number; visits?: number; }
export interface ItemSummary { id: number; name: string; creator?: { id: number; name: string }; price?: number | null; }

/* ---------- Endpoints ---------- */
const USERS_API = "https://users.roblox.com/v1";
const GROUPS_API = "https://groups.roblox.com/v2";
const FRIENDS_API = "https://friends.roblox.com/v1";
const GAMES_API = "https://games.roblox.com/v1";
const CATALOG_API = "https://catalog.roblox.com/v2";
const INVENTORY_API = "https://inventory.roblox.com/v1";

/* ---------- Concurrency helper (pMap) ---------- */
export async function pMap<T, R>(
    items: T[],
    mapper: (item: T, index: number) => Promise<R>,
    concurrency = 5
): Promise<R[]> {
    const results = [] as unknown as R[]; // will fill by index
    let i = 0;

    async function worker() {
        while (true) {
            const idx = i++;
            if (idx >= items.length) break;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            results[idx] = await mapper(items[idx], idx);
        }
    }

    const workers = Array.from({ length: Math.min(concurrency, items.length) }).map(() => worker());
    await Promise.all(workers);
    return results;
}

/* ---------- HTTP helpers (ky) ---------- */
const kyInstance = ky.create({
    timeout: 10000,
    retry: { limit: 1 }
});

async function postJson<T = any>(url: string, body: any) {
    return kyInstance.post(url, { json: body }).json<T>();
}
async function getJson<T = any>(url: string) {
    return kyInstance.get(url).json<T>();
}

/* ---------- RobloxClient ---------- */
export class RobloxClient {
    private useNoblox: boolean;
    private noblox?: typeof nobloxT;

    constructor(opts?: { useNoblox?: boolean; nobloxModule?: typeof nobloxT; cookie?: string }) {
        this.useNoblox = !!opts?.useNoblox && !!opts?.nobloxModule;
        if (this.useNoblox && opts?.nobloxModule) {
            this.noblox = opts.nobloxModule;
            if (opts.cookie && this.noblox?.setCookie) {
                // @ts-ignore setCookie exists in runtime
                this.noblox.setCookie(opts.cookie);
                log.info("noblox cookie set");
            }
        }
    }

    /* lookup by username -> id/name/displayName */
    async lookupByUsername(username: string): Promise<UserLookup> {
        try {
            const json = await postJson<{ data?: any[] }>(`${USERS_API}/usernames/users`, { usernames: [username], excludeBannedUsers: true });
            const u = (json.data && json.data[0]) as any;
            if (!u) throw new Error("not-found");
            const userId = u.id as number;
            const name = u.name as string;
            const displayName = u.displayName as string;
            return { id: userId as number, name: name as string, displayName: displayName as string } as UserLookup;
        } catch (err) {
            if (this.useNoblox && this.noblox?.getIdFromUsername) {
                const id = await this.noblox.getIdFromUsername(username) as number;
                return { id: id as number, name: username as string, displayName: username as string } as UserLookup;
            }
            throw err;
        }
    }

    async getUserDetails(userId: number): Promise<UserDetails> {
        const json = await getJson(`${USERS_API}/users/${userId}`);
        return json as UserDetails;
    }

    async getUserGroups(userId: number, limit = 10): Promise<GroupRole[]> {
        try {
            const json = await getJson<{ data?: GroupRole[] }>(`${GROUPS_API}/users/${userId}/groups/roles`);
            return (json.data ?? []) as GroupRole[];
        } catch (err) {
            if (this.useNoblox && this.noblox?.getGroups) {
                const raw = await this.noblox.getGroups(userId) as any[];
                return raw.slice(0, limit).map((g: any) => ({ group: { id: g.Id as number, name: g.Name as string }, role: { id: g.RoleId as number, name: g.Role as string } })) as GroupRole[];
            }
            throw err;
        }
    }

    async getFriends(userId: number, limit = 50): Promise<FriendEntry[]> {
        try {
            const json = await getJson<{ data?: any[] }>(`${FRIENDS_API}/users/${userId}/friends?limit=${limit}`);
            return (json.data ?? []).map(d => ({ id: d.id as number, username: d.name as string })) as FriendEntry[];
        } catch (err) {
            // fallback: noblox may not provide direct list without cookie; return empty safe fallback
            if (this.useNoblox) return [];
            throw err;
        }
    }

    async getGamesFromUser(userId: number, limit = 10): Promise<GameInfo[]> {
        // try profile playergames-json (public)
        try {
            const json = await getJson<any>(`https://www.roblox.com/users/profile/playergames-json?userId=${userId}`);
            const games = (json?.Games ?? []) as any[];
            return games.slice(0, limit).map(g => ({
                id: (g.UniverseID ?? g.UniverseID) as number,
                name: g.Title as string,
                plays: g.Plays as number,
                visits: g.Visits as number
            } as GameInfo));
        } catch (e) {
            // best-effort fallback: return empty
            return [];
        }
    }

    async searchCatalogItems(query: string, limit = 10): Promise<ItemSummary[]> {
        const url = `${CATALOG_API}/search/items/details?keyword=${encodeURIComponent(query)}&limit=${limit}`;
        try {
            const json = await getJson<any>(url);
            const items = (json.data ?? json.Items ?? []) as any[];
            return items.slice(0, limit).map(it => ({
                id: (it.id ?? it.itemId ?? it.AssetId) as number,
                name: (it.name ?? it.Name ?? it.Title) as string,
                creator: it.creator ? { id: it.creator.id as number, name: it.creator.name as string } : undefined,
                price: (it.price ?? it.recentAveragePrice ?? null) as number | null
            })) as ItemSummary[];
        } catch (err) {
            // legacy fallback
            try {
                const legacy = await getJson<any[]>(`https://search.roblox.com/catalog/json?Keyword=${encodeURIComponent(query)}&PageNumber=1&ResultsPerPage=${limit}`);
                return legacy.slice(0, limit).map(l => ({ id: l.Id as number, name: l.Name as string })) as ItemSummary[];
            } catch {
                throw err;
            }
        }
    }

    async getUserInventory(userId: number, limit = 50): Promise<ItemSummary[]> {
        try {
            // some endpoints require can-view check
            const canView = await getJson<{ canView?: boolean }>(`${INVENTORY_API}/users/${userId}/can-view-inventory`).catch(() => ({}));
            if (canView === false) return [];

            const inv = await getJson<any>(`${INVENTORY_API}/users/${userId}/assets?limit=${limit}`).catch(() => null);
            const items = (inv?.data ?? inv?.items ?? []) as any[];
            return items.slice(0, limit).map(it => ({ id: (it.id ?? it.assetId) as number, name: (it.name ?? it.assetName) as string })) as ItemSummary[];
        } catch (err) {
            // noblox fallback: NOTE -> noblox.getInventory expects multiple args; pass as required
            if (this.useNoblox && this.noblox?.getInventory) {
                // noblox.getInventory signature expects several args; call with explicit typed args using `as`
                // Expected: getInventory(userId: number, assetType?: number | string, start?: number, maxRows?: number)
                // We'll call with assetType = 0 (all), start = 0, maxRows = limit
                // Use `as unknown as` casts to silence TS if types differ
                const inv = await (this.noblox.getInventory as any)(userId as number, 0 as number, 0 as number, limit as number);
                return (inv as any[]).slice(0, limit).map(i => ({ id: (i.assetId ?? i.id) as number, name: (i.name ?? i.title) as string })) as ItemSummary[];
            }
            return [];
        }
    }

    /**
     * aggregateUserFull: executa várias chamadas em paralelo com controle de concorrência
     */
    async aggregateUserFull(userId: number, opts?: { concurrency?: number }) {
        const concurrencyVal = opts?.concurrency ?? 5 as number;

        const tasks = [
            async () => this.getUserDetails(userId),
            async () => this.getUserGroups(userId, 10),
            async () => this.getFriends(userId, 50),
            async () => this.getGamesFromUser(userId, 10),
            async () => this.getUserInventory(userId, 30)
        ];

        // executar tasks com pMap mantendo concurrency
        const results = await pMap<typeof tasks[0], any>(tasks, async (fn) => {
            // fn é uma função que retorna promise
            // @ts-ignore
            return await fn();
        }, concurrencyVal);

        return {
            details: results[0] as UserDetails,
            groups: results[1] as GroupRole[],
            friends: results[2] as FriendEntry[],
            games: results[3] as GameInfo[],
            inventory: results[4] as ItemSummary[]
        };
    }
}

