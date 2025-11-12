import { HowLongToBeat } from "howlongtobeat-js";

const hltbService = new HowLongToBeat(0.3); // Lower similarity threshold for better matching

export interface HLTBData {
  id: string;
  name: string;
  imageUrl?: string;
  gameplayMain?: number;
  gameplayMainExtra?: number;
  gameplayCompletionist?: number;
  timeLabels: string[][];
}

/**
 * Search for a game on HowLongToBeat
 */
export async function searchHLTB(gameName: string, appId?: number): Promise<HLTBData | null> {
  console.log(`[HLTB] Starting search for: "${gameName}"${appId ? ` (Steam ID: ${appId})` : ""}`);
  
  if (!gameName || gameName.trim().length === 0) {
    console.log("[HLTB] Empty game name provided");
    return null;
  }

  const trimmedName = gameName.trim();
  console.log(`[HLTB] Searching with name: "${trimmedName}"`);

  try {
    // Try exact name first
    console.log(`[HLTB] Attempting search for: "${trimmedName}"`);
    let results = await hltbService.search(trimmedName);
    
    console.log(`[HLTB] Search returned ${results?.length || 0} results`);
    
    if (results && results.length > 0) {
      console.log(`[HLTB] First result: "${results[0]?.gameName}" (similarity: ${results[0]?.similarity ?? "N/A"})`);
      
      // Use the first result if similarity is reasonable
      const firstResult = results[0];
      const similarity = firstResult?.similarity ?? 0;
      
      if (similarity >= 0.3) {
        console.log(`[HLTB] Using match with similarity ${similarity}`);
        return convertToHLTBData(firstResult);
      } else {
        console.log(`[HLTB] Similarity too low (${similarity}), trying variations...`);
      }
    }

    // Try variations if exact match didn't work
    const variations = [
      // Remove everything after colon
      trimmedName.split(":")[0]?.trim(),
      // Remove everything after dash
      trimmedName.split("-")[0]?.trim(),
      // Remove text in parentheses
      trimmedName.replace(/\s*\([^)]*\)\s*/g, "").trim(),
      // Remove "The" prefix
      trimmedName.replace(/^The\s+/i, "").trim(),
      // First 2 words
      trimmedName.split(/\s+/).slice(0, 2).join(" "),
    ].filter((v): v is string => !!v && v.length > 2 && v !== trimmedName);

    for (const variation of variations) {
      console.log(`[HLTB] Trying variation: "${variation}"`);
      try {
        const varResults = await hltbService.search(variation);
        if (varResults && varResults.length > 0) {
          const varResult = varResults[0];
          const varSimilarity = varResult?.similarity ?? 0;
          console.log(`[HLTB] Variation result: "${varResult?.gameName}" (similarity: ${varSimilarity})`);
          
          if (varSimilarity >= 0.3) {
            console.log(`[HLTB] Using variation match with similarity ${varSimilarity}`);
            return convertToHLTBData(varResult);
          }
        }
      } catch (varError: any) {
        console.log(`[HLTB] Error with variation "${variation}":`, varError?.message);
      }
    }

    console.log(`[HLTB] No suitable match found for "${trimmedName}"`);
    return null;
  } catch (error: any) {
    console.error("[HLTB] Error in searchHLTB:", error);
    console.error("[HLTB] Error message:", error?.message);
    console.error("[HLTB] Error stack:", error?.stack);
    return null;
  }
}

/**
 * Convert HowLongToBeatEntry to HLTBData format
 */
function convertToHLTBData(entry: any): HLTBData {
  // Map the time labels - this package uses different property names
  const timeLabels: string[][] = [];
  if (entry.mainStory !== null) {
    timeLabels.push(["gameplayMain", "Main Story"]);
  }
  if (entry.mainExtra !== null) {
    timeLabels.push(["gameplayMainExtra", "Main + Extras"]);
  }
  if (entry.completionist !== null) {
    timeLabels.push(["gameplayCompletionist", "Completionist"]);
  }

  return {
    id: String(entry.gameId),
    name: entry.gameName || entry.gameAlias || "Unknown",
    imageUrl: entry.gameImageUrl || undefined,
    gameplayMain: entry.mainStory ?? undefined,
    gameplayMainExtra: entry.mainExtra ?? undefined,
    gameplayCompletionist: entry.completionist ?? undefined,
    timeLabels: timeLabels,
  };
}

/**
 * Get detailed information for a specific game by ID
 */
export async function getHLTBDetails(gameId: string): Promise<HLTBData | null> {
  try {
    console.log(`[HLTB] Fetching details for game ID: ${gameId}`);
    const gameIdNum = parseInt(gameId);
    
    if (isNaN(gameIdNum)) {
      console.error(`[HLTB] Invalid game ID: ${gameId}`);
      return null;
    }

    const details = await hltbService.searchFromId(gameIdNum);
    
    if (details) {
      console.log(`[HLTB] Details fetched: "${details.gameName}"`);
      return convertToHLTBData(details);
    }
    
    console.log(`[HLTB] No details found for ID ${gameId}`);
    return null;
  } catch (error: any) {
    console.error("[HLTB] Error getting details:", error?.message);
    return null;
  }
}
