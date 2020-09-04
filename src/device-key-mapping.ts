export interface DeviceKeyMapping {
    id: string; // The property name inside the device object to retrieve the ID
    name: string; // The property name inside the device object to retrieve the product name
}

export const DefaultDeviceKeyMapping: DeviceKeyMapping = {
    id: 'id',
    name: 'name'
}
