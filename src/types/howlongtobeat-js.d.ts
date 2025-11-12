declare module 'howlongtobeat-js' {
  export class HowLongToBeat {
    constructor(minSimilarity?: number);
    search(
      gameName: string,
      searchModifiers?: any,
      similarityMatchCase?: boolean
    ): Promise<HowLongToBeatEntry[] | null>;
    searchFromId(gameId: number): Promise<HowLongToBeatEntry | null>;
  }

  export interface HowLongToBeatEntry {
    gameId: number;
    gameName: string | null;
    gameAlias: string | null;
    gameType: string | null;
    gameImageUrl: string | null;
    gameWebLink: string | null;
    reviewScore: number | null;
    profileDev: string | null;
    profilePlatforms: string[] | null;
    releaseWorld: string | null;
    similarity: number;
    mainStory: number | null;
    mainExtra: number | null;
    completionist: number | null;
    allStyles: number | null;
  }

  export enum SearchModifiers {
    NONE = 0,
    ISOLATE_DLC = 1,
    HIDE_DLC = 2,
  }
}

