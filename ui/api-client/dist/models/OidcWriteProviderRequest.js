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
exports.instanceOfOidcWriteProviderRequest = instanceOfOidcWriteProviderRequest;
exports.OidcWriteProviderRequestFromJSON = OidcWriteProviderRequestFromJSON;
exports.OidcWriteProviderRequestFromJSONTyped = OidcWriteProviderRequestFromJSONTyped;
exports.OidcWriteProviderRequestToJSON = OidcWriteProviderRequestToJSON;
exports.OidcWriteProviderRequestToJSONTyped = OidcWriteProviderRequestToJSONTyped;
/**
 * Check if a given object implements the OidcWriteProviderRequest interface.
 */
function instanceOfOidcWriteProviderRequest(value) {
    return true;
}
function OidcWriteProviderRequestFromJSON(json) {
    return OidcWriteProviderRequestFromJSONTyped(json, false);
}
function OidcWriteProviderRequestFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
        return json;
    }
    return {
        'allowedClientIds': json['allowed_client_ids'] == null ? undefined : json['allowed_client_ids'],
        'issuer': json['issuer'] == null ? undefined : json['issuer'],
        'scopesSupported': json['scopes_supported'] == null ? undefined : json['scopes_supported'],
    };
}
function OidcWriteProviderRequestToJSON(json) {
    return OidcWriteProviderRequestToJSONTyped(json, false);
}
function OidcWriteProviderRequestToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
        return value;
    }
    return {
        'allowed_client_ids': value['allowedClientIds'],
        'issuer': value['issuer'],
        'scopes_supported': value['scopesSupported'],
    };
}
