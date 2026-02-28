import { relations } from 'drizzle-orm'
import {
	pgTable,
	text,
	timestamp,
	boolean,
	index,
	uniqueIndex,
	integer,
} from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').default(false).notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
})

export const session = pgTable(
	'session',
	{
		id: text('id').primaryKey(),
		expiresAt: timestamp('expires_at').notNull(),
		token: text('token').notNull().unique(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		activeOrganizationId: text('active_organization_id'),
		activeTeamId: text('active_team_id'),
	},
	(table) => [index('session_userId_idx').on(table.userId)],
)

export const account = pgTable(
	'account',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: timestamp('access_token_expires_at'),
		refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
		scope: text('scope'),
		password: text('password'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index('account_userId_idx').on(table.userId)],
)

export const verification = pgTable(
	'verification',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index('verification_identifier_idx').on(table.identifier)],
)

export const organization = pgTable(
	'organization',
	{
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		slug: text('slug').notNull(),
		logo: text('logo'),
		createdAt: timestamp('created_at').notNull(),
		metadata: text('metadata'),
	},
	(table) => [uniqueIndex('organization_slug_idx').on(table.slug)],
)

export const team = pgTable(
	'team',
	{
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organization.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').notNull(),
		updatedAt: timestamp('updated_at').$onUpdate(
			() => /* @__PURE__ */ new Date(),
		),
	},
	(table) => [index('team_organizationId_idx').on(table.organizationId)],
)

export const teamMember = pgTable(
	'team_member',
	{
		id: text('id').primaryKey(),
		teamId: text('team_id')
			.notNull()
			.references(() => team.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at'),
	},
	(table) => [
		index('teamMember_teamId_idx').on(table.teamId),
		index('teamMember_userId_idx').on(table.userId),
	],
)

export const member = pgTable(
	'member',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organization.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		role: text('role').default('member').notNull(),
		createdAt: timestamp('created_at').notNull(),
	},
	(table) => [
		index('member_organizationId_idx').on(table.organizationId),
		index('member_userId_idx').on(table.userId),
	],
)

export const invitation = pgTable(
	'invitation',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organization.id, { onDelete: 'cascade' }),
		email: text('email').notNull(),
		role: text('role'),
		teamId: text('team_id').references(() => team.id, {
			onDelete: 'set null',
		}),
		status: text('status').default('pending').notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		inviterId: text('inviter_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
	},
	(table) => [
		index('invitation_organizationId_idx').on(table.organizationId),
		index('invitation_email_idx').on(table.email),
		index('invitation_teamId_idx').on(table.teamId),
	],
)

export const wowCharacterOwnership = pgTable(
	'wow_character_ownership',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		providerId: text('provider_id').notNull(),
		accountId: text('account_id').notNull(),
		region: text('region').notNull(),
		realmId: integer('realm_id').notNull(),
		realmSlug: text('realm_slug').notNull(),
		characterId: integer('character_id').notNull(),
		characterName: text('character_name').notNull(),
		guildId: integer('guild_id'),
		guildName: text('guild_name'),
		guildRealmSlug: text('guild_realm_slug'),
		guildNameSlug: text('guild_name_slug'),
		lastSeenAt: timestamp('last_seen_at').defaultNow().notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index('wowCharacterOwnership_userId_idx').on(table.userId),
		uniqueIndex('wowCharacterOwnership_character_idx').on(
			table.region,
			table.realmId,
			table.characterId,
		),
	],
)

export const wowGuild = pgTable(
	'wow_guild',
	{
		id: text('id').primaryKey(),
		region: text('region').notNull(),
		realmSlug: text('realm_slug').notNull(),
		nameSlug: text('name_slug').notNull(),
		blizzardGuildId: integer('blizzard_guild_id').notNull(),
		name: text('name').notNull(),
		realmId: integer('realm_id').notNull(),
		faction: text('faction'),
		memberCount: integer('member_count'),
		discoveredByUserId: text('discovered_by_user_id').references(
			() => user.id,
			{
				onDelete: 'set null',
			},
		),
		discoveredAt: timestamp('discovered_at'),
		lastSyncedAt: timestamp('last_synced_at'),
		lastSyncStatus: text('last_sync_status').default('pending').notNull(),
		lastSyncError: text('last_sync_error'),
		lastAuthSource: text('last_auth_source'),
		authFallbackReason: text('auth_fallback_reason'),
		ownerTokenCooldownUntil: timestamp('owner_token_cooldown_until'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex('wowGuild_slug_idx').on(
			table.region,
			table.realmSlug,
			table.nameSlug,
		),
		uniqueIndex('wowGuild_blizzardId_idx').on(
			table.region,
			table.blizzardGuildId,
		),
		index('wowGuild_discoveredByUserId_idx').on(table.discoveredByUserId),
	],
)

export const wowGuildRosterMember = pgTable(
	'wow_guild_roster_member',
	{
		id: text('id').primaryKey(),
		guildId: text('guild_id')
			.notNull()
			.references(() => wowGuild.id, { onDelete: 'cascade' }),
		region: text('region').notNull(),
		realmId: integer('realm_id').notNull(),
		realmSlug: text('realm_slug').notNull(),
		characterId: integer('character_id').notNull(),
		characterName: text('character_name').notNull(),
		rank: integer('rank').notNull(),
		level: integer('level').notNull(),
		playableClassId: integer('playable_class_id'),
		playableRaceId: integer('playable_race_id'),
		factionType: text('faction_type'),
		ownerUserId: text('owner_user_id').references(() => user.id, {
			onDelete: 'set null',
		}),
		seenAt: timestamp('seen_at').defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex('wowGuildRosterMember_character_idx').on(
			table.guildId,
			table.realmId,
			table.characterId,
		),
		index('wowGuildRosterMember_ownerUserId_idx').on(table.ownerUserId),
	],
)

export const wowGuildControl = pgTable(
	'wow_guild_control',
	{
		guildId: text('guild_id')
			.primaryKey()
			.references(() => wowGuild.id, { onDelete: 'cascade' }),
		organizationId: text('organization_id').references(
			() => organization.id,
			{
				onDelete: 'set null',
			},
		),
		state: text('state').default('unclaimed').notNull(),
		ownerUserId: text('owner_user_id').references(() => user.id, {
			onDelete: 'set null',
		}),
		mismatchSince: timestamp('mismatch_since'),
		graceEndsAt: timestamp('grace_ends_at'),
		lastLeadershipCheckAt: timestamp('last_leadership_check_at'),
		lastClaimedAt: timestamp('last_claimed_at'),
		lastTransferredAt: timestamp('last_transferred_at'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index('wowGuildControl_state_idx').on(table.state),
		index('wowGuildControl_ownerUserId_idx').on(table.ownerUserId),
	],
)

export const wowGuildControlEvent = pgTable(
	'wow_guild_control_event',
	{
		id: text('id').primaryKey(),
		guildId: text('guild_id')
			.notNull()
			.references(() => wowGuild.id, { onDelete: 'cascade' }),
		actorUserId: text('actor_user_id').references(() => user.id, {
			onDelete: 'set null',
		}),
		eventType: text('event_type').notNull(),
		fromState: text('from_state'),
		toState: text('to_state'),
		details: text('details'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	(table) => [
		index('wowGuildControlEvent_guildId_idx').on(table.guildId),
		index('wowGuildControlEvent_actorUserId_idx').on(table.actorUserId),
	],
)

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	teamMembers: many(teamMember),
	members: many(member),
	invitations: many(invitation),
	ownedCharacters: many(wowCharacterOwnership),
	discoveredGuilds: many(wowGuild),
	rosterMemberships: many(wowGuildRosterMember),
	controlledGuilds: many(wowGuildControl),
	guildControlEvents: many(wowGuildControlEvent),
}))

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}))

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}))

export const organizationRelations = relations(organization, ({ many }) => ({
	teams: many(team),
	members: many(member),
	invitations: many(invitation),
	guildControls: many(wowGuildControl),
}))

export const teamRelations = relations(team, ({ one, many }) => ({
	organization: one(organization, {
		fields: [team.organizationId],
		references: [organization.id],
	}),
	teamMembers: many(teamMember),
}))

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
	team: one(team, {
		fields: [teamMember.teamId],
		references: [team.id],
	}),
	user: one(user, {
		fields: [teamMember.userId],
		references: [user.id],
	}),
}))

export const memberRelations = relations(member, ({ one }) => ({
	organization: one(organization, {
		fields: [member.organizationId],
		references: [organization.id],
	}),
	user: one(user, {
		fields: [member.userId],
		references: [user.id],
	}),
}))

export const invitationRelations = relations(invitation, ({ one }) => ({
	organization: one(organization, {
		fields: [invitation.organizationId],
		references: [organization.id],
	}),
	user: one(user, {
		fields: [invitation.inviterId],
		references: [user.id],
	}),
	team: one(team, {
		fields: [invitation.teamId],
		references: [team.id],
	}),
}))

export const wowCharacterOwnershipRelations = relations(
	wowCharacterOwnership,
	({ one }) => ({
		user: one(user, {
			fields: [wowCharacterOwnership.userId],
			references: [user.id],
		}),
	}),
)

export const wowGuildRelations = relations(wowGuild, ({ one, many }) => ({
	discoveredBy: one(user, {
		fields: [wowGuild.discoveredByUserId],
		references: [user.id],
	}),
	rosterMembers: many(wowGuildRosterMember),
	control: one(wowGuildControl, {
		fields: [wowGuild.id],
		references: [wowGuildControl.guildId],
	}),
	controlEvents: many(wowGuildControlEvent),
}))

export const wowGuildRosterMemberRelations = relations(
	wowGuildRosterMember,
	({ one }) => ({
		guild: one(wowGuild, {
			fields: [wowGuildRosterMember.guildId],
			references: [wowGuild.id],
		}),
		ownerUser: one(user, {
			fields: [wowGuildRosterMember.ownerUserId],
			references: [user.id],
		}),
	}),
)

export const wowGuildControlRelations = relations(
	wowGuildControl,
	({ one }) => ({
		guild: one(wowGuild, {
			fields: [wowGuildControl.guildId],
			references: [wowGuild.id],
		}),
		organization: one(organization, {
			fields: [wowGuildControl.organizationId],
			references: [organization.id],
		}),
		ownerUser: one(user, {
			fields: [wowGuildControl.ownerUserId],
			references: [user.id],
		}),
	}),
)

export const wowGuildControlEventRelations = relations(
	wowGuildControlEvent,
	({ one }) => ({
		guild: one(wowGuild, {
			fields: [wowGuildControlEvent.guildId],
			references: [wowGuild.id],
		}),
		actorUser: one(user, {
			fields: [wowGuildControlEvent.actorUserId],
			references: [user.id],
		}),
	}),
)
