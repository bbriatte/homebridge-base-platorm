import {API, Logging, Characteristic, Service, Accessory} from "homebridge";

export interface HomebridgeContextProps {
    readonly log: Logging;
    readonly api: API;
    readonly Characteristic: typeof Characteristic;
    readonly Service: typeof Service;
    readonly Accessory: typeof Accessory;
}

export class HomebridgeContext implements HomebridgeContextProps {

    readonly log: Logging;
    readonly api: API;

    constructor(log: Logging, api: API) {
        this.log = log;
        this.api = api;
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
