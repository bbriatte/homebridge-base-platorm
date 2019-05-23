export interface Logger extends Function {
    readonly debug: Function;
    readonly info: Function;
    readonly warn: Function;
    readonly error: Function;
    readonly log: Function;
    readonly prefix: string;
}