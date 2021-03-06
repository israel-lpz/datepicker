export interface MonthTracker {
	years: Object;
	current?: Date;
}

export const monthTracker: MonthTracker = {
	years: {},
};

export const months = [
	'Enero',
	'Febrero',
	'Marzo',
	'Abril',
	'Mayo',
	'Junio',
	'Julio',
	'Agosto',
	'Septiembre',
	'Octubre',
	'Noviembre',
	'Diciembre',
];

export const days = [
	'Domingo',
	'Lunes',
	'Martes',
	'Miercoles',
	'Jueves',
	'Viernes',
	'Sabado',
];

const fill = <T>(arr: T[], upto: number): T[] => {
	const temp: T[] = [];
	arr = temp.concat(arr);
	for (let i = 0; i < upto; i++) {
		(arr[i] as any) = undefined;
	}

	return arr;
};

// builds the calender for one month given a date
// which is end, start or in middle of the month
export const scrapeMonth = (date: Date) => {
	const originalDate = new Date(date.getTime());
	const year = date.getFullYear();
	const month = date.getMonth();

	const data = {
		date: originalDate,
		month: undefined,
	};

	monthTracker.current = new Date(date.getTime());
	monthTracker.current.setDate(1);
	monthTracker.years[year] = monthTracker.years[year] || {};
	if (monthTracker.years[year][month] !== undefined) {
		data.month = monthTracker.years[year][month];
		return data;
	}

	date = new Date(date.getTime());
	date.setDate(1);
	monthTracker.years[year][month] = [];

	let tracker = monthTracker.years[year][month];
	let rowTracker = 0;
	while (date.getMonth() === month) {
		const _date = date.getDate();
		const day = date.getDay();
		if (_date === 1) {
			tracker[rowTracker] = fill([], day);
		}

		tracker[rowTracker] = tracker[rowTracker] || [];
		tracker[rowTracker][day] = _date;

		if (day === 6) {
			rowTracker++;
		}

		date.setDate(date.getDate() + 1);
	}

	let lastRow = 5;
	if (tracker[5] === undefined) {
		lastRow = 4;
		tracker[5] = fill([], 7);
	}

	let lastRowLength = tracker[lastRow].length;
	if (lastRowLength < 7) {
		tracker[lastRow] = tracker[lastRow].concat(fill([], 7 - lastRowLength));
	}

	data.month = tracker;
	return data;
};

export const scrapePreviousMonth = () => {
	const date = monthTracker.current;
	if (!date) {
		throw Error(
			'scrapePrevoisMonth called without setting monthTracker.current!',
		);
	}

	date.setMonth(date.getMonth() - 1);
	return scrapeMonth(date);
};

export const scrapeNextMonth = () => {
	const date = monthTracker.current;
	if (!date) {
		throw Error(
			'scrapePrevoisMonth called without setting monthTracker.current!',
		);
	}

	date.setMonth(date.getMonth() + 1);
	return scrapeMonth(date);
};

const dateEndings = {
	st: [1, 21, 31],
	nd: [2, 22],
	rd: [3, 23],
};

export const getDisplayDate = (_date) => {
	const date = _date.getDate();
	if (dateEndings.st.indexOf(date) !== -1) {
		return date + 'st';
	}

	if (dateEndings.nd.indexOf(date) !== -1) {
		return date + 'nd';
	}

	if (dateEndings.rd.indexOf(date) !== -1) {
		return date + 'rd';
	}

	return date + 'th';
};

export const formatTimeFromInputElement = (input: string) => {
	let timeString = '';
	type StringOrNumberTuple = [string | number, string | number];
	let [hour, minute] = input.split(':') as StringOrNumberTuple;
	hour = +hour;

	const isPM = hour >= 12;
	if (isPM && hour > 12) {
		hour = hour - 12;
	}

	if (!isPM && hour === 0) {
		hour = 12;
	}

	timeString += hour < 10 ? '0' + hour : hour;
	timeString += `:${(+minute).toString().padStart(2, '0')} `;
	timeString += isPM ? 'PM' : 'AM';
	return timeString;
};

export const formatTimeFromMinutes = (date: [number, number] | number) => {
	let dt;
	if (Array.isArray(date)) {
		dt = new Date(2020, 1, 1, date[0], date[1]);
	} else {
		dt = new Date(2020, 1, 1, 0, date);
	}
	return formatTimeFromInputElement(`${dt.getHours()}:${dt.getMinutes()}`);
};
