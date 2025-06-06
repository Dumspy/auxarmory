import type { Job } from "bullmq";

import { ApplicationClient, localeToString } from "@auxarmory/battlenet";
import { dbClient } from "@auxarmory/db";

import type { JobPayloads } from "../types";
import { SyncServiceClient } from "../client";
import { env } from "../env";
import { JobPayloadSchemas, JobTypes } from "../types";

export async function processCharacterDataSync(
	job: Job<JobPayloads[typeof JobTypes.SYNC_CHARACTER_DATA]>,
) {
	const { accountId, region, characterName, realmSlug } = JobPayloadSchemas[
		JobTypes.SYNC_CHARACTER_DATA
	].parse(job.data);

	const account = await dbClient.account.findUnique({
		where: { id: accountId },
	});

	if (!account) {
		throw new Error(`Account with ID ${accountId} not found`);
	}

	const apiClient = new ApplicationClient({
		clientId: env.BATTLENET_CLIENT_ID,
		clientSecret: env.BATTLENET_CLIENT_SECRET,
		region: region,
		suppressZodErrors: true,
	});

	console.log(`Processing account data sync for ${accountId} (${region})`);

	try {
		await job.updateProgress(10);

		const characterProfile = await apiClient.wow.CharacterProfileSummary(
			realmSlug,
			characterName.toLowerCase(),
		);

		if (!characterProfile.success) {
			throw new Error(
				`Failed to fetch character profile for ${characterName} on realm ${realmSlug}`,
			);
		}

		if (characterProfile.data.guild) {
			const syncServiceClient = new SyncServiceClient();

			await syncServiceClient.addJob(JobTypes.SYNC_GUILD_DATA, {
				guild: {
					id: characterProfile.data.guild.id,
					slug: characterProfile.data.guild.name
						.toLowerCase()
						.replace(/\s+/g, "-"),
				},
				realm: {
					id: characterProfile.data.guild.realm.id,
					slug: characterProfile.data.guild.realm.slug,
				},
				region,
			});
		}

		const mythicKeystoneProfile =
			await apiClient.wow.CharacterMythicKeystoneProfileIndex(
				realmSlug,
				characterName.toLowerCase(),
			);

		await job.updateProgress(50);

		const characterMedia = await apiClient.wow.CharacterMediaSummary(
			realmSlug,
			characterName.toLowerCase(),
		);

		if (!characterMedia.success) {
			throw new Error(
				`Failed to fetch character media for ${characterName} on realm ${realmSlug}`,
			);
		}

		const avatarUrl = characterMedia.data.assets.find(
			(asset) => asset.key === "avatar",
		)?.value;

		const character = {
			name: characterProfile.data.name,
			gender: characterProfile.data.gender.type,
			level: characterProfile.data.level,
			averageItemLevel: characterProfile.data.average_item_level,
			equippedItemLevel: characterProfile.data.equipped_item_level,
			lastLogin: new Date(characterProfile.data.last_login_timestamp),
			activeSpec: characterProfile.data.active_spec?.name
				? localeToString(characterProfile.data.active_spec.name)
				: undefined,
			avatarUrl,

			faction: characterProfile.data.faction.type,
			raceId: characterProfile.data.race.id,
			classId: characterProfile.data.character_class.id,

			realmId: characterProfile.data.realm.id,
			guildMember: characterProfile.data.guild
				? {
						connect: {
							characterId: characterProfile.data.id,
						},
					}
				: undefined,

			mythicRating:
				mythicKeystoneProfile.data?.current_mythic_rating?.rating,
			mythicRatingColor: mythicKeystoneProfile.data?.current_mythic_rating
				? `${mythicKeystoneProfile.data.current_mythic_rating.color.r}, ${mythicKeystoneProfile.data.current_mythic_rating.color.g}, ${mythicKeystoneProfile.data.current_mythic_rating.color.b}, ${mythicKeystoneProfile.data.current_mythic_rating.color.a}`
				: undefined,
		};

		if (characterProfile.data.guild) {
			await dbClient.guildMember.upsert({
				where: {
					characterId: characterProfile.data.id,
				},
				create: {
					characterId: characterProfile.data.id,
					guildId: characterProfile.data.guild.id,
				},
				update: {
					guildId: characterProfile.data.guild.id,
				},
			});
		}

		await dbClient.character.upsert({
			where: { id: characterProfile.data.id },
			create: {
				id: characterProfile.data.id,
				accountId: account.id,
				...character,
			},
			update: {
				...character,
			},
		});

		const equipment = await apiClient.wow.CharacterEquipmentSummary(
			realmSlug,
			characterName,
		);

		if (!equipment.success) {
			if (equipment.error_type === "zod") {
				throw new Error(
					`Failed to parse character equipment for ${characterName} on realm ${realmSlug}: ${equipment.error.message}`,
				);
			}

			throw new Error(
				`Failed to fetch character equipment for ${characterName} on realm ${realmSlug}`,
			);
		}

		for (const item of equipment.data.equipped_items) {
			if (
				!(await dbClient.equipmentMedia.findUnique({
					where: { id: item.media.id },
				}))
			) {
				const itemMedia = await apiClient.wow.ItemMedia(item.item.id);
				if (!itemMedia.success) {
					console.warn(
						`Failed to fetch media for item ${item.item.id}`,
					);
					continue;
				}

				await dbClient.equipmentMedia.create({
					data: {
						id: item.media.id,
						mediaUrl:
							itemMedia.data.assets.find(
								(asset) => asset.key === "icon",
							)?.value ?? "", // TOOD Placerholder image?
					},
				});
			}

			const gemIds =
				item.sockets
					?.map((s) => s.item?.id)
					.filter((n): n is number => n !== undefined) ?? [];
			const craftedStats =
				item.modified_crafting_stat?.map((stat) => stat.id) ?? [];

			const itemData = {
				ilvl: item.level.value,
				id: item.item.id,
				name: localeToString(item.name) ?? `${item.item.id}`,
				quality: item.quality.type,
				bonusIds: item.bonus_list,
				gemIds,
				mediaId: item.media.id,
				enchantId: item.enchantments?.[0]?.enchantment_id,
				track: item.name_description?.display_string
					? localeToString(item.name_description.display_string)
					: undefined,
				craftedStats,
			};

			await dbClient.characterEquipment.upsert({
				where: {
					characterId_slot: {
						characterId: characterProfile.data.id,
						slot: item.slot.type,
					},
				},
				create: {
					characterId: characterProfile.data.id,
					slot: item.slot.type,
					...itemData,
				},
				update: itemData,
			});
		}

		await job.updateProgress(100);

		console.log(`Successfully synced character data for ${characterName}`);

		return {
			success: true,
			characterId: characterProfile.data.id,
			processedAt: new Date().toISOString(),
		};
	} catch (error) {
		console.error(
			`Failed to sync character data for ${characterName}:`,
			error,
		);
		throw error;
	}
}
