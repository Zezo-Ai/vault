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
exports.instanceOfSystemReadConfigGroupPolicyApplicationResponse = instanceOfSystemReadConfigGroupPolicyApplicationResponse;
exports.SystemReadConfigGroupPolicyApplicationResponseFromJSON = SystemReadConfigGroupPolicyApplicationResponseFromJSON;
exports.SystemReadConfigGroupPolicyApplicationResponseFromJSONTyped = SystemReadConfigGroupPolicyApplicationResponseFromJSONTyped;
exports.SystemReadConfigGroupPolicyApplicationResponseToJSON = SystemReadConfigGroupPolicyApplicationResponseToJSON;
exports.SystemReadConfigGroupPolicyApplicationResponseToJSONTyped = SystemReadConfigGroupPolicyApplicationResponseToJSONTyped;
/**
 * Check if a given object implements the SystemReadConfigGroupPolicyApplicationResponse interface.
 */
function instanceOfSystemReadConfigGroupPolicyApplicationResponse(value) {
    return true;
}
function SystemReadConfigGroupPolicyApplicationResponseFromJSON(json) {
    return SystemReadConfigGroupPolicyApplicationResponseFromJSONTyped(json, false);
}
function SystemReadConfigGroupPolicyApplicationResponseFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
        return json;
    }
    return {
        'groupPolicyApplicationMode': json['group_policy_application_mode'] == null ? undefined : json['group_policy_application_mode'],
    };
}
function SystemReadConfigGroupPolicyApplicationResponseToJSON(json) {
    return SystemReadConfigGroupPolicyApplicationResponseToJSONTyped(json, false);
}
function SystemReadConfigGroupPolicyApplicationResponseToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
        return value;
    }
    return {
        'group_policy_application_mode': value['groupPolicyApplicationMode'],
    };
}
