import { maxColumnsCount } from "../constants/max-columns-count.constant";
import { maxRowsCount } from "../constants/max-rows-count.constant";
import { PartialUnknown } from "./partial-unknown.model";


export interface Settings {
	readonly cellWeight: number;
	readonly rowsCount: number;
	readonly columnsCount: number;
	readonly has: number;
	readonly toSpend: number;
}

export function buildSettings(data: unknown): Settings {
	if (typeof data !== "object" || data === null) {
		throw new Error("Invalid Settings value");
	}
	const dataObj: PartialUnknown<Settings> = data;
	if (typeof dataObj.cellWeight !== "number" || !Number.isInteger(dataObj.cellWeight) || dataObj.cellWeight < 0) {
		throw new Error(`Invalid value of Settings.cellWeight: '${ dataObj.cellWeight }'`);
	}
	if (typeof dataObj.rowsCount !== "number" || !Number.isInteger(dataObj.rowsCount) || dataObj.rowsCount < 0 || dataObj.rowsCount > maxRowsCount) {
		throw new Error(`Invalid value of Settings.rowsCount: '${ dataObj.rowsCount }'`);
	}
	if (typeof dataObj.columnsCount !== "number" || !Number.isInteger(dataObj.columnsCount) || dataObj.columnsCount < 0 || dataObj.columnsCount > maxColumnsCount) {
		throw new Error(`Invalid value of Settings.columnsCount: '${ dataObj.columnsCount }'`);
	}
	
	const maxValue = dataObj.cellWeight * dataObj.rowsCount * dataObj.columnsCount;
	
	if (typeof dataObj.has !== "number" || !Number.isInteger(dataObj.has) || dataObj.has < 0) {
		throw new Error(`Invalid value of Settings.has: '${ dataObj.has }'`);
	} else if (dataObj.has > maxValue) {
		throw new Error(`Invalid value of Settings.has: '${ dataObj.has }', it should be less than max value of '${ maxValue }'`);
	}
	if (typeof dataObj.toSpend !== "number" || !Number.isInteger(dataObj.toSpend) || dataObj.toSpend < 0) {
		throw new Error(`Invalid value of Settings.toSpend: '${ dataObj.toSpend }'`);
	} else if (dataObj.toSpend > maxValue) {
		throw new Error(`Invalid value of Settings.toSpend: '${ dataObj.toSpend }', it should be less than max value of '${ maxValue }'`);
	}
	
	return {
		cellWeight: dataObj.cellWeight,
		rowsCount: dataObj.rowsCount,
		columnsCount: dataObj.columnsCount,
		has: dataObj.has,
		toSpend: dataObj.toSpend,
	};
}