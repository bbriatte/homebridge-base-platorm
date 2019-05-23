import {Logger} from './logger';
import {HomebridgeAccessory} from './accessory';
import {PlatformConfig} from './platform-config';

export abstract class HomebridgePlatform<Config extends PlatformConfig, Device, Accessory extends HomebridgeAccessory<Device>> {

    readonly log: Logger;
    readonly config: Config;
    protected readonly _accessories: any[]; // homebridge registry
    protected accessories: Accessory[];

    constructor(log: Logger, config: Config, homebridge: any) {
        this.log = log;
        this.config = config;
        this._accessories = [];
        homebridge.on('didFinishLaunching', async () => {
            if(config) {
                this.log('Searching accessories...');
                this.accessories = await this.searchAccessories(homebridge);
                this.clearUnreachableAccessories(homebridge);
                this.log('Finish searching accessories');
            } else {
                this.log.error('No config provided');
            }
        });
    }

    protected abstract getPluginName(): string;

    protected async abstract searchAccessories(homebridge: any): Promise<Accessory[]>;

    configureAccessory(accessory: any) {
        accessory.reachable = true;
        this._accessories.push(accessory);
    }

    protected clearUnreachableAccessories(homebridge: any) {
        const unreachableAccessories = this._accessories.filter((cachedAccessory) => {
            return this.accessories.some((acc: Accessory) => {
                return acc.accessory.UUID === cachedAccessory.UUID;
            }) === false;
        });
        if(unreachableAccessories.length > 0) {
            unreachableAccessories.forEach((acc) => acc.reachable = false);
            homebridge.unregisterPlatformAccessories(this.getPluginName(), this.config.platform, unreachableAccessories);
        }
    }
}