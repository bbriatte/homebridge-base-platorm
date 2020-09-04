import {HomebridgeContextProps} from './context';
import {HomebridgeContextProxy} from './context-proxy';
import {PlatformAccessory, Service, WithUUID} from "homebridge";

export class HomebridgeAccessoryWrapper<Device> extends HomebridgeContextProxy {
    readonly accessory: PlatformAccessory;
    readonly device: Device;

    public constructor(context: HomebridgeContextProps, accessory: PlatformAccessory, device: Device) {
        super(context);
        this.accessory = accessory;
        this.device = device;
    }

    public getDisplayName(): string {
        return this.accessory.displayName;
    }

    public getService<T extends WithUUID<typeof Service>>(serviceType: T, displayName: string, subType: string): Service {
        const service = this.accessory.getServiceById(serviceType, subType);
        if (!service) {
            return this.accessory.addService(serviceType, displayName, subType);
        } else if(service.displayName !== displayName) {
            const nameCharacteristic = service.getCharacteristic(this.Characteristic.Name)
                || service.addCharacteristic(this.Characteristic.Name);
            nameCharacteristic.setValue(displayName);
            service.displayName = displayName;
        }
        return service;
    }

    public removeService<T extends WithUUID<typeof Service>>(serviceType: T, subType: string): void {
        const service = this.accessory.getServiceById(serviceType, subType);
        if(service !== undefined) {
            this.accessory.removeService(service);
        }
    }

    public getServices<T extends WithUUID<typeof Service>>(serviceType: T, condition: (service: Service) => boolean): Service[] {
        if(this.accessory.services === undefined) {
            return [];
        }
        return this.accessory.services.filter((service) => {
            return service.UUID === serviceType.UUID && condition(service) === true;
        });
    }
}
