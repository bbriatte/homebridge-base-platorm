import {DeviceKeys} from './device-keys';

export interface PlatformSettings {
    readonly name: string;
    readonly plugin: string;
    readonly deviceKeys: DeviceKeys
}