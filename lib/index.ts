import { formatTimeFromMinutes } from './date-util';
import * as dateUtil from './date-util';
import type { TimeOptions, TimePicker, MinOrMaxTimeOption } from './interfaces';
import { htmlTemplate } from './template';
import 'pickadate/lib/compressed/picker.time';
import jquery from 'jquery';
import './simplepicker.css';
import 'pickadate/lib/themes/classic.css';
import 'pickadate/lib/themes/classic.time.css';
import { createNanoEvents, Unsubscribe } from 'nanoevents';

type IOnSubmit = { selectedDate: Date; readableDate: string };

type SimplePickerEvents = {
	submit: (e: IOnSubmit) => void;
	close: () => void;
};

export type SimplePickerOpts = {
	zIndex?: number;
	compactMode?: boolean;
	disableTimeSection?: boolean;
	selectedDate?: Date;
	min?: MinOrMaxTimeOption;
	max?: MinOrMaxTimeOption;
	interval?: number;
	onChange?(): Date;
};

// type EventHandlers = {
// 	[E in keyof SimplePickerEvents]: Array<SimplePickerEvents[E]>;
// };

const today = new Date();

class SimplePicker {
	private emitter = createNanoEvents<SimplePickerEvents>();
	selectedDate: Date = new Date();
	// $simplePicker: HTMLElement;
	readableDate: string;
	// _eventHandlers: EventHandlers;

	private opts: SimplePickerOpts;
	private $: (el: string) => HTMLElement;
	private $$: (el: string) => HTMLElement[];
	private $simplepicker: HTMLElement;
	private $simplepickerWrapper: HTMLElement;
	private $trs: HTMLElement[];
	private $tds: HTMLElement[];
	private $headerMonthAndYear: HTMLElement;
	private $monthAndYear: HTMLElement;
	private $date: HTMLElement;
	private $day: HTMLElement;
	private $time: HTMLElement;
	private $timeInput: HTMLInputElement;
	private $timeSectionIcon: HTMLElement;
	private $cancel: HTMLElement;
	private $ok: HTMLElement;
	private $displayDateElements: HTMLElement[];
	private $timePicker: TimePicker;

	public set max(value: MinOrMaxTimeOption) {
		this.$timePicker.set('max', value);
	}
	public set min(value: MinOrMaxTimeOption) {
		this.$timePicker.set('min', value);
	}

	public get min(): MinOrMaxTimeOption {
		const time = this.$timePicker.get('min');
		return [time.hour, time.mins];
	}

	constructor(arg1?: HTMLElement | string | SimplePickerOpts, arg2?: SimplePickerOpts) {
		let el: HTMLElement | undefined = undefined;
		let opts: SimplePickerOpts | undefined = arg2;

		if (typeof arg1 === 'string') {
			const element = document.querySelector<HTMLElement>(arg1);
			if (element !== null) {
				el = element;
			} else {
				throw new Error('Invalid selector passed to SimplePicker!');
			}
		} else if (arg1 instanceof HTMLElement) {
			el = arg1;
		} else if (typeof arg1 === 'object') {
			opts = arg1 as SimplePickerOpts;
		}
		el ??= document.body;
		opts ??= {};

		this.injectTemplate(el);
		this.init(el, opts);
		this.initListeners();
		// this._eventHandlers = {
		// 	submit: [],
		// 	close: [],
		// };

		this.$timeInput.style.marginLeft = 'auto';
		this.$timeInput.style.marginRight = 'auto';
		const options: TimeOptions = {
			clear: 'Borrar',
			editable: false,
			interval: opts.interval,
			onSet: ({ select: time }: { select: [number, number] }) => {
				if (time) {
					this.$time.innerHTML = formatTimeFromMinutes(time);
					this.updateSelectedDate();
				}
			},
		};
		const $input = jquery(this.$timeInput).pickatime(options as Pickadate.Options);
		this.$timePicker = $input.pickatime('picker');
		if (opts.min) this.min = opts.min;
		if (opts.max) this.max = opts.max;
		if (this.$timePicker.get('min').pick === 0) this.$timePicker.set('select', [0, 0]);
		else this.$timePicker.set('select', this.min);
	}

	// We use $, $$ as helper method to conviently select
	// element we need for simplepicker.
	// Also, Limit the query to the wrapper class to avoid
	// selecting elements on the other instance.
	initElMethod(el: Element) {
		this.$ = (sel) => el.querySelector(sel)!;
		this.$$ = (sel) => Array.from(el.querySelectorAll(sel)!);
	}

	init(el: HTMLElement, opts: SimplePickerOpts) {
		this.$simplepickerWrapper = <HTMLElement>el.querySelector('.simplepicker-wrapper');
		this.initElMethod(this.$simplepickerWrapper);

		const { $, $$ } = this;
		this.$simplepicker = $('.simpilepicker-date-picker');
		this.$trs = $$('.simplepicker-calender tbody tr');
		this.$tds = $$('.simplepicker-calender tbody td');
		this.$headerMonthAndYear = $('.simplepicker-month-and-year');
		this.$monthAndYear = $('.simplepicker-selected-date');
		this.$date = $('.simplepicker-date');
		this.$day = $('.simplepicker-day-header');
		this.$time = $('.simplepicker-time');
		this.$timeInput = $('.simplepicker-time-section input') as HTMLInputElement;
		this.$timeSectionIcon = $('.simplepicker-icon-time');
		this.$cancel = $('.simplepicker-cancel-btn');
		this.$ok = $('.simplepicker-ok-btn');

		this.$displayDateElements = [this.$day, this.$headerMonthAndYear, this.$date];

		this.$time.classList.add('simplepicker-fade');
		this.render(dateUtil.scrapeMonth(today));

		this.opts = opts;

		this.reset(opts.selectedDate || today);

		if (opts.zIndex !== undefined) {
			this.$simplepickerWrapper.style.zIndex = opts.zIndex.toString();
		}

		if (opts.disableTimeSection) {
			this.disableTimeSection();
		}

		if (opts.compactMode) {
			this.compactMode();
		}
	}

	// Reset by selecting current date.
	reset(newDate?: Date) {
		let date = newDate || new Date();
		this.render(dateUtil.scrapeMonth(date));

		// The timeFull variable below will be formatted as HH:mm:ss.
		// Using regular expression we remove the :ss parts.
		const timeFull = date.toTimeString().split(' ')[0];
		const time = timeFull.replace(/:\d\d$/, '');
		this.$timeInput.value = time;
		this.$time.innerText = dateUtil.formatTimeFromInputElement(time);

		const dateString = date.getDate().toString();
		const $dateEl = this.findElementWithDate(dateString);
		if (!$dateEl.classList.contains('active')) {
			this.selectDateElement($dateEl);
			this.updateDateComponents(date);
		}
	}

	compactMode = () => (this.$date.style.display = 'none');

	disableTimeSection() {
		const { $timeSectionIcon } = this;
		$timeSectionIcon.style.visibility = 'hidden';
	}

	enableTimeSection() {
		const { $timeSectionIcon } = this;
		$timeSectionIcon.style.visibility = 'visible';
	}

	injectTemplate(el: HTMLElement) {
		const $template = document.createElement('template');
		$template.innerHTML = htmlTemplate;
		el.appendChild($template.content.cloneNode(true));
	}

	clearRows() {
		this.$tds.forEach((td) => {
			td.textContent = '';
			td.classList.remove('active');
		});
	}

	updateDateComponents(date: Date) {
		const day = dateUtil.days[date.getDay()];
		const month = dateUtil.months[date.getMonth()];
		const year = date.getFullYear();
		const monthAndYear = month + ' ' + year;

		this.$headerMonthAndYear.innerHTML = monthAndYear;
		this.$monthAndYear.innerHTML = monthAndYear;
		this.$day.innerHTML = day;
		this.$date.innerHTML = dateUtil.getDisplayDate(date);
	}

	render(data) {
		const { $$, $trs } = this;
		const { month, date } = data;

		this.clearRows();
		month.forEach((week, index) => {
			const $tds = $trs[index].children;
			week.forEach((day, index) => {
				const td = $tds[index];
				if (!day) {
					td.setAttribute('data-empty', '');
					return;
				}

				td.removeAttribute('data-empty');
				td.innerHTML = day;
			});
		});

		const $lastRowDates = $$('table tbody tr:last-child td');
		let lasRowIsEmpty = true;
		$lastRowDates.forEach((date) => {
			if (date.dataset.empty === undefined) {
				lasRowIsEmpty = false;
			}
		});

		// hide last row if it's empty to avoid
		// extra spacing due to last row
		const $lastRow = $lastRowDates[0].parentElement;
		if (lasRowIsEmpty && $lastRow) {
			$lastRow.style.display = 'none';
		} else {
			//@ts-ignore
			$lastRow.style.display = 'table-row';
		}

		this.updateDateComponents(date);
	}

	updateSelectedDate(el?: HTMLElement) {
		const { $monthAndYear, $time } = this;

		let day;
		if (el) {
			day = el.innerHTML.trim();
		} else {
			day = this.$date.innerHTML.replace(/[a-z]+/, '');
		}

		const [monthName, year] = $monthAndYear.innerHTML.split(' ');
		const month = dateUtil.months.indexOf(monthName);
		let timeComponents = $time.innerHTML.split(':');
		let hours = +timeComponents[0];
		let [minutes, meridium] = timeComponents[1].split(' ');

		if (meridium === 'AM' && hours == 12) {
			hours = 0;
		}

		if (meridium === 'PM' && hours < 12) {
			hours += 12;
		}

		const date = new Date(+year, +month, +day, +hours, +minutes);
		this.selectedDate = date;

		let _date = day + ' ';
		_date += $monthAndYear.innerHTML.trim() + ' ';
		_date += $time.innerHTML.trim();
		this.readableDate = _date.replace(/^\d+/, date.getDate().toString());
	}

	selectDateElement(el: HTMLElement) {
		const alreadyActive = this.$$('.simplepicker-calender tbody .active');
		alreadyActive.forEach((e) => e.classList.remove('active'));
		el.classList.add('active');

		this.updateSelectedDate(el);
		this.updateDateComponents(this.selectedDate);
	}

	findElementWithDate(date, returnLastIfNotFound: boolean = false) {
		const { $tds } = this;

		let el, lastTd;
		$tds.forEach((td) => {
			const content = td.innerHTML.trim();
			if (content === date) {
				el = td;
			}

			if (content !== '') {
				lastTd = td;
			}
		});

		if (el === undefined && returnLastIfNotFound) {
			el = lastTd;
		}

		return el;
	}

	handleIconButtonClick(el: HTMLElement) {
		const { $ } = this;
		const baseClass = 'simplepicker-icon-';
		const nextIcon = baseClass + 'next';
		const previousIcon = baseClass + 'previous';
		const calenderIcon = baseClass + 'calender';
		const timeIcon = baseClass + 'time';

		if (el.classList.contains(calenderIcon)) {
			const $timeIcon = $('.' + timeIcon);
			const $timeSection = $('.simplepicker-time-section');
			const $calenderSection = $('.simplepicker-calender-section');

			$calenderSection.style.display = 'block';
			$timeSection.style.display = 'none';
			$timeIcon.classList.remove('active');
			el.classList.add('active');
			this.toggleDisplayFade();
			return;
		}

		if (el.classList.contains(timeIcon)) {
			const $calenderIcon = $('.' + calenderIcon);
			const $calenderSection = $('.simplepicker-calender-section');
			const $timeSection = $('.simplepicker-time-section');

			$timeSection.style.display = 'block';
			$calenderSection.style.display = 'none';
			$calenderIcon.classList.remove('active');
			el.classList.add('active');
			this.toggleDisplayFade();
			return;
		}

		let selectedDate;
		const $active = $('.simplepicker-calender td.active');
		if ($active) {
			selectedDate = $active.innerHTML.trim();
		}

		if (el.classList.contains(nextIcon)) {
			this.render(dateUtil.scrapeNextMonth());
		}

		if (el.classList.contains(previousIcon)) {
			this.render(dateUtil.scrapePreviousMonth());
		}

		if (selectedDate) {
			let $dateTd = this.findElementWithDate(selectedDate, true);
			this.selectDateElement($dateTd);
		}
	}

	initListeners() {
		const { $simplepicker, $ok, $cancel, $simplepickerWrapper } = this;
		const _this = this;
		$simplepicker.addEventListener('click', function (e) {
			const target = e.target as HTMLElement;
			const tagName = target.tagName.toLowerCase();

			e.stopPropagation();
			if (tagName === 'td') {
				_this.selectDateElement(target);
				return;
			}

			if (tagName === 'button' && target.classList.contains('simplepicker-icon')) {
				_this.handleIconButtonClick(target);
				return;
			}
		});

		$ok.addEventListener('click', () => {
			_this.close();
			this.emitter.emit('submit', {
				selectedDate: this.selectedDate,
				readableDate: this.readableDate,
			});
		});

		const close = () => {
			_this.close();
			this.emitter.emit('close');
		};

		$cancel.addEventListener('click', close);
		$simplepickerWrapper.addEventListener('click', close);
	}

	open = () => this.$simplepickerWrapper.classList.add('active');

	// can be called by user or by click the cancel btn.
	close = () => this.$simplepickerWrapper.classList.remove('active');

	on<E extends keyof SimplePickerEvents>(event: E, callback: SimplePickerEvents[E]): Unsubscribe {
		return this.emitter.on(event, callback);
	}

	toggleDisplayFade() {
		this.$time.classList.toggle('simplepicker-fade');
		this.$displayDateElements.forEach(($el) => {
			$el.classList.toggle('simplepicker-fade');
		});
	}
}

export default SimplePicker;
export type { MinOrMaxTimeOption } from './interfaces';
