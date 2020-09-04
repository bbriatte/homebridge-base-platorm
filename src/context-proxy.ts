import {HomebridgeContextProps} from './context';
import {API, Logging, Characteristic, Service, Accessory} from "homebridge";

export class HomebridgeContextProxy implements HomebridgeContextProps {
    readonly context: HomebridgeContextProps;

    public constructor(context: HomebridgeContextProps) {
        this.context = context;
    }

    get log(): Logging {
        return this.context.log;
    }

    get api(): API {
        return this.context.api;
    }

    get Characteristic(): typeof Characteristic {
        return this.api.hap.Characteristic;
    }

    get Service(): typeof Service {
        return this.api.hap.Service;
    }

    get Accessory(): typeof Accessory {
        return this.api.hap.Accessory;
    }
}
