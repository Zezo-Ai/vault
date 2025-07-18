"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.instanceOfAliCloudLoginRequest = instanceOfAliCloudLoginRequest;
exports.AliCloudLoginRequestFromJSON = AliCloudLoginRequestFromJSON;
exports.AliCloudLoginRequestFromJSONTyped = AliCloudLoginRequestFromJSONTyped;
exports.AliCloudLoginRequestToJSON = AliCloudLoginRequestToJSON;
exports.AliCloudLoginRequestToJSONTyped = AliCloudLoginRequestToJSONTyped;
/**
 * Check if a given object implements the AliCloudLoginRequest interface.
 */
function instanceOfAliCloudLoginRequest(value) {
    if (!('role' in value) || value['role'] === undefined)
        return false;
    return true;
}
function AliCloudLoginRequestFromJSON(json) {
    return AliCloudLoginRequestFromJSONTyped(json, false);
}
function AliCloudLoginRequestFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
        return json;
    }
    return {
        'identityRequestHeaders': json['identity_request_headers'] == null ? undefined : json['identity_request_headers'],
        'identityRequestUrl': json['identity_request_url'] == null ? undefined : json['identity_request_url'],
        'role': json['role'],
    };
}
function AliCloudLoginRequestToJSON(json) {
    return AliCloudLoginRequestToJSONTyped(json, false);
}
function AliCloudLoginRequestToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
        return value;
    }
    return {
        'identity_request_headers': value['identityRequestHeaders'],
        'identity_request_url': value['identityRequestUrl'],
        'role': value['role'],
    };
}
