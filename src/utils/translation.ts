import {
	LocalizationMap,
	SlashCommandBooleanOption,
	SlashCommandChannelOption,
	SlashCommandRoleOption,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import { join } from "path";

function initTranslation() {
	(async () => {
		await i18next.use(Backend).init({
			backend: {
				loadPath: join(__dirname, "..", "./locales/{{lng}}/{{ns}}.json"),
			},
			cleanCode: true,
			initImmediate: false,
			debug: true,
			preload: ["de", "fr", "en-US"],
			supportedLngs: ["de", "fr", "en-US"],
			fallbackLng: ["en-US"],
			returnNull: false,
			returnEmptyString: false,
		});
	})();
}

function loadTranslations(key: string) {
	const lngs = i18next.options.preload;
	const output: LocalizationMap = {};

	if (!lngs) return {};

	lngs.forEach((lng) => (output[lng as keyof typeof output] = i18next.t(key, { lng: lng })));

	return output;
}

type TranslationBuilder =
	| SlashCommandSubcommandBuilder
	| SlashCommandBooleanOption
	| SlashCommandChannelOption
	| SlashCommandRoleOption
	| SlashCommandStringOption;

function translationBuilder<T extends TranslationBuilder>(subcommand: T, key: string) {
	const name = key;
	const description = key.replace("name", "description");

	subcommand
		.setName(i18next.t(name))
		.setNameLocalizations(loadTranslations(name))
		.setDescription(i18next.t(description))
		.setDescriptionLocalizations(loadTranslations(description));

	return subcommand;
}

export { initTranslation, loadTranslations, translationBuilder };
