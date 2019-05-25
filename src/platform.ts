import {Logger} from './logger';
import {HomebridgeAccessoryWrapper} from './accessory-wrapper';
import {PlatformSettings} from './platform-settings';
import {Context} from './context';
import {ContextProxy} from './context-proxy';

export type HomebridgeAccessoryWrapperConstructor<AccessoryWrapper extends HomebridgeAccessoryWrapper<Device>, Device> = { new (context: Context, accessory: any, device: Device): AccessoryWrapper };

export abstract class HomebridgePlatform<Config, Device extends {[key: string]: any}, AccessoryWrapper extends HomebridgeAccessoryWrapper<Device>> extends ContextProxy {

    protected readonly config: Config;
    protected readonly settings: PlatformSettings;
    protected readonly accessories: any[]; // homebridge registry
    protected accessoryWrappers: AccessoryWrapper[];

    protected constructor(log: Logger, config: Config, homebridge: any) {
        super(new Context(log, homebridge));
        this.config = config;
        this.settings = this.initPlatformSettings();
        this.accessories = [];
        homebridge.on('didFinishLaunching', this.main.bind(this));
        homebridge.on('shutdown', this.shutdown.bind(this));
    }

    protected abstract initPlatformSettings(): PlatformSettings;

    protected abstract getAccessoryWrapperConstructorForDevice(device: Device): HomebridgeAccessoryWrapperConstructor<AccessoryWrapper, Device> | undefined

    protected async abstract searchDevices(): Promise<Device[]>

    protected main(): void {
        this.context.log('Searching accessories...');
        this.searchAccessories()
            .then((accessories) => {
                this.accessoryWrappers = accessories;
                this.clearUnreachableAccessories();
                this.context.log('Finish searching accessories');
            })
            .catch((err) => this.context.log.error(err));
    }

    protected shutdown(): void {
        // default does nothing
    }

    protected async searchAccessories(): Promise<AccessoryWrapper[]> {
        const devices = await this.searchDevices();
        const accessories = devices.map((device) => this.accessoryFromDevice(device));
        return accessories.filter((acc) => acc !== undefined);
    }

    protected accessoryFromDevice(device: Device): AccessoryWrapper | undefined {
        const AccessoryWrapperConstructor = this.getAccessoryWrapperConstructorForDevice(device);
        if(AccessoryWrapperConstructor === undefined) {
            return undefined;
        }
        const uuid = this.context.uuid.generate(device[this.settings.deviceKeys.id]);
        const cachedAccessory = this.accessories.find((item) => item.UUID === uuid);
        if(cachedAccessory) {
            return new AccessoryWrapperConstructor(this.context, cachedAccessory, device);
        }
        const accessory = new this.context.homebridge.platformAccessory(device[this.settings.deviceKeys.name], uuid);
        const accessoryWrapper = new AccessoryWrapperConstructor(this.context, accessory, device);
        this.configureAccessory(accessory);
        this.context.homebridge.registerPlatformAccessories(this.settings.plugin, this.settings.name, [accessory]);
        return accessoryWrapper;
    }

    configureAccessory(accessory: any) {
        accessory.reachable = true;
        this.accessories.push(accessory);
    }

    protected clearUnreachableAccessories() {
        const unreachableAccessories = this.accessories.filter((cachedAccessory) => {
            return this.accessoryWrappers.some((acc: AccessoryWrapper) => {
                return acc.accessory.UUID === cachedAccessory.UUID;
            }) === false;
        });
        if(unreachableAccessories.length > 0) {
            unreachableAccessories.forEach((acc) => acc.reachable = false);
            this.context.homebridge.unregisterPlatformAccessories(this.settings.plugin, this.settings.name, unreachableAccessories);
        }
    }
}