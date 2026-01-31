import { App, addIcon, Plugin, PluginSettingTab, Setting, Notice, SuggestModal } from 'obsidian';

interface GrottoSettings {
	presetOverride: string;
	tagInteraction: boolean;
	tagAccent: boolean;
	tagShape: boolean;
	fontWeight: number;
	fontWidth: number;
	formattedAccent: boolean;
	headerRounded: boolean;
	tableStyle: boolean;
	tableColor: boolean;
	tableWidth: boolean;
	calloutIcon: boolean;
	embedHeight: number;
	calendarInteraction: boolean;
	calendarWeekend: boolean;
	privacyBlur: boolean;
	privacyRedacted: boolean;
}

const DEFAULT_SETTINGS: GrottoSettings = {
	presetOverride: "",
	tagInteraction: false,
	tagAccent: false,
	tagShape: false,
	fontWeight: 500,
	fontWidth: 100,
	formattedAccent: true,
	headerRounded: false,
	tableStyle: false,
	tableColor: false,
	tableWidth: true,
	calloutIcon: false,
	embedHeight: 4000,
	calendarInteraction: false,
	calendarWeekend: false,
	privacyRedacted: false,
	privacyBlur: false,
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
		el.createEl('div', { text: prettifyPresetName(preset) });
	}
	onChooseSuggestion(preset: string, evt: MouseEvent | KeyboardEvent) {
		this.onChoose(preset);
	}
	onOpen() {
		super.onOpen();
		this.containerEl.classList.add("hidden-grotto-presets");
	}
}

function prettifyPresetName(name: string): string {
	return name
		.split('-')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export default class HiddenGrotto extends Plugin {
	settings: GrottoSettings;
	private cachedPresets: string[] | null = null;
	async onload() {
		await this.loadSettings();
		this.applySettingsToDOM();
		// Custom icon for the preset cycling
		addIcon('cycle-preset', '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"viewBox="0 0 256 256"><path fill=currentColor opacity="1.000000" stroke="none" d="M243.517914,101.606964 C251.807251,140.867111 243.723602,175.908401 217.753143,206.057571 C196.818481,230.360672 169.783905,244.053741 137.765076,246.243790 C71.721527,250.761093 19.331234,202.748322 12.341545,143.763779 C6.422440,93.813644 31.015741,47.160252 75.623924,24.008842 C118.757599,1.622693 173.171921,9.246656 208.605103,42.348419 C225.987778,58.587334 237.710297,78.093155 243.517914,101.606964 M108.744705,33.142208 C57.593082,43.828785 23.517294,94.050583 32.598221,145.368912 C41.747906,197.075821 87.272911,231.268295 140.119919,226.125275 C193.110092,220.968323 233.115143,170.014328 226.292358,117.371567 C219.056595,61.542454 166.807602,21.620567 108.744705,33.142208 z"/><path fill=currentColor opacity="1.000000" stroke="none" d="M136.556793,61.273613 C135.221420,80.707474 141.722031,95.890984 157.255661,107.677345 C164.011978,112.803795 169.822708,119.664764 174.690765,126.688896 C184.525085,140.878860 182.804947,156.529205 171.061905,169.163589 C159.569885,181.527924 144.993042,189.039001 129.604660,195.219376 C126.232231,196.573807 122.784637,197.741089 119.916328,198.794525 C119.195549,191.471039 119.160332,184.287888 117.664635,177.422913 C115.038788,165.370819 106.769608,156.889191 98.250854,148.450333 C91.941422,142.200104 85.828560,135.315125 81.420662,127.678299 C73.760170,114.406258 76.602089,99.304268 87.139786,88.121582 C100.164482,74.299667 116.522514,66.011307 134.081894,59.727329 C134.703140,59.505001 135.747787,60.465721 136.556793,61.273613 M107.743614,126.801552 C103.469910,125.404617 99.196205,124.007675 94.001419,122.309662 C97.046341,129.567947 100.762016,134.306824 107.090012,136.879547 C113.551132,139.506378 119.979477,142.280136 126.186592,145.450760 C136.957520,150.952560 147.546951,156.809662 158.616318,162.733871 C160.496384,160.551544 162.478775,158.250412 164.736694,155.629471 C147.522476,142.015167 128.309448,133.935577 107.743614,126.801552 M111.435822,105.080589 C107.056480,103.489960 102.650757,101.967651 98.305130,100.289703 C93.846519,98.568138 92.773628,101.896271 91.517494,104.778847 C90.025993,108.201569 92.828606,108.431938 94.983711,109.332115 C113.681709,117.142075 132.390778,124.928658 150.998077,132.950638 C156.351578,135.258636 161.384888,138.309357 167.089462,141.293930 C166.434845,133.920410 163.158844,129.306793 157.275421,126.540855 C142.239838,119.472290 127.185043,112.444626 111.435822,105.080589 M114.570343,83.010376 C112.083847,85.003014 109.597359,86.995651 106.231102,89.693321 C115.957306,93.638893 124.429878,97.075920 133.668259,100.823608 C130.809372,92.644127 128.321930,85.527420 125.623299,77.806465 C122.047211,79.488853 118.640793,81.091415 114.570343,83.010376 M126.962753,165.614624 C128.942307,170.304520 130.921844,174.994415 133.079834,180.107086 C138.028748,177.224625 142.469559,174.638107 147.725525,171.576797 C139.674362,167.014633 132.729538,163.079346 125.784698,159.144073 C125.454407,159.454544 125.124123,159.765015 124.793839,160.075485 C125.434830,161.684570 126.075813,163.293655 126.962753,165.614624 z"/></svg>')
		// Custom Icon for privacy mode
		addIcon('blur-toggle', '<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off-icon lucide-eye-off"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>')

		this.addRibbonIcon('cycle-preset', 'Cycle presets', async () => {
			await this.cyclePreset();
		});

		this.addCommand({
			id: 'cycle-preset-override',
			name: 'Cycle preset override',
			icon: 'cycle-preset',
			callback: async () => await this.cyclePreset(),
		});

		this.addCommand({
			id: 'toggle-privacy-blur',
			name: 'Toggle Privacy Blur',
			icon: 'blur-toggle',
			callback: async () => {
				this.settings.privacyBlur = !this.settings.privacyBlur;
				await this.saveSettings();
				new Notice(this.settings.privacyBlur ? 'Privacy blur enabled' : 'Privacy blur disabled');
			},
		});

		// Add privacy blur toggle ribbon button
		this.addRibbonIcon('blur-toggle', 'Toggle Privacy Blur', async () => {
			this.settings.privacyBlur = !this.settings.privacyBlur;
			await this.saveSettings();
			new Notice(this.settings.privacyBlur ? 'Privacy blur enabled' : 'Privacy blur disabled');
		});


		this.addSettingTab(new GrottoSettingsTab(this.app, this));
	}

	private removePresets() {
		Array.from(document.body.classList).forEach(cls => {
			if (cls.startsWith('preset-')) {
				document.body.classList.remove(cls);
			}
		});
	}

	// Cycle through the presets in order
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

		new Notice(`Preset changed to: ${prettifyPresetName(nextPreset)}`);
	}
	/* EVERYTHING BELOW NEEDS UPDATING */
	private resetDOMStyles() {
		const variables = [
			'--grotto-tag-pointer-events', 'font-weight', '--file-line-width', '--grotto-bold-color', '--grotto-italic-color', 
			'--grotto-table-border-style', '--grotto-table-color', '--grotto-table-background-color', '--grotto-table-cell-width', 
			'--grotto-callout-background-color', '--grotto-callout-icon', '--embed-max-height'
		];
		variables.forEach(varName => document.body.style.removeProperty(varName));
	}
	refreshPresetCache(): void {
		this.cachedPresets = null;
	}

	onunload() {
		this.removePresets();
		this.resetDOMStyles();
	}
	applySettingsToDOM() {
		/* Color Controls */
		/* Preset Selection */
		this.removePresets();
		if (this.settings.presetOverride && this.settings.presetOverride.trim() !== "") {
			const presetClass = `preset-${this.settings.presetOverride.trim().toLowerCase()}`;
			document.body.classList.add(presetClass);
		}
		/* Tag Controls */
		/* Tag Interaction */
		const pointerEvents = this.settings.tagInteraction ? 'auto' : 'none';
		document.body.style.setProperty('--grotto-tag-pointer-events', pointerEvents);
		/* Tag Accent */
		if (this.settings.tagAccent) {
			document.body.classList.add('grotto-tag-accented');
		} 
		else {
			document.body.classList.remove('grotto-tag-accented');
		}
		/* Tag Shape */
		if (this.settings.tagAccent) {
			document.body.classList.add('grotto-tag-rounded');
		} 
		else {
			document.body.classList.remove('grotto-tag-rounded');
		}
		/* Text Controls */
		/* Font Weight */
		document.body.style.setProperty('font-weight', this.settings.fontWeight.toString());
		/* File Line Width */
		document.body.style.setProperty('--file-line-width', `${this.settings.fontWidth}%`);
		/* Formatted Text Accent */
		if (this.settings.formattedAccent) {
			document.body.style.setProperty('--grotto-bold-color', 'var(--grotto-accent)');
			document.body.style.setProperty('--grotto-italic-color', 'var(--grotto-accent)');
		}
		else {
			document.body.style.setProperty('--grotto-bold-color', 'var(--text-normal)');
			document.body.style.setProperty('--grotto-italic-color', 'var(--text-normal)');
		}
		/* Simplified Headers */
		if (this.settings.headerRounded) {
			document.body.classList.add('grotto-header-rounded');
		} 
		else {
			document.body.classList.remove('grotto-header-rounded');
		}
		/* Table Controls */
		/* Table Border Style */
		const tableBorders = this.settings.tableStyle ? 'separate' : 'collapse';
		document.body.style.setProperty('--grotto-table-border-style', tableBorders);
		/* Accented Table Cells */
		if (this.settings.tableColor) {
			document.body.style.setProperty('--grotto-table-background-color', 'var(--grotto-accent)');
			document.body.style.setProperty('--grotto-table-color', 'var(--grotto-light-1)');
		}
		else {
			document.body.style.setProperty('--grotto-table-background-color', 'var(--background-primary)');
			document.body.style.setProperty('--grotto-table-color', 'var(--text-normal)');
		}
		/* Table Cell Width */
		const tableWidth = this.settings.tableWidth ? 'max-content' : 'fit-content';
		document.body.style.setProperty('--grotto-table-cell-width', tableWidth);
		/* Callouts */
		const calloutIcon = this.settings.calloutIcon ? 'block' : 'none';
		document.body.style.setProperty('--grotto-callout-icon', calloutIcon);
		/* Embeds */
		document.body.style.setProperty('--embed-max-height', `${this.settings.embedHeight}px`);
		/* Calendar Plugin */
		/* Interaction */
		const calendarpointerEvents = this.settings.calendarInteraction ? 'auto' : 'none';
		document.body.style.setProperty('--grotto-calendar-pointer-events', calendarpointerEvents);
		/* Weekend Indicator */
		if (this.settings.calendarWeekend) {
			document.body.style.setProperty('--grotto-calendar-weekend-border-color', 'var(--grotto-calendar-border-color)');
		}
		else {
			document.body.style.setProperty('--grotto-calendar-weekend-border-color', 'transparent');
		}
		/* Privacy Settings */
		if (this.settings.privacyRedacted) {
			document.body.style.setProperty('--font-interface', 'var(--grotto-redacted)');
			document.body.style.setProperty('--font-text', 'var(--grotto-redacted)');
			document.body.style.setProperty('--font-print', 'var(--grotto-redacted)');
			document.body.style.setProperty('--font-monospace', 'var(--grotto-redacted)');
		}
		else {
			document.body.style.setProperty('--font-interface', 'var(--font-interface-override)');
			document.body.style.setProperty('--font-text', 'var(--font-text-override)');
			document.body.style.setProperty('--font-print', 'var(--font-print-override)');
			document.body.style.setProperty('--font-monospace', 'var(--font-monospace-override)');
		}
		if (this.settings.privacyBlur) {
			document.body.style.setProperty('--grotto-blur', '4px');
		}
		else {
			document.body.style.setProperty('--grotto-blur', '0px');
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

class GrottoSettingsTab extends PluginSettingTab {
	plugin: HiddenGrotto;
	constructor(app: App, plugin: HiddenGrotto) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		// Color Controls
		const colorGroup = containerEl.createEl('div', { cls: 'setting-group' });
		colorGroup
			.createEl('div', { cls: 'setting-item setting-item-heading' })
  			.createEl('div', { text: 'Color Controls', cls: 'setting-item-name' });
		const colorGroupItems = colorGroup.createEl('div', { cls: 'setting-items' });
		// Presets
		const availablePresets = this.plugin.getAvailablePresets();
		const displayPresets = availablePresets.map(prettifyPresetName);
		let presetInfoText = displayPresets.length > 0
			? `Available presets: ${displayPresets.join(', ')}`
			: `No preset classes found in loaded stylesheets.`;
		new Setting(colorGroupItems)
			.setName("Presets")
			.setDesc(createFragment(frag => {
				frag.appendText("Select a custom preset");
				frag.appendChild(document.createElement("br"));
				const presetsLine = document.createElement("div");
				presetsLine.textContent = presetInfoText;
				frag.appendChild(presetsLine);
			}))
			.addButton(button => {
				const currentPreset = this.plugin.settings.presetOverride || "None";
				button.setButtonText(prettifyPresetName(currentPreset))
					.onClick(() => {
						this.plugin.refreshPresetCache();
						const availablePresets = this.plugin.getAvailablePresets();
						new PresetSuggestModal(this.app, availablePresets, async (chosenPreset) => {
							this.plugin.settings.presetOverride = chosenPreset;
							await this.plugin.saveSettings();
							this.display();
						}).open();
					});
			});
		// Tag Controls
		const tagGroup = containerEl.createEl('div', { cls: 'setting-group' });
		tagGroup
			.createEl('div', { cls: 'setting-item setting-item-heading' })
  			.createEl('div', { text: 'Tag Controls', cls: 'setting-item-name' });
		const tagGroupItems = tagGroup.createEl('div', { cls: 'setting-items' });
		// Tags
		new Setting(tagGroupItems)
			.setName('Tag Interaction')
			.setDesc('Enable tag search when clicking on a tag')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.tagInteraction)
					.onChange(async (value) => {
						this.plugin.settings.tagInteraction = value;
						await this.plugin.saveSettings();
					});
			});
		new Setting(tagGroupItems)
			.setName('Tag Accent')
			.setDesc('Enable to use accented tags')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.tagAccent)
					.onChange(async (value) => {
						this.plugin.settings.tagAccent = value;
						await this.plugin.saveSettings();
					});
			});
		new Setting(tagGroupItems)
			.setName('Tag Shape')
			.setDesc('Enable to use rounded tags')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.tagShape)
					.onChange(async (value) => {
						this.plugin.settings.tagShape = value;
						await this.plugin.saveSettings();
					});
			});
		// Text Controls
		const textGroup = containerEl.createEl('div', { cls: 'setting-group' });
		textGroup
			.createEl('div', { cls: 'setting-item setting-item-heading' })
  			.createEl('div', { text: 'Text Controls', cls: 'setting-item-name' });
		const textGroupItems = textGroup.createEl('div', { cls: 'setting-items' });
		// Font Weight
		const fontWeightSetting = new Setting(textGroupItems)
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
		const fontWidthSetting = new Setting(textGroupItems)
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
		new Setting(textGroupItems)
			.setName('Formatted Text Accent')
			.setDesc('Enable to use an accented bold and italic text')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.formattedAccent)
					.onChange(async (value) => {
						this.plugin.settings.formattedAccent = value;
						await this.plugin.saveSettings();
					});
			});
		new Setting(textGroupItems)
			.setName('Header Shape')
			.setDesc('Enable to use rounded headers')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.headerRounded)
					.onChange(async (value) => {
						this.plugin.settings.headerRounded = value;
						await this.plugin.saveSettings();
					});
			});
		const tableGroup = containerEl.createEl('div', { cls: 'setting-group' });
		tableGroup
			.createEl('div', { cls: 'setting-item setting-item-heading' })
  			.createEl('div', { text: 'Table Controls', cls: 'setting-item-name' });
		const tableGroupItems = tableGroup.createEl('div', { cls: 'setting-items' });
		// Table border style
		new Setting(tableGroupItems)
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
		new Setting(tableGroupItems)
			.setName('Table Background Accent')
			.setDesc('Enable to use an accented background for table cells')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.tableColor)
					.onChange(async (value) => {
						this.plugin.settings.tableColor = value;
						await this.plugin.saveSettings();
					});
			});
		new Setting(tableGroupItems)
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
		/* Callout Controls */
		const calloutGroup = containerEl.createEl('div', { cls: 'setting-group' });
		calloutGroup
			.createEl('div', { cls: 'setting-item setting-item-heading' })
  			.createEl('div', { text: 'Callout and Embed Controls', cls: 'setting-item-name' });
		const calloutGroupItems = calloutGroup.createEl('div', { cls: 'setting-items' });
		new Setting(calloutGroupItems)
			.setName('Callout Icon')
			.setDesc('Enable to display callout icons')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.calloutIcon)
					.onChange(async (value) => {
						this.plugin.settings.calloutIcon = value;
						await this.plugin.saveSettings();
					});
			});
		// Embed Max Height
		const embedHeightSetting = new Setting(calloutGroupItems)
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
		// Calendar Settings
		const calendarGroup = containerEl.createEl('div', { cls: 'setting-group' });
		calendarGroup
			.createEl('div', { cls: 'setting-item setting-item-heading' })
  			.createEl('div', { text: 'Calendar Plugin Controls', cls: 'setting-item-name' });
		const calendarGroupItems = calendarGroup.createEl('div', { cls: 'setting-items' });
		new Setting(calendarGroupItems)
			.setName('Calendar Interaction')
			.setDesc('Enable to allow daily note access when clicking on a date')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.calendarInteraction)
					.onChange(async (value) => {
						this.plugin.settings.calendarInteraction = value;
						await this.plugin.saveSettings();
					});
			});
		// Calendar Weekend
		new Setting(calendarGroupItems)
			.setName('Calendar Weekend Separator')
			.setDesc('Enable to separate the weekend with a border')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.calendarWeekend)
					.onChange(async (value) => {
						this.plugin.settings.calendarWeekend = value;
						await this.plugin.saveSettings();
					});
			});
		// Privacy Settings
		const privacyGroup = containerEl.createEl('div', { cls: 'setting-group' });
		privacyGroup
			.createEl('div', { cls: 'setting-item setting-item-heading' })
  			.createEl('div', { text: 'Privacy Controls', cls: 'setting-item-name' });
		const privacyGroupItems = privacyGroup.createEl('div', { cls: 'setting-items' });
		new Setting(privacyGroupItems)
			.setName('Redact')
			.setDesc('Enable to redact all the text')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.privacyRedacted)
					.onChange(async (value) => {
						this.plugin.settings.privacyRedacted = value;
						await this.plugin.saveSettings();
					});
			});
		// Blurred View
		new Setting(privacyGroupItems)
			.setName('Obscure')
			.setDesc('Enable to obscure everything')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.privacyBlur)
					.onChange(async (value) => {
						this.plugin.settings.privacyBlur = value;
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
