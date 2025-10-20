import { Component, computed, effect, ElementRef, inject, Pipe, PipeTransform, Signal, signal } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

import { localStorageSettingsKey } from "./constants/local-storage-settings-key.constant";
import { buildSettings, Settings } from "./models/settings.model";
import { SettingsEditorDialog } from "./settings-editor-dialog.component";


enum CellType {
	empty,
	has,
	toBeSpent,
	needed,
}

interface Cell {
	readonly type: CellType;
}

@Pipe({ name: "mvCellTypeCssClass" })
class CellTypeCssClassPipe implements PipeTransform {
	
	transform(value: CellType): string {
		switch (value) {
			case CellType.empty:
				return "";
			case CellType.has:
				return "cell-has";
			case CellType.toBeSpent:
				return "cell-to-be-spent";
			case CellType.needed:
				return "cell-needed";
		}
	}
	
}

@Component({
	selector: "app-root",
	imports: [
		CellTypeCssClassPipe,
	],
	template: `
		<div class="grid">
			@for (r of rows(); track r) {
				@for (c of r; track c) {
					<div [class]="c.type | mvCellTypeCssClass"
						 (click)="updateSettings()"
					></div>
				}
			}
		</div>
	`,
	styles: `
		.grid {
			width: 100%;
			height: 100%;
			display: grid;
			grid-template-rows: repeat(var(--rows-count), 1fr);
			grid-template-columns: repeat(var(--columns-count), 1fr);
			
			div {
				cursor: pointer;
				border: 1px solid #000;
				
				/*&:has(~ div:hover),
				&:hover {
					border: 1px solid #ff6b6b;
				}*/
				
				&:hover {
					border-width: 2px;
				}
				
				&.cell-has {
					background: #5be7a9;
				}
				
				&.cell-to-be-spent {
					background: #ffbd67;
				}
				
				&.cell-needed {
					background: #ff6464;
				}
			}
		}
	`
})
export class App {
	
	protected readonly settings = signal(this.loadSettings());
	
	protected readonly rows: Signal<ReadonlyArray<ReadonlyArray<Cell>>> = computed(() => {
		const settings = this.settings();
		
		const rows: Cell[][] = [];
		const moneyLeftAfterSpent = settings.has - settings.toSpend;
		const toSpendRoundedToCellWeight = Math.ceil(settings.toSpend / settings.cellWeight) * settings.cellWeight;
		let currentValue = 0;
		for (let i = 0; i < settings.rowsCount; i++) {
			const row: Cell[] = [];
			for (let i = 0; i < settings.columnsCount; i++) {
				currentValue += settings.cellWeight;
				if (settings.toSpend !== 0) {
					if (currentValue <= settings.has) {
						if (currentValue <= moneyLeftAfterSpent) {
							row.push({ type: CellType.has });
						} else {
							row.push({ type: CellType.toBeSpent });
						}
					} else {
						if (currentValue <= toSpendRoundedToCellWeight) {
							row.push({ type: CellType.needed });
						} else {
							row.push({ type: CellType.empty });
						}
					}
				} else if (currentValue <= settings.has) {
					row.push({ type: CellType.has });
				} else {
					row.push({ type: CellType.empty });
				}
			}
			rows.push(row);
		}
		return rows;
	});
	private readonly matDialogService = inject(MatDialog);
	
	constructor() {
		const elementRef = inject(ElementRef<HTMLElement>);
		
		effect(() => {
			const settings = this.settings();
			elementRef.nativeElement.style.setProperty("--rows-count", settings.rowsCount);
			elementRef.nativeElement.style.setProperty("--columns-count", settings.columnsCount);
		});
	}
	
	protected updateSettings() {
		this.matDialogService
			.open<SettingsEditorDialog, Settings, Settings>(
				SettingsEditorDialog,
				{
					data: this.settings(),
				}
			)
			.afterClosed()
			.subscribe(settings => {
				if (settings) {
					this.settings.set(settings);
					localStorage.setItem(localStorageSettingsKey, JSON.stringify(settings));
				}
			});
	}
	
	private loadSettings() {
		let settings: Settings | undefined;
		const settingsObj = localStorage.getItem(localStorageSettingsKey);
		if (settingsObj !== null) {
			try {
				settings = buildSettings(JSON.parse(settingsObj));
			} catch (error: unknown) {
				console.error(error);
			}
		}
		if (settings === undefined) {
			settings = {
				cellWeight: 50,
				rowsCount: 10,
				columnsCount: 20,
				has: 0,
				toSpend: 0,
			};
		}
		return settings;
	}
	
	
}