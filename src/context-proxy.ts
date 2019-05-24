import {Context, ContextProps} from './context';
import {Logger} from './logger';

export class ContextProxy implements ContextProps {
    readonly context: Context;

    public constructor(context: Context) {
        this.context = context;
    }

    get log(): Logger {
        return this.context.log;
    }

    get homebridge(): any {
        return this.context.homebridge;
    }

    get Characteristic(): any {
        return this.context.Characteristic;
    }

    get Service(): any {
        return this.context.Service;
    }

    get Accessory(): any {
        return this.context.Accessory;
    }

    get uuid(): any {
        return this.context.uuid;
    }
}