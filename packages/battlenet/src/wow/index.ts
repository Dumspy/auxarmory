import type { AccountClient, ApplicationClient } from '..';
import {
	Achievement,
	AchievementCategory,
	AchievementCategoryIndex,
	AchievementMedia,
	AchievementsIndex,
} from './game_data/achievements';
import { AuctionCommodities, Auctions } from './game_data/auction';
import {
	Azerite,
	AzeriteIndex,
	AzeriteMedia,
	AzeriteSearch,
} from './game_data/azerite';
import {
	ConnectedRealm,
	ConnectedRealmIndex,
} from './game_data/connected_realm';
import {
	Covenant,
	CovenantConduit,
	CovenantConduitIndex,
	CovenantIndex,
	CovenantMedia,
	CovenantSoulbind,
	CovenantSoulbindIndex,
} from './game_data/covenant';
import {
	Creature,
	CreatureFamily,
	CreatureFamilyIndex,
	CreatureFamilyMedia,
	CreatureMedia,
	CreatureSearch,
	CreatureType,
	CreatureTypeIndex,
} from './game_data/creature';
import {
	GuildCrestBorderMedia,
	GuildCrestIndex,
	GuildCrestsEmblemMedia,
} from './game_data/guild_crest';
import { Heirloom, HeirloomIndex } from './game_data/heirloom';
import {
	Item,
	ItemClass,
	ItemClassIndex,
	ItemMedia,
	ItemSearch,
	ItemSet,
	ItemSetIndex,
	ItemSubClass,
} from './game_data/item';
import {
	ItemAppearance,
	ItemAppearanceSearch,
	ItemAppearanceSet,
	ItemAppearanceSetIndex,
	ItemAppearanceSlot,
	ItemAppearanceSlotIndex,
} from './game_data/item_appearance';
import {
	JournalEncounter,
	JournalEncounterIndex,
	JournalEncounterSearch,
	JournalExpansions,
	JournalExpansionsIndex,
	JournalInstance,
	JournalInstanceIndex,
	JournalInstanceMedia,
} from './game_data/journal';
import { MediaSearch } from './game_data/media';
import {
	ModifiedCraftingCategory,
	ModifiedCraftingCategoryIndex,
	ModifiedCraftingIndex,
	ModifiedCraftingReagentSlotType,
	ModifiedCraftingReagentSlotTypeIndex,
} from './game_data/modified_crafting';
import { Mount, MountIndex, MountSearch } from './game_data/mount';
import {
	MythicKeystoneAffix,
	MythicKeystoneAffixesIndex,
	MythicKeystoneAffixMedia,
} from './game_data/mythic_keystone_affix';
import {
	MythicKeystoneDungeon,
	MythicKeystoneDungeonIndex,
	MythicKeystoneIndex,
	MythicKeystonePeriod,
	MythicKeystonePeriodIndex,
	MythicKeystoneSeason,
	MythicKeystoneSeasonIndex,
} from './game_data/mythic_keystone_dungeon';
import {
	MythicKeystoneLeaderboard,
	MythicKeystoneLeaderboardIndex,
} from './game_data/mythic_keystone_leaderboard';
import { MythicRaidLeaderboard } from './game_data/mythic_raid_leaderboard';
import {
	Pet,
	PetAbilitiesIndex,
	PetAbility,
	PetAbilityMedia,
	PetIndex,
	PetMedia,
} from './game_data/pets';
import {
	PlayableClass,
	PlayableClassIndex,
	PlayableClassMedia,
	PlayablePvPTalentSlot,
} from './game_data/playable_class';
import { PlayableRace, PlayableRaceIndex } from './game_data/playable_race';
import {
	PlayableSpecialization,
	PlayableSpecializationIndex,
	PlayableSpecializationMedia,
} from './game_data/playable_specialization';
import { PowerType, PowerTypeIndex } from './game_data/power_type';
import {
	Profession,
	ProfessionIndex,
	ProfessionMedia,
	ProfessionRecipe,
	ProfessionRecipeMedia,
	ProfessionSkillTier,
} from './game_data/profession';
import {
	PvPLeaderboard,
	PvPLeaderboardIndex,
	PvPRewardIndex,
	PvPSeason,
	PvPSeasonIndex,
} from './game_data/pvp_season';
import { PvPTier, PvPTierIndex, PvPTierMedia } from './game_data/pvp_tier';
import {
	Quest,
	QuestArea,
	QuestAreasIndex,
	QuestCategoriesIndex,
	QuestCategory,
	QuestIndex,
	QuestType,
	QuestTypeIndex,
} from './game_data/quest';
import { Realm, RealmIndex, RealmSearch } from './game_data/realm';
import { Region, RegionIndex } from './game_data/region';
import {
	ReputationFaction,
	ReputationFactionIndex,
	ReputationTiers,
	ReputationTiersIndex,
} from './game_data/reputation';
import { Spell, SpellMedia, SpellSearch } from './game_data/spell';
import {
	PvPTalent,
	PvPTalentIndex,
	Talent,
	TalentIndex,
	TalentTree,
	TalentTreeIndex,
	TalentTreeNodes,
} from './game_data/talent';
import {
	TechTalent,
	TechTalentIndex,
	TechTalentMedia,
	TechTalentTree,
	TechTalentTreeIndex,
} from './game_data/tech_talent';
import { Title, TitleIndex } from './game_data/title';
import { Toy, ToyIndex } from './game_data/toy';
import { WoWTokenIndex } from './game_data/wow_token';
import {
	AccountCollectionIndex,
	AccountHeirloomsCollectionSummary,
	AccountMountsCollectionSummary,
	AccountPetsCollectionSummary,
	AccountProfileSummary,
	AccountToysCollectionSummary,
	AccountTransmogCollectionSummary,
	ProtectedCharacterProfileSummary,
} from './profile/account_profile';
import {
	CharacterAchievementsStatistics,
	CharacterAchievementsSummary,
} from './profile/character_achievements';
import { CharacterAppearanceSummary } from './profile/character_appearance';
import {
	CharacterCollectionIndex,
	CharacterHeirloomsCollectionSummary,
	CharacterMountsCollectionSummary,
	CharacterPetsCollectionSummary,
	CharacterToysCollectionSummary,
	CharacterTransmogCollectionSummary,
} from './profile/character_collections';
import {
	CharacterDungeons,
	CharacterEncounterSummary,
	CharacterRaid,
} from './profile/character_encounter';
import { CharacterEquipmentSummary } from './profile/character_equipment';
import { CharacterHunterPetsSummary } from './profile/character_hunter_pets';
import { CharacterMediaSummary } from './profile/character_media';
import {
	CharacterMythicKeystoneProfileIndex,
	CharacterMythicKeystoneSeason,
} from './profile/character_mythic_keystone';
import { CharacterProfessionSummary } from './profile/character_profession';
import {
	CharacterProfileStatus,
	CharacterProfileSummary,
} from './profile/character_profile';
import {
	CharacterPvPBracketStatistics,
	CharacterPvPSummary,
} from './profile/character_pvp';
import {
	CharacterCompletedQuests,
	CharacterQuests,
} from './profile/character_quest';
import { CharacterReputationSummary } from './profile/character_reputation';
import { CharacterSoulbinds } from './profile/character_soulbinds';
import { CharacterSpecializationsSummary } from './profile/character_specialization';
import { CharacterStatisticsSummary } from './profile/character_statistics';
import { CharacterTitlesSummary } from './profile/character_titles';
import {
	Guild,
	GuildAchievements,
	GuildActivity,
	GuildRoster,
} from './profile/guild';

class WoWGameDataClient {
	protected client: ApplicationClient;
	protected request: ApplicationClient['request'];

	constructor(client: ApplicationClient) {
		this.client = client;
		this.request = client.request.bind(client);
	}

	Achievement = Achievement.bind(this);
	AchievementCategory = AchievementCategory.bind(this);
	AchievementCategoryIndex = AchievementCategoryIndex.bind(this);
	AchievementMedia = AchievementMedia.bind(this);
	AchievementsIndex = AchievementsIndex.bind(this);

	Auctions = Auctions.bind(this);
	AuctionCommodities = AuctionCommodities.bind(this);

	Azerite = Azerite.bind(this);
	AzeriteIndex = AzeriteIndex.bind(this);
	AzeriteMedia = AzeriteMedia.bind(this);
	AzeriteSearch = AzeriteSearch.bind(this);

	ConnectedRealm = ConnectedRealm.bind(this);
	ConnectedRealmIndex = ConnectedRealmIndex.bind(this);

	Covenant = Covenant.bind(this);
	CovenantIndex = CovenantIndex.bind(this);
	CovenantMedia = CovenantMedia.bind(this);
	CovenantSoulbind = CovenantSoulbind.bind(this);
	CovenantSoulbindIndex = CovenantSoulbindIndex.bind(this);
	CovenantConduit = CovenantConduit.bind(this);
	CovenantConduitIndex = CovenantConduitIndex.bind(this);

	Creature = Creature.bind(this);
	CreatureSearch = CreatureSearch.bind(this);
	CreatureMedia = CreatureMedia.bind(this);
	CreatueFamilyIndex = CreatureFamilyIndex.bind(this);
	CreatueFamily = CreatureFamily.bind(this);
	CreatueFamilyMedia = CreatureFamilyMedia.bind(this);
	CreatureTypeIndex = CreatureTypeIndex.bind(this);
	CreatureType = CreatureType.bind(this);

	GuildCrestIndex = GuildCrestIndex.bind(this);
	GuildCrestBorderMedia = GuildCrestBorderMedia.bind(this);
	GuildCrestsEmblemMedia = GuildCrestsEmblemMedia.bind(this);

	Heirloom = Heirloom.bind(this);
	HeirloomIndex = HeirloomIndex.bind(this);

	Item = Item.bind(this);
	ItemClass = ItemClass.bind(this);
	ItemClassIndex = ItemClassIndex.bind(this);
	ItemMedia = ItemMedia.bind(this);
	ItemSet = ItemSet.bind(this);
	ItemSetIndex = ItemSetIndex.bind(this);
	ItemSearch = ItemSearch.bind(this);
	ItemSubClass = ItemSubClass.bind(this);

	ItemAppearance = ItemAppearance.bind(this);
	ItemAppearanceSearch = ItemAppearanceSearch.bind(this);
	ItemAppearanceSet = ItemAppearanceSet.bind(this);
	ItemAppearanceSetIndex = ItemAppearanceSetIndex.bind(this);
	ItemAppearanceSlot = ItemAppearanceSlot.bind(this);
	ItemAppearanceSlotIndex = ItemAppearanceSlotIndex.bind(this);

	JournalEncounter = JournalEncounter.bind(this);
	JournalEncounterIndex = JournalEncounterIndex.bind(this);
	JournalEncounterSearch = JournalEncounterSearch.bind(this);
	JournalExpansions = JournalExpansions.bind(this);
	JournalExpansionsIndex = JournalExpansionsIndex.bind(this);
	JournalInstance = JournalInstance.bind(this);
	JournalInstanceIndex = JournalInstanceIndex.bind(this);
	JournalInstanceMedia = JournalInstanceMedia.bind(this);

	MediaSearch = MediaSearch.bind(this);

	ModifiedCraftingIndex = ModifiedCraftingIndex.bind(this);
	ModifiedCraftingCategory = ModifiedCraftingCategory.bind(this);
	ModifiedCraftingCategoryIndex = ModifiedCraftingCategoryIndex.bind(this);
	ModifiedCraftingReagentSlotType =
		ModifiedCraftingReagentSlotType.bind(this);
	ModifiedCraftingReagentSlotTypeIndex =
		ModifiedCraftingReagentSlotTypeIndex.bind(this);

	Mount = Mount.bind(this);
	MountIndex = MountIndex.bind(this);
	MountSearch = MountSearch.bind(this);

	MythicKeystoneAffix = MythicKeystoneAffix.bind(this);
	MythicKeystoneAffixMedia = MythicKeystoneAffixMedia.bind(this);
	MythicKeystoneAffixesIndex = MythicKeystoneAffixesIndex.bind(this);

	MythicKeystoneIndex = MythicKeystoneIndex.bind(this);
	MythicKeystoneSeason = MythicKeystoneSeason.bind(this);
	MythicKeystoneSeasonIndex = MythicKeystoneSeasonIndex.bind(this);
	MythicKeystoneDungeon = MythicKeystoneDungeon.bind(this);
	MythicKeystoneDungeonIndex = MythicKeystoneDungeonIndex.bind(this);
	MythicKeystonePeriod = MythicKeystonePeriod.bind(this);
	MythicKeystonePeriodIndex = MythicKeystonePeriodIndex.bind(this);

	MythicKeystoneLeaderboard = MythicKeystoneLeaderboard.bind(this);
	MythicKeystoneLeaderboardIndex = MythicKeystoneLeaderboardIndex.bind(this);

	MythicRaidLeaderboard = MythicRaidLeaderboard.bind(this);

	Pet = Pet.bind(this);
	PetIndex = PetIndex.bind(this);
	PetAbilitiesIndex = PetAbilitiesIndex.bind(this);
	PetAbility = PetAbility.bind(this);
	PetAbilityMedia = PetAbilityMedia.bind(this);
	PetMedia = PetMedia.bind(this);

	PlayableClass = PlayableClass.bind(this);
	PlayableClassIndex = PlayableClassIndex.bind(this);
	PlayableClassMedia = PlayableClassMedia.bind(this);
	PlayablePvPTalentSlot = PlayablePvPTalentSlot.bind(this);

	PlayableRace = PlayableRace.bind(this);
	PlayableRaceIndex = PlayableRaceIndex.bind(this);

	PlayableSpecialization = PlayableSpecialization.bind(this);
	PlayableSpecializationIndex = PlayableSpecializationIndex.bind(this);
	PlayableSpecializationMedia = PlayableSpecializationMedia.bind(this);

	PowerType = PowerType.bind(this);
	PowerTypeIndex = PowerTypeIndex.bind(this);

	Profession = Profession.bind(this);
	ProfessionIndex = ProfessionIndex.bind(this);
	ProfessionMedia = ProfessionMedia.bind(this);
	ProfessionRecipe = ProfessionRecipe.bind(this);
	ProfessionRecipeMedia = ProfessionRecipeMedia.bind(this);
	ProfessionSkillTier = ProfessionSkillTier.bind(this);

	PvPLeaderboard = PvPLeaderboard.bind(this);
	PvPLeaderboardIndex = PvPLeaderboardIndex.bind(this);
	PvPRewardIndex = PvPRewardIndex.bind(this);
	PvPSeason = PvPSeason.bind(this);
	PvPSeasonIndex = PvPSeasonIndex.bind(this);

	PvPTier = PvPTier.bind(this);
	PvPTierIndex = PvPTierIndex.bind(this);
	PvPTierMedia = PvPTierMedia.bind(this);

	Quest = Quest.bind(this);
	QuestArea = QuestArea.bind(this);
	QuestAreasIndex = QuestAreasIndex.bind(this);
	QuestCategoriesIndex = QuestCategoriesIndex.bind(this);
	QuestCategory = QuestCategory.bind(this);
	QuestIndex = QuestIndex.bind(this);
	QuestType = QuestType.bind(this);
	QuestTypeIndex = QuestTypeIndex.bind(this);

	Realm = Realm.bind(this);
	RealmIndex = RealmIndex.bind(this);
	RealmSearch = RealmSearch.bind(this);

	Region = Region.bind(this);
	RegionIndex = RegionIndex.bind(this);

	ReputationFaction = ReputationFaction.bind(this);
	ReputationFactionIndex = ReputationFactionIndex.bind(this);
	ReputationTiers = ReputationTiers.bind(this);
	ReputationTiersIndex = ReputationTiersIndex.bind(this);

	Spell = Spell.bind(this);
	SpellMedia = SpellMedia.bind(this);
	SpellSearch = SpellSearch.bind(this);

	Talent = Talent.bind(this);
	TalentIndex = TalentIndex.bind(this);
	PvPTalent = PvPTalent.bind(this);
	PvPTalentIndex = PvPTalentIndex.bind(this);
	TalentTree = TalentTree.bind(this);
	TalentTreeIndex = TalentTreeIndex.bind(this);
	TalentTreeNodes = TalentTreeNodes.bind(this);

	TechTalent = TechTalent.bind(this);
	TechTalentIndex = TechTalentIndex.bind(this);
	TechTalentMedia = TechTalentMedia.bind(this);
	TechTalentTree = TechTalentTree.bind(this);
	TechTalentTreeIndex = TechTalentTreeIndex.bind(this);

	Title = Title.bind(this);
	TitleIndex = TitleIndex.bind(this);

	Toy = Toy.bind(this);
	ToyIndex = ToyIndex.bind(this);

	WoWTokenIndex = WoWTokenIndex.bind(this);

	CharacterAchievementsStatistics =
		CharacterAchievementsStatistics.bind(this);
	CharacterAchievementsSummary = CharacterAchievementsSummary.bind(this);

	CharacterAppearanceSummary = CharacterAppearanceSummary.bind(this);

	CharacterCollectionIndex = CharacterCollectionIndex.bind(this);
	CharacterHeirloomsCollectionSummary =
		CharacterHeirloomsCollectionSummary.bind(this);
	CharacterMountsCollectionSummary =
		CharacterMountsCollectionSummary.bind(this);
	CharacterPetsCollectionSummary = CharacterPetsCollectionSummary.bind(this);
	CharacterToysCollectionSummary = CharacterToysCollectionSummary.bind(this);
	CharacterTransmogCollectionSummary =
		CharacterTransmogCollectionSummary.bind(this);

	CharacterEncounterSummary = CharacterEncounterSummary.bind(this);
	CharacterDungeons = CharacterDungeons.bind(this);
	CharacterRaid = CharacterRaid.bind(this);

	CharacterEquipmentSummary = CharacterEquipmentSummary.bind(this);

	CharacterHunterPetsSummary = CharacterHunterPetsSummary.bind(this);

	CharacterMediaSummary = CharacterMediaSummary.bind(this);

	CharacterMythicKeystoneProfileIndex =
		CharacterMythicKeystoneProfileIndex.bind(this);
	CharacterMythicKeystoneSeason = CharacterMythicKeystoneSeason.bind(this);

	CharacterProfessionSummary = CharacterProfessionSummary.bind(this);

	CharacterProfileSummary = CharacterProfileSummary.bind(this);
	CharacterProfileStatus = CharacterProfileStatus.bind(this);

	CharacterPvPBracketStatistics = CharacterPvPBracketStatistics.bind(this);
	CharacterPvPSummary = CharacterPvPSummary.bind(this);

	CharacterQuests = CharacterQuests.bind(this);
	CharacterCompletedQuests = CharacterCompletedQuests.bind(this);

	CharacterReputationSummary = CharacterReputationSummary.bind(this);

	CharacterSoulbinds = CharacterSoulbinds.bind(this);

	CharacterSpecializationsSummary =
		CharacterSpecializationsSummary.bind(this);

	CharacterStatisticsSummary = CharacterStatisticsSummary.bind(this);

	CharacterTitlesSummary = CharacterTitlesSummary.bind(this);

	Guild = Guild.bind(this);
	GuildAchievements = GuildAchievements.bind(this);
	GuildActivity = GuildActivity.bind(this);
	GuildRoster = GuildRoster.bind(this);
}

class WoWProfileClient {
	protected client: AccountClient;
	protected request: AccountClient['request'];

	constructor(client: AccountClient) {
		this.client = client;
		this.request = client.request.bind(client);
	}

	AccountCollectionIndex = AccountCollectionIndex.bind(this);
	AccountHeirloomsCollectionSummary =
		AccountHeirloomsCollectionSummary.bind(this);
	AccountMountsCollectionSummary = AccountMountsCollectionSummary.bind(this);
	AccountPetsCollectionSummary = AccountPetsCollectionSummary.bind(this);
	AccountProfileSummary = AccountProfileSummary.bind(this);
	AccountToysCollectionSummary = AccountToysCollectionSummary.bind(this);
	AccountTransmogCollectionSummary =
		AccountTransmogCollectionSummary.bind(this);
	ProtectedCharacterProfileSummary =
		ProtectedCharacterProfileSummary.bind(this);
}

export { WoWGameDataClient, WoWProfileClient };
