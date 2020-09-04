import {DeviceKeyMapping} from './device-key-mapping';

export interface PlatformSettings {
    readonly name: string;
    readonly plugin: string;
    readonly deviceKeyMapping: DeviceKeyMapping;
}
