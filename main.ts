import { App, addIcon, Plugin, PluginSettingTab, Setting, Notice, Modal, SuggestModal } from 'obsidian';

interface PokeTypeSettings {
	mySetting: string;
	primaryType: string;
	secondaryType: string;
	presetOverride: string;
	fontWeight: number;
	fontWidth: number;
	tagInteraction: boolean;
	tableStyle: boolean;
	tableColor: boolean;
	tableWidth: boolean;
	mobileStatusbar: boolean;
	mobileToolbarheight: number;
	blockquoteBorder: boolean;
	blockquoteBackground: boolean;
	calloutBackground: boolean;
	embedHeight: number;
	embedTitle: boolean;
}

const DEFAULT_SETTINGS: PokeTypeSettings = {
	mySetting: 'default',
	primaryType: 'primary-type-normal',
	secondaryType: 'secondary-type-steel',
	presetOverride: "",
	fontWeight: 400,
	fontWidth: 100,
	tagInteraction: true,
	tableStyle: false,
	tableColor: false,
	tableWidth: true,
	mobileStatusbar: false,
	mobileToolbarheight: 2,
	blockquoteBorder: false,
	blockquoteBackground: false,
	calloutBackground: false,
	embedHeight: 4000,
	embedTitle: true,
}

const pokemonTypes = ['normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel', 'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy'] as const;
const primaryTypes = pokemonTypes.map(type => `primary-type-${type}`);
const secondaryTypes = pokemonTypes.map(type => `secondary-type-${type}`);

class TypeSuggestModal extends SuggestModal<string> {
	constructor(app: App, private onChoose: (type: string) => void) {
		super(app);
		this.setPlaceholder("Search Pokémon types...");
	}
	getSuggestions(query: string): string[] {
		return pokemonTypes.filter(type =>
			type.toLowerCase().includes(query.toLowerCase())
		);
	}
	renderSuggestion(type: string, el: HTMLElement) {
		el.createEl('div', { text: type.charAt(0).toUpperCase() + type.slice(1) });
	}
	onChooseSuggestion(type: string, evt: MouseEvent | KeyboardEvent) {
		this.onChoose(type);
	}
	onOpen() {
		super.onOpen();
		this.containerEl.classList.add("hidden-grotto-types");
	}
}
class PresetSuggestModal extends SuggestModal<string> {
	private presets: string[];
	constructor(app: App, presets: string[], private onChoose: (preset: string) => void) {
		super(app);
		this.presets = presets;
		this.setPlaceholder("Search available presets...");
	}
	getSuggestions(query: string): string[] {
		return this.presets.filter(preset =>
			preset.toLowerCase().includes(query.toLowerCase())
		);
	}
	renderSuggestion(preset: string, el: HTMLElement) {
		el.createEl('div', { text: preset.charAt(0).toUpperCase() + preset.slice(1) });
	}
	onChooseSuggestion(preset: string, evt: MouseEvent | KeyboardEvent) {
		this.onChoose(preset);
	}
	onOpen() {
		super.onOpen();
		this.containerEl.classList.add("hidden-grotto-presets");
	}
}

class TypeSelectModal extends Modal {
	constructor(app: App, private onChoose: (type: string) => void) {
		super(app);
	}
	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl('h2', { text: 'Choose a Pokémon type' });
		pokemonTypes.forEach(type => {
			new Setting(contentEl)
				.setName(type.charAt(0).toUpperCase() + type.slice(1))
				.addButton(btn =>
					btn.setButtonText("Select")
						.onClick(() => {
							this.onChoose(type);
							this.close();
						}));
		});
	}
	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

export default class HiddenGrotto extends Plugin {
	settings: PokeTypeSettings;
	private cachedPresets: string[] | null = null;
	async onload() {
		await this.loadSettings();
		this.applySettingsToDOM();
		// Custom icons for the ribbon buttons
		addIcon('cycle-primary-type', '<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 26 26" version="1.1"><g id="surface1"><path style=" stroke:currentColor;fill-rule:evenodd;fill:none;fill-opacity:1;" d="M 13.15625 11.949219 C 13.320312 11.847656 13.457031 11.640625 13.570312 11.410156 C 15.035156 12.007812 16.0625 13.421875 16.0625 15.070312 C 16.0625 17.261719 14.246094 19.039062 12.007812 19.039062 C 11.085938 19.039062 10.238281 18.742188 9.558594 18.234375 C 9.335938 18.128906 9.152344 18.027344 9 17.945312 C 8.769531 17.816406 8.613281 17.734375 8.519531 17.746094 C 8.238281 17.785156 8.320312 18.042969 8.394531 18.277344 C 8.445312 18.433594 8.492188 18.582031 8.417969 18.644531 C 8.34375 18.707031 8.097656 18.472656 7.8125 18.199219 C 7.421875 17.828125 6.957031 17.382812 6.734375 17.519531 C 6.5625 17.625 6.730469 17.910156 6.9375 18.261719 L 6.953125 18.285156 C 7.039062 18.433594 7.140625 18.585938 7.234375 18.722656 C 7.421875 19.003906 7.574219 19.230469 7.496094 19.265625 C 7.40625 19.3125 6.769531 18.882812 6.230469 18.285156 C 6.023438 18.054688 5.824219 17.808594 5.636719 17.574219 C 5.230469 17.066406 4.890625 16.644531 4.699219 16.695312 C 4.46875 16.753906 4.644531 17.226562 4.898438 17.683594 C 5.015625 17.898438 5.15625 18.113281 5.277344 18.300781 C 5.46875 18.59375 5.613281 18.816406 5.558594 18.84375 C 5.488281 18.878906 4.871094 18.277344 4.453125 17.519531 C 4.203125 17.066406 3.992188 16.570312 3.824219 16.164062 C 3.640625 15.726562 3.503906 15.402344 3.414062 15.367188 C 3.101562 15.253906 3.101562 15.894531 3.226562 16.816406 C 3.242188 16.933594 3.265625 17.0625 3.296875 17.191406 C 4.515625 21.128906 8.257812 24 12.683594 24 C 18.097656 24 22.488281 19.707031 22.488281 14.410156 C 22.488281 9.371094 18.511719 5.238281 13.457031 4.851562 C 13.464844 4.613281 13.589844 4.144531 13.589844 4.144531 C 13.589844 4.144531 14.480469 1.984375 14.527344 1.523438 C 14.53125 1.492188 14.535156 1.460938 14.539062 1.425781 C 14.59375 0.925781 14.699219 0 13.902344 0 C 13.476562 0 13.277344 0.316406 13.050781 0.679688 C 12.964844 0.816406 12.871094 0.964844 12.761719 1.101562 C 11.972656 2.089844 10.644531 3.320312 9.890625 3.976562 C 8.296875 5.367188 6.730469 6.507812 5.820312 7.171875 C 5.40625 7.476562 5.125 7.679688 5.039062 7.765625 C 4.386719 8.402344 2.046875 12.621094 2.046875 12.621094 C 2.046875 12.621094 1.289062 13.976562 1.558594 14.253906 C 1.828125 14.527344 2.476562 14.464844 2.476562 14.464844 C 2.476562 14.464844 11.191406 12.464844 11.972656 12.304688 C 12.183594 12.265625 12.332031 12.238281 12.445312 12.222656 C 12.753906 12.167969 12.808594 12.160156 13.15625 11.949219 Z M 6.996094 9.378906 C 6.527344 9.824219 5.75 10.882812 5.75 10.882812 C 5.75 10.882812 7.195312 10.972656 7.988281 10.21875 C 8.78125 9.464844 8.601562 8.175781 8.601562 8.175781 C 8.601562 8.175781 7.464844 8.933594 6.996094 9.378906 Z M 6.996094 9.378906 "/></g></svg>');
		addIcon('cycle-secondary-type', '<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 26 26" version="1.1"><g id="surface1"><path style=" stroke:currentColor;fill-rule:evenodd;fill:none;fill-opacity:1;" d="M 8.378906 22.394531 C 11.894531 22.394531 14.902344 20.441406 16.144531 17.667969 C 16.160156 17.636719 11.15625 18.96875 11.316406 18.5 C 11.386719 18.289062 14.453125 17.167969 16.691406 15.859375 C 17.972656 15.109375 18.566406 13.519531 18.566406 13.519531 C 18.566406 13.519531 16.402344 14.570312 15.308594 14.835938 C 13.101562 15.375 11.164062 15.316406 11.164062 15.257812 C 11.164062 15.136719 14.386719 14.527344 18.863281 11.796875 C 20.96875 10.511719 21.542969 8.300781 21.542969 8.300781 C 21.542969 8.300781 19.226562 9.679688 17.828125 10.136719 C 14.503906 11.21875 11.476562 11.542969 11.476562 11.394531 C 11.476562 11.082031 14.140625 10.351562 16.96875 8.980469 C 18.441406 8.269531 19.710938 7.335938 21.1875 6.300781 C 23.601562 4.609375 24 1.59375 24 1.59375 C 24 1.59375 21.617188 3.128906 20.457031 3.640625 C 15.664062 5.742188 11.429688 6.847656 8.378906 7.085938 C 3.769531 7.445312 0 10.660156 0 14.835938 C 0 19.011719 3.75 22.394531 8.378906 22.394531 Z M 8.378906 22.394531 "/></g></svg>');
		addIcon('cycle-preset', '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"viewBox="0 0 256 256"><path fill=currentColor opacity="1.000000" stroke="none" d="M243.517914,101.606964 C251.807251,140.867111 243.723602,175.908401 217.753143,206.057571 C196.818481,230.360672 169.783905,244.053741 137.765076,246.243790 C71.721527,250.761093 19.331234,202.748322 12.341545,143.763779 C6.422440,93.813644 31.015741,47.160252 75.623924,24.008842 C118.757599,1.622693 173.171921,9.246656 208.605103,42.348419 C225.987778,58.587334 237.710297,78.093155 243.517914,101.606964 M108.744705,33.142208 C57.593082,43.828785 23.517294,94.050583 32.598221,145.368912 C41.747906,197.075821 87.272911,231.268295 140.119919,226.125275 C193.110092,220.968323 233.115143,170.014328 226.292358,117.371567 C219.056595,61.542454 166.807602,21.620567 108.744705,33.142208 z"/><path fill=currentColor opacity="1.000000" stroke="none" d="M136.556793,61.273613 C135.221420,80.707474 141.722031,95.890984 157.255661,107.677345 C164.011978,112.803795 169.822708,119.664764 174.690765,126.688896 C184.525085,140.878860 182.804947,156.529205 171.061905,169.163589 C159.569885,181.527924 144.993042,189.039001 129.604660,195.219376 C126.232231,196.573807 122.784637,197.741089 119.916328,198.794525 C119.195549,191.471039 119.160332,184.287888 117.664635,177.422913 C115.038788,165.370819 106.769608,156.889191 98.250854,148.450333 C91.941422,142.200104 85.828560,135.315125 81.420662,127.678299 C73.760170,114.406258 76.602089,99.304268 87.139786,88.121582 C100.164482,74.299667 116.522514,66.011307 134.081894,59.727329 C134.703140,59.505001 135.747787,60.465721 136.556793,61.273613 M107.743614,126.801552 C103.469910,125.404617 99.196205,124.007675 94.001419,122.309662 C97.046341,129.567947 100.762016,134.306824 107.090012,136.879547 C113.551132,139.506378 119.979477,142.280136 126.186592,145.450760 C136.957520,150.952560 147.546951,156.809662 158.616318,162.733871 C160.496384,160.551544 162.478775,158.250412 164.736694,155.629471 C147.522476,142.015167 128.309448,133.935577 107.743614,126.801552 M111.435822,105.080589 C107.056480,103.489960 102.650757,101.967651 98.305130,100.289703 C93.846519,98.568138 92.773628,101.896271 91.517494,104.778847 C90.025993,108.201569 92.828606,108.431938 94.983711,109.332115 C113.681709,117.142075 132.390778,124.928658 150.998077,132.950638 C156.351578,135.258636 161.384888,138.309357 167.089462,141.293930 C166.434845,133.920410 163.158844,129.306793 157.275421,126.540855 C142.239838,119.472290 127.185043,112.444626 111.435822,105.080589 M114.570343,83.010376 C112.083847,85.003014 109.597359,86.995651 106.231102,89.693321 C115.957306,93.638893 124.429878,97.075920 133.668259,100.823608 C130.809372,92.644127 128.321930,85.527420 125.623299,77.806465 C122.047211,79.488853 118.640793,81.091415 114.570343,83.010376 M126.962753,165.614624 C128.942307,170.304520 130.921844,174.994415 133.079834,180.107086 C138.028748,177.224625 142.469559,174.638107 147.725525,171.576797 C139.674362,167.014633 132.729538,163.079346 125.784698,159.144073 C125.454407,159.454544 125.124123,159.765015 124.793839,160.075485 C125.434830,161.684570 126.075813,163.293655 126.962753,165.614624 z"/></svg>')

		this.addRibbonIcon('cycle-primary-type', 'Cycle primary type', async () => {
			await this.cycleType('primary');
		});
		this.addRibbonIcon('cycle-secondary-type', 'Cycle secondary type', async () => {
			await this.cycleType('secondary');
		});
		this.addRibbonIcon('cycle-preset', 'Cycle presets', async () => {
			await this.cyclePreset();
		});

		// Dragon symbol controls primary types
		this.addCommand({
			id: 'cycle-primary-type',
			name: 'Cycle primary type',
			icon: 'cycle-primary-type',
			callback: async () => await this.cycleType('primary'),
		});
		// Flying symbol controls secondary types
		this.addCommand({
			id: 'cycle-secondary-type',
			name: 'Cycle secondary type',
			icon: 'cycle-secondary-type',
			callback: async () => await this.cycleType('secondary'),
		});
		this.addCommand({
			id: 'cycle-preset-override',
			name: 'Cycle preset override',
			icon: 'cycle-preset',
			callback: async () => await this.cyclePreset(),
		});

		this.addSettingTab(new PokeSettingsTab(this.app, this));
	}

	private removeTypeClasses() {
		Array.from(document.body.classList).forEach(cls => {
			if (cls.startsWith('primary-type-') || cls.startsWith('secondary-type-') || cls.startsWith('preset-')) {
				document.body.classList.remove(cls);
			}
		});
	}

	private removeTypeClassesByCategory(typeCategory: 'primary' | 'secondary') {
		Array.from(document.body.classList).forEach(cls => {
			if (cls.startsWith(`${typeCategory}-type-`)) {
				document.body.classList.remove(cls);
			}
		});
	}
	// Cycle through the types in order
	async cycleType(typeCategory: 'primary' | 'secondary') {
		const types = typeCategory === 'primary' ? primaryTypes : secondaryTypes;
		const key = `${typeCategory}Type` as keyof PokeTypeSettings;
		const currentType = this.settings[key] as string;
		const currentIndex = types.indexOf(currentType);
		const nextIndex = (currentIndex + 1) % types.length;
		const nextType = types[nextIndex];
		this.removeTypeClassesByCategory(typeCategory);
		document.body.classList.add(nextType);

		if (typeCategory === 'primary') {
			this.settings.primaryType = nextType;
		} else {
			this.settings.secondaryType = nextType;
		}
		this.settings.presetOverride = "";
		await this.saveSettings();
	}
	async cyclePreset() {
	const presets = this.getAvailablePresets();
	if (presets.length === 0) {
		new Notice("No available presets found.");
		return;
	}

	const currentIndex = presets.indexOf(this.settings.presetOverride);
	const nextIndex = (currentIndex + 1) % presets.length;
	const nextPreset = presets[nextIndex];

	this.settings.presetOverride = nextPreset;
	await this.saveSettings();

	const capitalizedPreset = nextPreset.charAt(0).toUpperCase() + nextPreset.slice(1);
	new Notice(`Preset changed to: ${capitalizedPreset}`);
}


	onunload() {
		this.removeTypeClasses();
	}
	applySettingsToDOM() {
		this.removeTypeClasses();

		document.body.style.setProperty('font-weight', this.settings.fontWeight.toString());
		document.body.style.setProperty('--file-line-width', `${this.settings.fontWidth}%`);
		document.body.style.setProperty('--grotto-toolbar-rows', `${this.settings.mobileToolbarheight}`);
		const tableBorders = this.settings.tableStyle ? 'separate' : 'collapse';
		document.body.style.setProperty('--grotto-table-border-style', tableBorders);
		const tableColors = this.settings.tableColor ? 'var(--grotto-accent-1)' : 'var(--background-primary)';
		document.body.style.setProperty('--table-background', tableColors);
		const tableWidth = this.settings.tableWidth ? 'max-content' : 'fit-content';
		document.body.style.setProperty('--grotto-table-cell-width', tableWidth);
		const pointerEvents = this.settings.tagInteraction ? 'none' : 'auto';
		document.body.style.setProperty('--grotto-tag-pointer-events', pointerEvents);
		const mobileStatus = this.settings.mobileStatusbar ? 'var(--grotto-accent-1)' : 'var(--background-primary)';
		document.body.style.setProperty('--system-status-background', mobileStatus);
		const blockquoteBorder = this.settings.blockquoteBorder ? 'var(--grotto-accent-1)' : 'var(--text-normal)';
		document.body.style.setProperty('--blockquote-border-color', blockquoteBorder);
		const blockquoteBackground = this.settings.blockquoteBackground ? 'var(--grotto-accent-1)' : 'var(--background-primary)';
		document.body.style.setProperty('--blockquote-background-color', blockquoteBackground);
		const calloutBackground = this.settings.calloutBackground ? 'var(--grotto-8)' : 'var(--background-primary)';
		document.body.style.setProperty('--grotto-callout-background-color', calloutBackground);
		document.body.style.setProperty('--embed-max-height', `${this.settings.embedHeight}px`);
		const embedTitleDisplay = this.settings.embedTitle ? 'auto' : 'none';
		document.body.style.setProperty('--grotto-embed-title-display', embedTitleDisplay);
		if (this.settings.presetOverride && this.settings.presetOverride.trim() !== "") {
			const presetClass = `preset-${this.settings.presetOverride.trim().toLowerCase()}`;
			document.body.classList.add(presetClass);
		} else {
			document.body.classList.add(this.settings.primaryType);
			document.body.classList.add(this.settings.secondaryType); 
		}
	}
	// Check for presets in the css and theme files to display in the settings tab
	getAvailablePresets(): string[] {
		if (this.cachedPresets) return this.cachedPresets;
		const presetRegex = /\.preset-([a-zA-Z0-9_-]+)/g;
		const presets = new Set<string>();
		for (const sheet of Array.from(document.styleSheets)) {
			try {
				const rules = sheet.cssRules;
				for (const rule of Array.from(rules)) {
					if (rule instanceof CSSStyleRule) {
						let match;
						while ((match = presetRegex.exec(rule.selectorText))) {
							presets.add(match[1]);
						}
					}
				}
			} catch {
				continue;
			}
		}
		this.cachedPresets = Array.from(presets).sort();
		return this.cachedPresets;
	}
	async loadSettings() {
		const loadedData = await this.loadData();
		this.settings = { ...DEFAULT_SETTINGS, ...loadedData };
	}
	async saveSettings() {
		await this.saveData(this.settings);
		this.applySettingsToDOM();
	}
}

class PokeSettingsTab extends PluginSettingTab {
	plugin: HiddenGrotto;

	constructor(app: App, plugin: HiddenGrotto) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		function capitalize(str: string) {
			return str.charAt(0).toUpperCase() + str.slice(1);
		}
		// Color Settings
		containerEl.createEl('div', { cls: 'setting-item setting-item-heading' }).createEl('div', { cls: 'setting-item-info' }).createEl('div', { text: 'Color Controls', cls: 'setting-item-name' });
		// Primary color
		new Setting(containerEl)
			.setName('Primary Type')
			.setDesc('Select a primary color type')
			.addButton(button => {
				const typeText = this.plugin.settings.primaryType.replace('primary-type-', '');
				button.setButtonText(capitalize(typeText))
					.onClick(() => {
						new TypeSuggestModal(this.app, async (chosenType) => {
							this.plugin.settings.primaryType = `primary-type-${chosenType}`;
							this.plugin.settings.presetOverride = "";
							await this.plugin.saveSettings();
							this.display();
						}).open();
					});
			});
		// Secondary color
		new Setting(containerEl)
			.setName('Secondary Type')
			.setDesc('Select a secondary color type')
			.addButton(button => {
				const typeText = this.plugin.settings.secondaryType.replace('secondary-type-', '');
				button.setButtonText(capitalize(typeText))
					.onClick(() => {
						new TypeSuggestModal(this.app, async (chosenType) => {
							this.plugin.settings.secondaryType = `secondary-type-${chosenType}`;
							this.plugin.settings.presetOverride = "";
							await this.plugin.saveSettings();
							this.display();
						}).open();
					});
			});
		// Presets
		const availablePresets = this.plugin.getAvailablePresets();
		const displayPresets = availablePresets.map(name =>
			name.charAt(0).toUpperCase() + name.slice(1)
		);
		let presetInfoText = displayPresets.length > 0
			? `Available presets: ${displayPresets.join(', ')}`
			: `No preset classes found in loaded stylesheets.`;

		new Setting(containerEl)
			.setName("Preset Override")
			.setDesc(createFragment(frag => {
				frag.appendText("Select a custom preset to apply a predefined style");
				frag.appendChild(document.createElement("br"));

				const presetsLine = document.createElement("div"); // was <small>
				// Removed: presetsLine.style.opacity = '0.7';
				presetsLine.textContent = presetInfoText;

				frag.appendChild(presetsLine);
			}))
			.addButton(button => {
				const currentPreset = this.plugin.settings.presetOverride || "None";
				button.setButtonText(currentPreset.charAt(0).toUpperCase() + currentPreset.slice(1))
					.onClick(() => {
						const availablePresets = this.plugin.getAvailablePresets();
						new PresetSuggestModal(this.app, availablePresets, async (chosenPreset) => {
							this.plugin.settings.presetOverride = chosenPreset;
							await this.plugin.saveSettings();
							this.display();
						}).open();
					});
			});

		// Text Settings
		containerEl.createEl('div', { cls: 'setting-item setting-item-heading' }).createEl('div', { cls: 'setting-item-info' }).createEl('div', { text: 'Text Controls', cls: 'setting-item-name' });
		// Font Weight
		const fontWeightSetting = new Setting(containerEl)
			.setName("Font Weight")
			.setDesc("Adjust the font weight");

		const currentValueEl = document.createElement('div');
		currentValueEl.textContent = `Current weight: ${this.plugin.settings.fontWeight || 400}`;
		fontWeightSetting.descEl.appendChild(currentValueEl);

		fontWeightSetting.addSlider(slider => {
			slider
				.setLimits(200, 800, 100)
				.setValue(this.plugin.settings.fontWeight || 400)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.fontWeight = value;
					currentValueEl.textContent = `Current weight: ${value}`;
					await this.plugin.saveSettings();
				});

			return slider;
		});

		fontWeightSetting.addExtraButton(btn => {
			btn.setIcon('reset')
				.setTooltip('Reset to default')
				.onClick(async () => {
					const defaultValue = 400;
					this.plugin.settings.fontWeight = defaultValue;
					currentValueEl.textContent = `Current weight: ${defaultValue}`;
					await this.plugin.saveSettings();
					this.display();
				});
		});
		// Text Width
		const fontWidthSetting = new Setting(containerEl)
			.setName("File Line Width")
			.setDesc("Adjust the width of the viewable lines of text");

		const currentFontWidthEl = document.createElement('div');
		currentFontWidthEl.textContent = `Current width: ${this.plugin.settings.fontWidth || 100}%`;
		fontWidthSetting.descEl.appendChild(currentFontWidthEl);

		fontWidthSetting.addSlider(slider => {
			slider
				.setLimits(50, 100, 5)
				.setValue(this.plugin.settings.fontWidth || 100)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.fontWidth = value;
					currentFontWidthEl.textContent = `Current width: ${value}%`;
					await this.plugin.saveSettings();
				});

			return slider;
		});

		fontWidthSetting.addExtraButton(btn => {
			btn.setIcon('reset')
				.setTooltip('Reset to default')
				.onClick(async () => {
					const defaultValue = 100;
					this.plugin.settings.fontWidth = defaultValue;
					currentFontWidthEl.textContent = `Current width: ${defaultValue}%`;
					await this.plugin.saveSettings();
					this.display();
				});
		});
		// Table Settings
		containerEl.createEl('div', { cls: 'setting-item setting-item-heading' }).createEl('div', { cls: 'setting-item-info' }).createEl('div', { text: 'Table Controls', cls: 'setting-item-name' });
		// Table border style
		new Setting(containerEl)
			.setName('Table Border Style')
			.setDesc('Enable to separate the table borders')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.tableStyle)
					.onChange(async (value) => {
						this.plugin.settings.tableStyle = value;
						await this.plugin.saveSettings();
					});
			});
		new Setting(containerEl)
			.setName('Table Background Accent')
			.setDesc('Enable to use an accented border for tables')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.tableColor)
					.onChange(async (value) => {
						this.plugin.settings.tableColor = value;
						await this.plugin.saveSettings();
					});
			});
		new Setting(containerEl)
			.setName('Table Cell Width')
			.setDesc('Enable to maximize table cell width')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.tableWidth)
					.onChange(async (value) => {
						this.plugin.settings.tableWidth = value;
						await this.plugin.saveSettings();
					});
			});
		// Blockquote Settings
		containerEl.createEl('div', { cls: 'setting-item setting-item-heading' }).createEl('div', { cls: 'setting-item-info' }).createEl('div', { text: 'Blockquote Controls', cls: 'setting-item-name' });
		new Setting(containerEl)
			.setName('Blockquote Border Accent')
			.setDesc('Enable to use an accented border for blockquotes')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.blockquoteBorder)
					.onChange(async (value) => {
						this.plugin.settings.blockquoteBorder = value;
						await this.plugin.saveSettings();
					});
			});
		new Setting(containerEl)
			.setName('Blockquote Background Accent')
			.setDesc('Enable to use an accented background for blockquotes')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.blockquoteBackground)
					.onChange(async (value) => {
						this.plugin.settings.blockquoteBackground = value;
						await this.plugin.saveSettings();
					});
			});
		new Setting(containerEl)
			.setName('Callout Background Accent')
			.setDesc('Enable to use an accented background for callouts')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.calloutBackground)
					.onChange(async (value) => {
						this.plugin.settings.calloutBackground = value;
						await this.plugin.saveSettings();
					});
			});
		// Embed Settings
		containerEl.createEl('div', { cls: 'setting-item setting-item-heading' }).createEl('div', { cls: 'setting-item-info' }).createEl('div', { text: 'Embed Controls', cls: 'setting-item-name' });
		// Embed Max Height
		const embedHeightSetting = new Setting(containerEl)
			.setName('Embed Max Height')
			.setDesc('Set the maximum viewable height of embeds');

		const currentEmbedHeight = document.createElement('div');
		currentEmbedHeight.textContent = `Current height: ${this.plugin.settings.embedHeight || 4000}px`;
		embedHeightSetting.descEl.appendChild(currentEmbedHeight);
		embedHeightSetting.addSlider(slider => {
			slider
				.setLimits(100, 8000, 100)
				.setValue(this.plugin.settings.embedHeight || 4000)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.embedHeight = value;
					currentEmbedHeight.textContent = `Current height: ${value}px`;
					await this.plugin.saveSettings();
				});

			return slider;
		});
		embedHeightSetting.addExtraButton(btn => {
			btn.setIcon('reset')
				.setTooltip('Reset to default')
				.onClick(async () => {
					const defaultValue = 4000;
					this.plugin.settings.embedHeight = defaultValue;
					currentEmbedHeight.textContent = `Current height: ${defaultValue}px`;
					await this.plugin.saveSettings();
					this.display();
				});
		});
		new Setting(containerEl)
			.setName('Embed Title')
			.setDesc('Enable titles in embeds')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.embedTitle)
					.onChange(async (value) => {
						this.plugin.settings.embedTitle = value;
						await this.plugin.saveSettings();
					});
			});
		// Mobile Settings
		containerEl.createEl('div', { cls: 'setting-item setting-item-heading' }).createEl('div', { cls: 'setting-item-info' }).createEl('div', { text: 'Mobile Controls', cls: 'setting-item-name' });
		// Mobile Toolbar
		const mobileToolbarSetting = new Setting(containerEl)
			.setName('Mobile Toolbar Height')
			.setDesc('Set the maximum number of rows of tools to show for the mobile toolbar');

		const currentMobileToolbarHeight = document.createElement('div');
		currentMobileToolbarHeight.textContent = `Current height: ${this.plugin.settings.mobileToolbarheight || 2} rows`;
		mobileToolbarSetting.descEl.appendChild(currentMobileToolbarHeight);

		mobileToolbarSetting.addSlider(slider => {
			slider
				.setLimits(1, 4, 1)
				.setValue(this.plugin.settings.mobileToolbarheight || 2)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.mobileToolbarheight = value;
					currentMobileToolbarHeight.textContent = `Current height: ${value} rows`;
					await this.plugin.saveSettings();
				});

			return slider;
		});

		mobileToolbarSetting.addExtraButton(btn => {
			btn.setIcon('reset')
				.setTooltip('Reset to default')
				.onClick(async () => {
					const defaultValue = 2;
					this.plugin.settings.mobileToolbarheight = defaultValue;
					currentMobileToolbarHeight.textContent = `Current height: ${defaultValue} rows`;
					await this.plugin.saveSettings();
					this.display();
				});
		});
		// Tags
		new Setting(containerEl)
			.setName('Tag Interaction')
			.setDesc('Disable tag search when clicking on a tag')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.tagInteraction)
					.onChange(async (value) => {
						this.plugin.settings.tagInteraction = value;
						await this.plugin.saveSettings();
					});
			});
		// Mobile notification bar color
		new Setting(containerEl)
			.setName('System Status Bar Accent')
			.setDesc('Enable accented system status bar')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.mobileStatusbar)
					.onChange(async (value) => {
						this.plugin.settings.mobileStatusbar = value;
						await this.plugin.saveSettings();
					});
			});
		// Global reset button
		const resetSetting = new Setting(containerEl)
			.setName('Reset Settings')
			.setDesc('Reset all settings and enable the "Clobbopus" preset')
			.addButton(button =>
				button.setButtonText('Reset')
					.setCta()
					.onClick(async () => {
						this.plugin.settings = {
							...DEFAULT_SETTINGS,
							presetOverride: 'Clobbopus'
						};
						await this.plugin.saveSettings();
						new Notice('Settings reset and "Clobbopus" preset applied!');
						this.display(); // Refresh settings UI
					})
			);
		resetSetting.settingEl.style.marginTop = '1.5em';
	}
}