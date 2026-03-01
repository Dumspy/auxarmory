import {
	createAccountClient,
	createApplicationClient,
} from '../../harness.clients'

export async function resolveCharacterIdentity() {
	const accountClient = createAccountClient()
	const accountSummary = await accountClient.wow.AccountProfileSummary()
	if (!accountSummary.success) {
		throw new Error(
			`AccountProfileSummary failed: ${accountSummary.error_type}`,
		)
	}

	const character = accountSummary.data.wow_accounts[0]?.characters[0] ?? null
	if (!character) {
		throw new Error('AccountProfileSummary did not include any characters')
	}
	const realmSlug = character.realm.slug
	const characterName = character.name
	if (!realmSlug || !characterName) {
		throw new Error('Character identity missing realm slug or name')
	}
	return { realmSlug, characterName }
}

export async function resolveCharacterWithGuild() {
	const accountClient = createAccountClient()
	const accountSummary = await accountClient.wow.AccountProfileSummary()
	if (!accountSummary.success) {
		throw new Error(
			`AccountProfileSummary failed: ${accountSummary.error_type}`,
		)
	}

	const appClient = createApplicationClient()
	for (const wowAccount of accountSummary.data.wow_accounts) {
		for (const character of wowAccount.characters) {
			const realmSlug = character.realm.slug
			const characterName = character.name
			if (!realmSlug || !characterName) continue

			const profile = await appClient.wow.CharacterProfileSummary(
				realmSlug,
				characterName,
			)
			if (!profile.success) continue
			const guild = profile.data.guild
			if (!guild) continue
			const guildRealmSlug = guild.realm.slug
			const guildNameSlug = guild.name.toLowerCase().replace(/\s+/g, '-')
			if (!guildRealmSlug || !guildNameSlug) continue

			return {
				realmSlug,
				characterName,
				guildRealmSlug,
				guildNameSlug,
			}
		}
	}

	throw new Error('No characters with guilds found in account profile')
}
