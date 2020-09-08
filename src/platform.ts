import {HomebridgeAccessoryWrapper} from './accessory-wrapper';
import {PlatformSettings} from './platform-settings';
import { HomebridgeContextProxy} from './context-proxy';
import {API, DynamicPlatformPlugin, PlatformAccessory, Logging} from "homebridge";
import {HomebridgeContext, HomebridgeContextProps} from "./context";
import {BasePlatformConfig, isVerboseInConfigs} from "./base-platform-config";
import {BaseDevice} from "./base-device";

export type HomebridgeAccessoryWrapperConstructor<AccessoryWrapper extends HomebridgeAccessoryWrapper<Device>, Device extends BaseDevice> = { new (context: HomebridgeContextProps, accessory: PlatformAccessory, device: Device): AccessoryWrapper };

export abstract class HomebridgePlatform<Config extends BasePlatformConfig, Device extends BaseDevice, AccessoryWrapper extends HomebridgeAccessoryWrapper<Device>> extends HomebridgeContextProxy implements DynamicPlatformPlugin {

    protected readonly config: Config;
    protected readonly settings: PlatformSettings;
    protected readonly accessories: PlatformAccessory[]; // homebridge registry
    protected accessoryWrappers: AccessoryWrapper[];

    protected constructor(logger: Logging, config: Config, api: API) {
        super(new HomebridgeContext(logger, api));
        this.settings = this.initPlatformSettings();
        this.config = this.initPlatformConfig(config);
        this.accessories = [];
        api.on('didFinishLaunching', this.main.bind(this));
        api.on('shutdown', this.shutdown.bind(this));
    }

    protected initPlatformConfig(config?: Config): Config {
        if(!config) {
            if(isVerboseInConfigs(this.config.global)) {
                this.log.warn(`Missing configuration from the Homebridge config.json you need to register the plugin using the following key {"platform: ${this.settings.name}"}, use the default configuration`);
            }
            config = this.getDefaultPlatformConfig();
        }
        if(!config || config.platform !== this.settings.name) {
            throw new Error(`Invalid platform configuration '${config}', you must edit your Homebridge config.json file`);
        }
        return config;
    }

    protected abstract getDefaultPlatformConfig(): Config | undefined;

    protected abstract initPlatformSettings(): PlatformSettings;

    protected abstract getAccessoryWrapperConstructorForDevice(device: Device): HomebridgeAccessoryWrapperConstructor<AccessoryWrapper, Device> | undefined

    protected async abstract searchDevices(): Promise<Device[]>

    protected main(): void {
        if(isVerboseInConfigs(this.config.global)) {
            this.log('Searching accessories...');
        }
        this.searchAccessories()
            .then((accessories) => {
                this.accessoryWrappers = accessories;
                this.clearUnreachableAccessories();
                if(isVerboseInConfigs(this.config.global)) {
                    this.log('Finish searching accessories');
                }
            })
            .catch((err) => this.log.error(err));
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
        const uuid = this.api.hap.uuid.generate(device.id);
        const cachedAccessory = this.accessories.find((item) => item.UUID === uuid);
        if(cachedAccessory) {
            return new AccessoryWrapperConstructor(this.context, cachedAccessory, device);
        }
        const accessory = new this.api.platformAccessory(device.name, uuid);
        const accessoryWrapper = new AccessoryWrapperConstructor(this.context, accessory, device);
        this.configureAccessory(accessory);
        this.api.registerPlatformAccessories(this.settings.plugin, this.settings.name, [accessory]);
        return accessoryWrapper;
    }

    configureAccessory(accessory: PlatformAccessory) {
        this.accessories.push(accessory);
    }

    protected clearUnreachableAccessories() {
        const unreachableAccessories = this.accessories.filter((cachedAccessory) => {
            return this.accessoryWrappers.some((acc: AccessoryWrapper) => {
                return acc.accessory.UUID === cachedAccessory.UUID;
            }) === false;
        });
        if(unreachableAccessories.length > 0) {
            this.api.unregisterPlatformAccessories(this.settings.plugin, this.settings.name, unreachableAccessories);
        }
    }
}
