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
 * Check if a given object implements the RewrapRequest interface.
 */
export function instanceOfRewrapRequest(value) {
    return true;
}
export function RewrapRequestFromJSON(json) {
    return RewrapRequestFromJSONTyped(json, false);
}
export function RewrapRequestFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
        return json;
    }
    return {
        'token': json['token'] == null ? undefined : json['token'],
    };
}
export function RewrapRequestToJSON(json) {
    return RewrapRequestToJSONTyped(json, false);
}
export function RewrapRequestToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
        return value;
    }
    return {
        'token': value['token'],
    };
}
