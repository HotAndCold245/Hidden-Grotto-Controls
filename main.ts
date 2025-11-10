import { App, addIcon, Plugin, PluginSettingTab, Setting, Notice, Modal, SuggestModal } from 'obsidian';

interface GrottoSettings {
	presetOverride: string;
	fontWeight: number;
	fontWidth: number;
	formattedAccent: boolean;
	tagInteraction: boolean;
	tableStyle: boolean;
	tableColor: boolean;
	tableWidth: boolean;
	mobileStatusbar: boolean;
	mobileToolbarheight: number;
	blockquoteBorder: boolean;
	blockquoteStyle: boolean;
	calloutBackground: boolean;
	calloutIcon: boolean;
	embedHeight: number;
	embedTitle: boolean;
	calendarInteraction: boolean;
	calendarStyle: boolean;
	privacyRedacted: boolean;
	privacyBlur: boolean;
}

const DEFAULT_SETTINGS: GrottoSettings = {
	presetOverride: "",
	fontWeight: 400,
	fontWidth: 100,
	formattedAccent: true,
	tagInteraction: false,
	tableStyle: false,
	tableColor: false,
	tableWidth: true,
	mobileStatusbar: false,
	mobileToolbarheight: 2,
	blockquoteBorder: false,
	blockquoteStyle: false,
	calloutBackground: false,
	calloutIcon: false,
	embedHeight: 4000,
	embedTitle: false,
	calendarInteraction: false,
	calendarStyle: false,
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

		const capitalizedPreset = nextPreset.charAt(0).toUpperCase() + nextPreset.slice(1);
		new Notice(`Preset changed to: ${capitalizedPreset}`);
	}
	private resetDOMStyles() {
		const variables = [
			'font-weight', '--file-line-width', '--grotto-toolbar-rows', '--grotto-table-border-style',
			'--table-background', '--grotto-table-cell-width', '--grotto-tag-pointer-events',
			'--system-status-background', '--blockquote-border-color', '--blockquote-background-color',
			'--grotto-callout-background-color', '--grotto-callout-icon', '--embed-max-height',
			'--grotto-embed-title'
		];
		variables.forEach(varName => document.body.style.removeProperty(varName));
	}

	onunload() {
		this.removePresets();
		this.resetDOMStyles();
	}
	applySettingsToDOM() {
		this.removePresets();

		document.body.style.setProperty('font-weight', this.settings.fontWeight.toString());
		document.body.style.setProperty('--file-line-width', `${this.settings.fontWidth}%`);
		if (this.settings.formattedAccent) {
			document.body.style.setProperty('--grotto-bold-color', 'var(--grotto-accent-1)');
			document.body.style.setProperty('--grotto-italic-color', 'var(--grotto-accent-1)');
			document.body.style.setProperty('--grotto-comment-color', 'var(--grotto-accent-1)');
		}
		else {
			document.body.style.setProperty('--grotto-bold-color', 'var(--text-normal)');
			document.body.style.setProperty('--grotto-italic-color', 'var(--text-normal)');
			document.body.style.setProperty('--grotto-comment-color', 'var(--text-normal)');
		}
		document.body.style.setProperty('--grotto-toolbar-rows', `${this.settings.mobileToolbarheight}`);
		const tableBorders = this.settings.tableStyle ? 'separate' : 'collapse';
		document.body.style.setProperty('--grotto-table-border-style', tableBorders);
		const tableColors = this.settings.tableColor ? 'var(--color-accent)' : 'var(--background-primary)';
		document.body.style.setProperty('--table-background', tableColors);
		const tableWidth = this.settings.tableWidth ? 'max-content' : 'fit-content';
		document.body.style.setProperty('--grotto-table-cell-width', tableWidth);
		const pointerEvents = this.settings.tagInteraction ? 'auto' : 'none';
		document.body.style.setProperty('--grotto-tag-pointer-events', pointerEvents);
		const mobileStatus = this.settings.mobileStatusbar ? 'var(--color-accent)' : 'var(--background-primary)';
		document.body.style.setProperty('--system-status-background', mobileStatus);
		const blockquoteBorder = this.settings.blockquoteBorder ? 'var(--color-accent)' : 'var(--text-normal)';
		document.body.style.setProperty('--blockquote-border-color', blockquoteBorder);
		if (this.settings.blockquoteStyle) {
			document.body.style.setProperty('--blockquote-border-thickness', '0px');
			document.body.style.setProperty('--grotto-blockquote-style', 'italic');
			document.body.style.setProperty('--grotto-blockquote-alignment', 'center');
		}
		else {
			document.body.style.setProperty('--blockquote-border-thickness', '2px');
			document.body.style.setProperty('--grotto-blockquote-style', 'normal');
			document.body.style.setProperty('--grotto-blockquote-alignment', 'start');
		}
		const calloutBackground = this.settings.calloutBackground ? 'var(--color-accent)' : 'var(--background-primary)';
		document.body.style.setProperty('--grotto-callout-background-color', calloutBackground);
		const calloutIcon = this.settings.calloutIcon ? 'block' : 'none';
		document.body.style.setProperty('--grotto-callout-icon', calloutIcon);
		document.body.style.setProperty('--embed-max-height', `${this.settings.embedHeight}px`);
		const embeddisplayTitle = this.settings.embedTitle ? 'block' : 'none';
		document.body.style.setProperty('--grotto-embed-title', embeddisplayTitle);
		const calendarpointerEvents = this.settings.calendarInteraction ? 'auto' : 'none';
		document.body.style.setProperty('--grotto-calendar-pointer-events', calendarpointerEvents);
		if (this.settings.presetOverride && this.settings.presetOverride.trim() !== "") {
			const presetClass = `preset-${this.settings.presetOverride.trim().toLowerCase()}`;
			document.body.classList.add(presetClass);
		}
		if (this.settings.calendarStyle) {
			document.body.style.setProperty('--grotto-calendar-border-color', 'transparent');
			document.body.style.setProperty('--grotto-calendar-dayofweek-color', 'var(--grotto-calendar-color)');
			document.body.style.setProperty('--grotto-calendar-dayofweek-background-color', 'transparent');
			document.body.style.setProperty('--grotto-calendar-weekend-border-color', 'var(--grotto-accent-1)');
			document.body.style.setProperty('--grotto-calendar-dayofweek-border-width', '1px');
		}
		else {
			document.body.style.setProperty('--grotto-calendar-border-color', 'var(--grotto-accent-1)');
			document.body.style.setProperty('--grotto-calendar-dayofweek-color', 'var(--grotto-night-0)');
			document.body.style.setProperty('--grotto-calendar-dayofweek-background-color', 'var(--grotto-accent-1)');
			document.body.style.setProperty('--grotto-calendar-weekend-border-color', 'transparent');
			document.body.style.setProperty('--grotto-calendar-dayofweek-border-width', '0px');
		}
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
		// Color Settings
		containerEl.createEl('div', { cls: 'setting-item setting-item-heading' }).createEl('div', { cls: 'setting-item-info' }).createEl('div', { text: 'Color Controls', cls: 'setting-item-name' });
		// Presets
		const availablePresets = this.plugin.getAvailablePresets();
		const displayPresets = availablePresets.map(name =>
			name.charAt(0).toUpperCase() + name.slice(1)
		);
		let presetInfoText = displayPresets.length > 0
			? `Available presets: ${displayPresets.join(', ')}`
			: `No preset classes found in loaded stylesheets.`;

		new Setting(containerEl)
			.setName("Presets")
			.setDesc(createFragment(frag => {
				frag.appendText("Select a custom preset");
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
		new Setting(containerEl)
			.setName('Formatted Text Accent')
			.setDesc('Enable to use an accented bold, italic, and commented text')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.formattedAccent)
					.onChange(async (value) => {
						this.plugin.settings.formattedAccent = value;
						await this.plugin.saveSettings();
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
			.setDesc('Enable to use an accented background for tables')
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
			.setName('Blockquote Style')
			.setDesc('Enable to use an alternate blockquote style')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.blockquoteStyle)
					.onChange(async (value) => {
						this.plugin.settings.blockquoteStyle = value;
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
		new Setting(containerEl)
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
			.setDesc('Enable to display embed title')
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
			.setDesc('Enable tag search when clicking on a tag')
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
		// Calendar Settings
		containerEl.createEl('div', { cls: 'setting-item setting-item-heading' }).createEl('div', { cls: 'setting-item-info' }).createEl('div', { text: 'Calendar Controls', cls: 'setting-item-name' });
		// Calendar Interaction
		new Setting(containerEl)
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
		// Calendar Style
		new Setting(containerEl)
			.setName('Calendar Style')
			.setDesc('Enable to use an alternate calendar style')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.calendarStyle)
					.onChange(async (value) => {
						this.plugin.settings.calendarStyle = value;
						await this.plugin.saveSettings();
					});
			});
		// Privacy Settings
		containerEl.createEl('div', { cls: 'setting-item setting-item-heading' }).createEl('div', { cls: 'setting-item-info' }).createEl('div', { text: 'Privacy Controls', cls: 'setting-item-name' });
		// Redacted Text
		new Setting(containerEl)
			.setName('Redacted Text')
			.setDesc('Enable to redact all the text from prying eyes')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.privacyRedacted)
					.onChange(async (value) => {
						this.plugin.settings.privacyRedacted = value;
						await this.plugin.saveSettings();
					});
			});
		// Blurred View
		new Setting(containerEl)
			.setName('Blurred View')
			.setDesc('Enable to obscure everything from prying eyes')
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
