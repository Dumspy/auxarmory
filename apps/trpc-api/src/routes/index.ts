import { z } from "zod";

import { dbClient } from "@auxarmory/db";

import { protectedProcedure, router } from "../trpc";

export const indexRouter = router({
	listCharacters: protectedProcedure.query(async ({ ctx }) => {
		const accountId = Number(ctx.accountId);

		const characters = await dbClient.character.findMany({
			where: {
				accountId,
			},
			select: {
				id: true,
				name: true,
				equippedItemLevel: true,
				lastLogin: true,
				class: {
					select: {
						name: true,
					},
				},
				level: true,
				avatarUrl: true,
				activeSpec: true,
				favorite: true,
				mythicRating: true,
				mythicRatingColor: true
			},
			orderBy: {
				equippedItemLevel: "desc",
			}
		});

		return characters;
	}),
	getCharacterDetailedView: protectedProcedure
		.input(
			z.object({
				characterId: z.number().int().positive(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const accountId = Number(ctx.accountId);
			const characterId = input.characterId;

			const character = await dbClient.character.findFirst({
				where: {
					id: characterId,
					accountId,
				},
				select: {
					id: true,
					name: true,
					equippedItemLevel: true,
					lastLogin: true,
					level: true,
					avatarUrl: true,
					activeSpec: true,
					favorite: true,
				},
			});

			if (!character) {
				throw new Error("Character not found");
			}

			return character;
		}),
});
