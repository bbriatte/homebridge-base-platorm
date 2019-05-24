import {Logger} from './logger';

export interface ContextProps {
    readonly log: Logger;
    readonly homebridge: any;
    readonly Characteristic: any;
    readonly Service: any;
    readonly Accessory: any;
    readonly uuid: any;
}

export class Context implements ContextProps {

    readonly log: Logger;
    readonly homebridge: any;

    constructor(log: Logger, homebridge: any) {
        this.log = log;
        this.homebridge = homebridge;
    }

    get Characteristic(): any {
        return this.homebridge.hap.Characteristic;
    }

    get Service(): any {
        return this.homebridge.hap.Service;
    }

    get Accessory(): any {
        return this.homebridge.hap.Accessory;
    }

    get uuid(): any {
        return this.homebridge.hap.uuid;
    }
}