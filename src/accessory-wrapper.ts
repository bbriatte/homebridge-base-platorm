import {Context} from './context';
import {ContextProxy} from './context-proxy';

export class HomebridgeAccessoryWrapper<Device> extends ContextProxy {
    readonly accessory: any;
    readonly device: Device;

    public constructor(context: Context, accessory: any, device: Device) {
        super(context);
        this.accessory = accessory;
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
            const nameCharacteristic = service.getCharacteristic(this.Characteristic.Name)
                || service.addCharacteristic(this.Characteristic.Name);
            nameCharacteristic.setValue(displayName);
            service.displayName = displayName;
        }
        return service;
    }

    public removeService(serviceType: any, subType: string): void {
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