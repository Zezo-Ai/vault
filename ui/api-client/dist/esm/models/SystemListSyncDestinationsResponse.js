/* tslint:disable */
/* eslint-disable */
/**
 * HashiCorp Vault API
 * HTTP API that gives you full access to Vault. All API routes are prefixed with `/v1/`.
 *
 * The version of the OpenAPI document: 1.21.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/**
 * Check if a given object implements the SystemListSyncDestinationsResponse interface.
 */
export function instanceOfSystemListSyncDestinationsResponse(value) {
    return true;
}
export function SystemListSyncDestinationsResponseFromJSON(json) {
    return SystemListSyncDestinationsResponseFromJSONTyped(json, false);
}
export function SystemListSyncDestinationsResponseFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
        return json;
    }
    return {
        'keyInfo': json['key_info'] == null ? undefined : json['key_info'],
        'keys': json['keys'] == null ? undefined : json['keys'],
        'totalDestinations': json['total_destinations'] == null ? undefined : json['total_destinations'],
    };
}
export function SystemListSyncDestinationsResponseToJSON(json) {
    return SystemListSyncDestinationsResponseToJSONTyped(json, false);
}
export function SystemListSyncDestinationsResponseToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
        return value;
    }
    return {
        'key_info': value['keyInfo'],
        'keys': value['keys'],
        'total_destinations': value['totalDestinations'],
    };
}
