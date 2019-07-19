declare class MutableAnnotation {
    label: string;
    elem: HTMLElement;
    value: string;
    constructor(label: string, elem: HTMLElement, value: string);
}
export declare class Annotation extends MutableAnnotation {
    readonly label: string;
    readonly elem: HTMLElement;
    readonly value: string;
}
interface IProps {
    tokenizer: ITokenizer;
    elem: HTMLElement;
    onUpdate(annotations: Annotation[]): void;
    onSelected(label: string | null, selectionDone: (label: string) => void): any;
}
export declare class Annotator {
    static install(props: IProps): void;
    private props;
    private constructor();
    private selecting;
    private annotations;
    private main;
}
export interface ITokenizer {
    expand(sel: Selection): Range;
    tokenize(elem: HTMLElement): any;
}
declare class WordTokenizer implements ITokenizer {
    expand(sel: Selection): Range;
    tokenize(elem: HTMLElement): HTMLElement;
}
export declare const WORD_TOKENIZER: WordTokenizer;
export {};
