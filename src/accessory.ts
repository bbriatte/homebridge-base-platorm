import {Logger} from './logger';

export class HomebridgeAccessory<Device> {
    readonly log: Logger;
    readonly homebridge: any;
    readonly accessory: any;
    readonly device: Device;

    public constructor(log: Logger, accessory: any, homebridge: any, device: Device) {
        this.log = log;
        this.accessory = accessory;
        this.homebridge = homebridge;
        this.device = device;
    }

    public getDisplayName(): string {
        return this.accessory.displayName;
    }

    public getService(serviceType: any, displayName: string, subType: string): any {
        const service = this.accessory.getServiceByUUIDAndSubType(serviceType, subType);
        if (!service) {
            return this.accessory.addService(serviceType, displayName, subType);
        } else if(service.displayName !== displayName) {
            const Characteristic = this.homebridge.hap.Characteristic;
            const nameCharacteristic = service.getCharacteristic(Characteristic.Name)
                || service.addCharacteristic(Characteristic.Name);
            nameCharacteristic.setValue(displayName);
            service.displayName = displayName;
        }
        return service;
    }

    public removeService(serviceType: any, subType: string) {
        const service = this.accessory.getServiceByUUIDAndSubType(serviceType, subType);
        if(service !== undefined) {
            this.accessory.removeService(service);
        }
    }

    public getServices(serviceType: any, condition: (service: any) => boolean): any[] {
        if(this.accessory.services === undefined) {
            return [];
        }
        return this.accessory.services.filter((service) => {
            return service.UUID === serviceType.UUID && condition(service) === true;
        });
    }
}