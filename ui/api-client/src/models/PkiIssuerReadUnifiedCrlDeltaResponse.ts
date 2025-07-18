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

import { mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface PkiIssuerReadUnifiedCrlDeltaResponse
 */
export interface PkiIssuerReadUnifiedCrlDeltaResponse {
    /**
     * 
     * @type {string}
     * @memberof PkiIssuerReadUnifiedCrlDeltaResponse
     */
    crl?: string;
}

/**
 * Check if a given object implements the PkiIssuerReadUnifiedCrlDeltaResponse interface.
 */
export function instanceOfPkiIssuerReadUnifiedCrlDeltaResponse(value: object): value is PkiIssuerReadUnifiedCrlDeltaResponse {
    return true;
}

export function PkiIssuerReadUnifiedCrlDeltaResponseFromJSON(json: any): PkiIssuerReadUnifiedCrlDeltaResponse {
    return PkiIssuerReadUnifiedCrlDeltaResponseFromJSONTyped(json, false);
}

export function PkiIssuerReadUnifiedCrlDeltaResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): PkiIssuerReadUnifiedCrlDeltaResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'crl': json['crl'] == null ? undefined : json['crl'],
    };
}

export function PkiIssuerReadUnifiedCrlDeltaResponseToJSON(json: any): PkiIssuerReadUnifiedCrlDeltaResponse {
    return PkiIssuerReadUnifiedCrlDeltaResponseToJSONTyped(json, false);
}

export function PkiIssuerReadUnifiedCrlDeltaResponseToJSONTyped(value?: PkiIssuerReadUnifiedCrlDeltaResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'crl': value['crl'],
    };
}

