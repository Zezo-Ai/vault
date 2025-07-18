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
exports.instanceOfPkiIssuerReadCrlDerResponse = instanceOfPkiIssuerReadCrlDerResponse;
exports.PkiIssuerReadCrlDerResponseFromJSON = PkiIssuerReadCrlDerResponseFromJSON;
exports.PkiIssuerReadCrlDerResponseFromJSONTyped = PkiIssuerReadCrlDerResponseFromJSONTyped;
exports.PkiIssuerReadCrlDerResponseToJSON = PkiIssuerReadCrlDerResponseToJSON;
exports.PkiIssuerReadCrlDerResponseToJSONTyped = PkiIssuerReadCrlDerResponseToJSONTyped;
/**
 * Check if a given object implements the PkiIssuerReadCrlDerResponse interface.
 */
function instanceOfPkiIssuerReadCrlDerResponse(value) {
    return true;
}
function PkiIssuerReadCrlDerResponseFromJSON(json) {
    return PkiIssuerReadCrlDerResponseFromJSONTyped(json, false);
}
function PkiIssuerReadCrlDerResponseFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
        return json;
    }
    return {
        'crl': json['crl'] == null ? undefined : json['crl'],
    };
}
function PkiIssuerReadCrlDerResponseToJSON(json) {
    return PkiIssuerReadCrlDerResponseToJSONTyped(json, false);
}
function PkiIssuerReadCrlDerResponseToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
        return value;
    }
    return {
        'crl': value['crl'],
    };
}
