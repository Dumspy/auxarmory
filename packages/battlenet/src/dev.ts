import fs from "fs";
import { CharacterStatisticsSummaryResponse } from "./wow/profile/character_statistics";
import { ApplicationClient } from ".";

(async () => {
    const client = new ApplicationClient({
        region: "eu",
        clientId: process.env.BATTLENET_CLIENT_ID || "",
        clientSecret: process.env.BATTLENET_CLIENT_SECRET || "",
    });

    const index = await client.wow.CharacterStatisticsSummary("azjolnerub", "dispy");

    const res = CharacterStatisticsSummaryResponse.safeParse(index);
    if (res.success) {
        console.log("index ok");
    } else {
        console.error("Heirloom parse error", res.error);
        console.log(index);

        const errorFile = `./out/error.txt`;
        const dataFile = `./out/data.json`;
        fs.writeFileSync(errorFile, res.error.message);
        fs.writeFileSync(dataFile, JSON.stringify(index, null, 2));
        console.error(`Heirloom parse error, saved to ${errorFile} and ${dataFile}`);
    }

    // for (const obj of index.seasons) {
    // 	const data = await client.wow.CharacterMythicKeystoneSeason("azjolnerub", "dispy", obj.id);
    // 	const id = data.season.id
    // 	const res = CharacterMythicKeystoneSeasonResponse.safeParse(data);
    // 	if (res.success) {
    // 		console.log("index ok", id);
    // 	} else {
    // 		//console.error("Heirloom parse error", res.error);
    // 		//console.dir(data, { depth: null });

    // 		const errorFile = `./out/error-${id}.txt`;
    // 		const dataFile = `./out/data-${id}.json`;
    // 		fs.writeFileSync(errorFile, res.error.message);
    // 		fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

    // 		console.error(`Heirloom parse error for ID ${id}, saved to ${errorFile} and ${dataFile}`);
    // 	}
    // }
})();
