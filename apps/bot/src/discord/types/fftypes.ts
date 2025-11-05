export interface FFPlayerSearchResult {
    account_id: number;
    nickname: string;
    level: number;
    region: string;
    bio: string;
    clan_name: string;
    release_version: string;
}

// Representa o resultado completo da pesquisa de um jogador
export interface FFPlayerSearchResponse {
    result: FFPlayerSearchResult[];
}

export interface ExternalIconInfo {
    status: string;
    showType: string;
}

export interface BasicInfo {
    accountId: string;
    accountType: number;
    nickname: string;
    region: string;
    level: number;
    exp: number;
    bannerId: number;
    headPic: number;
    hasElitePass: boolean;
    rank: number;
    rankingPoints: number;
    badgeCnt: number;
    badgeId: number;
    seasonId: number;
    liked: number;
    showRank: boolean;
    lastLoginAt: string;
    csRank: number;
    csRankingPoints: number;
    weaponSkinShows: number[];
    pinId: number;
    maxRank: number;
    csMaxRank: number;
    accountPrefers: Record<string, unknown>;
    createAt: string;
    veteranLeaveDaysTag?: string;
    title?: number;
    externalIconInfo: ExternalIconInfo;
    releaseVersion?: string;
    veteranExpireTime?: string;
    showBrRank: boolean;
    showCsRank: boolean;
    socialHighLightsWithBasicInfo: Record<string, unknown>;
}

export interface ProfileInfo {
    avatarId: number;
    clothes: number[];
    equipedSkills: number[];
    pvePrimaryWeapon: number;
    endTime: number;
    isMarkedStar: boolean;
}

export interface ClanBasicInfo {
    clanId: string;
    clanName: string;
    captainId: string;
    clanLevel: number;
    capacity: number;
    memberNum: number;
}

export interface CaptainBasicInfo extends BasicInfo { }

export interface PetInfo {
    id: number;
    level: number;
    exp: number;
    isSelected: boolean;
    skinId: number;
    selectedSkillId: number;
}

export interface SocialInfo {
    accountId: string;
    gender: string;
    language: string;
    timeActive: string;
    modePrefer: string;
    signature: string;
    rankShow: string;
}

export interface DiamondCostRes {
    diamondCost: number;
}

export interface CreditScoreInfo {
    creditScore: number;
    rewardState: string;
    periodicSummaryEndTime: string;
}

export interface FFPlayerData {
    basicInfo: BasicInfo;
    profileInfo: ProfileInfo;
    clanBasicInfo?: ClanBasicInfo;
    captainBasicInfo?: CaptainBasicInfo;
    petInfo?: PetInfo;
    socialInfo?: SocialInfo;
    diamondCostRes?: DiamondCostRes;
    creditScoreInfo?: CreditScoreInfo;
}

