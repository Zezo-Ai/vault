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
exports.instanceOfSystemWriteReplicationDrSecondaryDisableRequest = instanceOfSystemWriteReplicationDrSecondaryDisableRequest;
exports.SystemWriteReplicationDrSecondaryDisableRequestFromJSON = SystemWriteReplicationDrSecondaryDisableRequestFromJSON;
exports.SystemWriteReplicationDrSecondaryDisableRequestFromJSONTyped = SystemWriteReplicationDrSecondaryDisableRequestFromJSONTyped;
exports.SystemWriteReplicationDrSecondaryDisableRequestToJSON = SystemWriteReplicationDrSecondaryDisableRequestToJSON;
exports.SystemWriteReplicationDrSecondaryDisableRequestToJSONTyped = SystemWriteReplicationDrSecondaryDisableRequestToJSONTyped;
/**
 * Check if a given object implements the SystemWriteReplicationDrSecondaryDisableRequest interface.
 */
function instanceOfSystemWriteReplicationDrSecondaryDisableRequest(value) {
    return true;
}
function SystemWriteReplicationDrSecondaryDisableRequestFromJSON(json) {
    return SystemWriteReplicationDrSecondaryDisableRequestFromJSONTyped(json, false);
}
function SystemWriteReplicationDrSecondaryDisableRequestFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
        return json;
    }
    return {
        'drOperationToken': json['dr_operation_token'] == null ? undefined : json['dr_operation_token'],
    };
}
function SystemWriteReplicationDrSecondaryDisableRequestToJSON(json) {
    return SystemWriteReplicationDrSecondaryDisableRequestToJSONTyped(json, false);
}
function SystemWriteReplicationDrSecondaryDisableRequestToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
        return value;
    }
    return {
        'dr_operation_token': value['drOperationToken'],
    };
}
