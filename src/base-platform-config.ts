import {PlatformConfig} from "homebridge";

export interface BasePlatformConfig extends PlatformConfig {
    readonly global?: BaseGlobalConfig;
}

export interface BaseGlobalConfig {
    readonly verbose?: boolean;
}

export function isVerboseInConfigs(...configs: BaseGlobalConfig[]): boolean {
    let isVerbose = false;
    for(const config of configs) {
        if(config && config.verbose !== undefined) {
            isVerbose = config.verbose;
        }
    }
    return isVerbose;
}
