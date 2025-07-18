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
 * @interface SystemWriteReplicationSecondaryPromoteRequest
 */
export interface SystemWriteReplicationSecondaryPromoteRequest {
    /**
     * Set to true if the cluster should be promoted despite replication being in an error state. This could mean some data was not replicated to the secondary
     * @type {boolean}
     * @memberof SystemWriteReplicationSecondaryPromoteRequest
     */
    force?: boolean;
    /**
     * The address the secondary cluster should connect to. Defaults to the primary's cluster address.
     * @type {string}
     * @memberof SystemWriteReplicationSecondaryPromoteRequest
     */
    primaryClusterAddr?: string;
}

/**
 * Check if a given object implements the SystemWriteReplicationSecondaryPromoteRequest interface.
 */
export function instanceOfSystemWriteReplicationSecondaryPromoteRequest(value: object): value is SystemWriteReplicationSecondaryPromoteRequest {
    return true;
}

export function SystemWriteReplicationSecondaryPromoteRequestFromJSON(json: any): SystemWriteReplicationSecondaryPromoteRequest {
    return SystemWriteReplicationSecondaryPromoteRequestFromJSONTyped(json, false);
}

export function SystemWriteReplicationSecondaryPromoteRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): SystemWriteReplicationSecondaryPromoteRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'force': json['force'] == null ? undefined : json['force'],
        'primaryClusterAddr': json['primary_cluster_addr'] == null ? undefined : json['primary_cluster_addr'],
    };
}

export function SystemWriteReplicationSecondaryPromoteRequestToJSON(json: any): SystemWriteReplicationSecondaryPromoteRequest {
    return SystemWriteReplicationSecondaryPromoteRequestToJSONTyped(json, false);
}

export function SystemWriteReplicationSecondaryPromoteRequestToJSONTyped(value?: SystemWriteReplicationSecondaryPromoteRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'force': value['force'],
        'primary_cluster_addr': value['primaryClusterAddr'],
    };
}

