import { Component, computed, effect, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef } from "@angular/material/dialog";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";

import { Settings } from "./models/settings.model";


function integerValidator(): ValidatorFn {
	return (control: AbstractControl<number | null>): ValidationErrors | null => {
		const value = control.value;
		
		if (value === null) {
			return null;
		}
		return Number.isInteger(value) ? null : { "notInteger": true };
	};
}

interface SettingsForm {
	readonly cellWeight: FormControl<number | null>;
	readonly rowsCount: FormControl<number | null>;
	readonly columnsCount: FormControl<number | null>;
	readonly has: FormControl<number | null>;
	readonly toSpend: FormControl<number | null>;
}

@Component({
	selector: "settings-editor",
	imports: [
		MatFormField,
		MatLabel,
		MatInput,
		ReactiveFormsModule,
		MatDialogContent,
		MatDialogActions,
		MatButton,
		MatDialogClose,
		MatError,
		FormsModule
	],
	template: `
		<mat-dialog-content>
			<form (submit)="saveSettings()">
				<input type="submit" style="display: none;"/><!-- it needed to make form's (submit) event work -->
				
				<mat-form-field>
					<mat-label>Cell Weight</mat-label>
					<input type="number" matInput [formControl]="settingsFormGroup.controls.cellWeight"/>
					@if (settingsFormGroup.controls.cellWeight.hasError("required")) {
						<mat-error>Value required</mat-error>
					} @else if (settingsFormGroup.controls.cellWeight.hasError("min")) {
						<mat-error>Value must be greater than or equal to {{ settingsFormGroup.controls.cellWeight.errors?.["min"].min }}</mat-error>
					} @else if (settingsFormGroup.controls.cellWeight.hasError("max")) {
						<mat-error>Value must be less than or equal to {{ settingsFormGroup.controls.cellWeight.errors?.["max"].max }}</mat-error>
					} @else if (settingsFormGroup.controls.cellWeight.hasError("notInteger")) {
						<mat-error>Value must be a valid integer</mat-error>
					}
				</mat-form-field>
				<mat-form-field>
					<mat-label>Rows Count</mat-label>
					<input type="number" matInput [formControl]="settingsFormGroup.controls.rowsCount"/>
					@if (settingsFormGroup.controls.rowsCount.hasError("required")) {
						<mat-error>Value required</mat-error>
					} @else if (settingsFormGroup.controls.rowsCount.hasError("min")) {
						<mat-error>Value must be greater than or equal to {{ settingsFormGroup.controls.rowsCount.errors?.["min"].min }}</mat-error>
					} @else if (settingsFormGroup.controls.rowsCount.hasError("max")) {
						<mat-error>Value must be less than or equal to {{ settingsFormGroup.controls.rowsCount.errors?.["max"].max }}</mat-error>
					} @else if (settingsFormGroup.controls.rowsCount.hasError("notInteger")) {
						<mat-error>Value must be a valid integer</mat-error>
					}
				</mat-form-field>
				<mat-form-field>
					<mat-label>Columns Count</mat-label>
					<input type="number" matInput [formControl]="settingsFormGroup.controls.columnsCount"/>
					@if (settingsFormGroup.controls.columnsCount.hasError("required")) {
						<mat-error>Value required</mat-error>
					} @else if (settingsFormGroup.controls.columnsCount.hasError("min")) {
						<mat-error>Value must be greater than or equal to {{ settingsFormGroup.controls.columnsCount.errors?.["min"].min }}</mat-error>
					} @else if (settingsFormGroup.controls.columnsCount.hasError("max")) {
						<mat-error>Value must be less than or equal to {{ settingsFormGroup.controls.columnsCount.errors?.["max"].max }}</mat-error>
					} @else if (settingsFormGroup.controls.columnsCount.hasError("notInteger")) {
						<mat-error>Value must be a valid integer</mat-error>
					}
				</mat-form-field>
				<mat-form-field>
					<mat-label>Has</mat-label>
					<input type="number" matInput [formControl]="settingsFormGroup.controls.has"/>
					@if (settingsFormGroup.controls.has.hasError("min")) {
						<mat-error>Value must be greater than or equal to {{ settingsFormGroup.controls.has.errors?.["min"].min }}</mat-error>
					} @else if (settingsFormGroup.controls.has.hasError("max")) {
						<mat-error>Value must be less than or equal to {{ settingsFormGroup.controls.has.errors?.["max"].max }}</mat-error>
					} @else if (settingsFormGroup.controls.has.hasError("notInteger")) {
						<mat-error>Value must be a valid integer</mat-error>
					}
				</mat-form-field>
				<mat-form-field>
					<mat-label>To Spend</mat-label>
					<input type="number" matInput [formControl]="settingsFormGroup.controls.toSpend"/>
					@if (settingsFormGroup.controls.toSpend.hasError("min")) {
						<mat-error>Value must be greater than or equal to {{ settingsFormGroup.controls.toSpend.errors?.["min"].min }}</mat-error>
					} @else if (settingsFormGroup.controls.toSpend.hasError("max")) {
						<mat-error>Value must be less than or equal to {{ settingsFormGroup.controls.toSpend.errors?.["max"].max }}</mat-error>
					} @else if (settingsFormGroup.controls.toSpend.hasError("notInteger")) {
						<mat-error>Value must be a valid integer</mat-error>
					}
				</mat-form-field>
			</form>
		</mat-dialog-content>
		<mat-dialog-actions>
			<button matButton [mat-dialog-close]>Cancel</button>
			<button matButton (click)="saveSettings()" cdkFocusInitial>Ok</button>
		</mat-dialog-actions>
	`,
	styles: `
		form {
			display: flex;
			flex-direction: column;
			gap: .5rem;
			min-width: 25rem;
		}
	`
})
export class SettingsEditorDialog {
	
	protected readonly settingsFormGroup = new FormGroup<SettingsForm>({
		cellWeight: new FormControl(0, { nonNullable: true, validators: [ Validators.required, integerValidator(), Validators.min(1) ] }),
		rowsCount: new FormControl(0, { nonNullable: true, validators: [ Validators.required, integerValidator(), Validators.min(1), Validators.max(50) ] }),
		columnsCount: new FormControl(0, { nonNullable: true, validators: [ Validators.required, integerValidator(), Validators.min(1), Validators.max(50) ] }),
		has: new FormControl(0, { nonNullable: true }),
		toSpend: new FormControl(0, { nonNullable: true }),
	});
	
	private readonly dialogRef = inject(MatDialogRef<SettingsEditorDialog, Settings>);
	
	constructor() {
		const data = inject<Settings>(MAT_DIALOG_DATA);
		this.settingsFormGroup.controls.cellWeight.setValue(data.cellWeight);
		this.settingsFormGroup.controls.rowsCount.setValue(data.rowsCount);
		this.settingsFormGroup.controls.columnsCount.setValue(data.columnsCount);
		this.settingsFormGroup.controls.has.setValue(data.has);
		this.settingsFormGroup.controls.toSpend.setValue(data.toSpend);
		
		const cellWeightSignal = toSignal(this.settingsFormGroup.controls.cellWeight.valueChanges, { initialValue: data.cellWeight });
		const rowsCountSignal = toSignal(this.settingsFormGroup.controls.rowsCount.valueChanges, { initialValue: data.rowsCount });
		const columnsCountSignal = toSignal(this.settingsFormGroup.controls.columnsCount.valueChanges, { initialValue: data.columnsCount });
		const maxValueSignal = computed(() => {
			let maxValue: number | undefined;
			const cellWeight = cellWeightSignal();
			const rowsCount = rowsCountSignal();
			const columnsCount = columnsCountSignal();
			if (cellWeight !== null && cellWeight > 0 && rowsCount !== null && rowsCount > 0 && columnsCount !== null && columnsCount > 0) {
				maxValue = cellWeight * rowsCount * columnsCount;
			}
			return maxValue;
		});
		
		effect(() => {
			const maxValue = maxValueSignal();
			if (maxValue !== undefined) {
				this.settingsFormGroup.controls.has.setValidators([ Validators.min(0), Validators.max(maxValue), integerValidator() ]);
				this.settingsFormGroup.controls.toSpend.setValidators([ Validators.min(0), Validators.max(maxValue), integerValidator() ]);
			} else {
				this.settingsFormGroup.controls.has.setValidators([ Validators.min(0), integerValidator() ]);
				this.settingsFormGroup.controls.toSpend.setValidators([ Validators.min(0), integerValidator() ]);
			}
		});
	}
	
	protected saveSettings() {
		if (this.settingsFormGroup.invalid) {
			this.settingsFormGroup.markAllAsTouched();
		} else {
			const updatedSettings: Settings = {
				cellWeight: this.settingsFormGroup.controls.cellWeight.value!,
				rowsCount: this.settingsFormGroup.controls.rowsCount.value!,
				columnsCount: this.settingsFormGroup.controls.columnsCount.value!,
				has: this.settingsFormGroup.controls.has.value ?? 0,
				toSpend: this.settingsFormGroup.controls.toSpend.value ?? 0,
			};
			this.dialogRef.close(updatedSettings);
		}
	}
	
}