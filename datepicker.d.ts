import { Unsubscribe } from 'nanoevents';
type MinOrMaxTimeOption = Date | [
    number,
    number
] | number | boolean;
type IOnSubmit = {
    selectedDate: Date;
    readableDate: string;
};
type SimplePickerEvents = {
    submit: (e: IOnSubmit) => void;
    close: () => void;
};
type SimplePickerOpts = {
    zIndex?: number;
    compactMode?: boolean;
    disableTimeSection?: boolean;
    selectedDate?: Date;
    min?: MinOrMaxTimeOption;
    max?: MinOrMaxTimeOption;
    interval?: number;
    onChange?(): Date;
};
declare class SimplePicker {
    private emitter;
    selectedDate: Date;
    readableDate: string;
    private opts;
    private $;
    private $$;
    private $simplepicker;
    private $simplepickerWrapper;
    private $trs;
    private $tds;
    private $headerMonthAndYear;
    private $monthAndYear;
    private $date;
    private $day;
    private $time;
    private $timeInput;
    private $timeSectionIcon;
    private $cancel;
    private $ok;
    private $displayDateElements;
    private $timePicker;
    set max(value: MinOrMaxTimeOption);
    set min(value: MinOrMaxTimeOption);
    get min(): MinOrMaxTimeOption;
    constructor(arg1?: HTMLElement | string | SimplePickerOpts, arg2?: SimplePickerOpts);
    initElMethod(el: Element): void;
    init(el: HTMLElement, opts: SimplePickerOpts): void;
    reset(newDate?: Date): void;
    compactMode: () => string;
    disableTimeSection(): void;
    enableTimeSection(): void;
    injectTemplate(el: HTMLElement): void;
    clearRows(): void;
    updateDateComponents(date: Date): void;
    render(data: any): void;
    updateSelectedDate(el?: HTMLElement): void;
    selectDateElement(el: HTMLElement): void;
    findElementWithDate(date: any, returnLastIfNotFound?: boolean): any;
    handleIconButtonClick(el: HTMLElement): void;
    initListeners(): void;
    open: () => void;
    close: () => void;
    on<E extends keyof SimplePickerEvents>(event: E, callback: SimplePickerEvents[E]): Unsubscribe;
    toggleDisplayFade(): void;
}
export { SimplePicker as default, SimplePickerOpts };
export type { MinOrMaxTimeOption };
