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
exports.PkiConfigureScepRequestAllowedEncryptionAlgorithmsEnum = exports.PkiConfigureScepRequestAllowedDigestAlgorithmsEnum = void 0;
exports.instanceOfPkiConfigureScepRequest = instanceOfPkiConfigureScepRequest;
exports.PkiConfigureScepRequestFromJSON = PkiConfigureScepRequestFromJSON;
exports.PkiConfigureScepRequestFromJSONTyped = PkiConfigureScepRequestFromJSONTyped;
exports.PkiConfigureScepRequestToJSON = PkiConfigureScepRequestToJSON;
exports.PkiConfigureScepRequestToJSONTyped = PkiConfigureScepRequestToJSONTyped;
/**
* @export
* @enum {string}
*/
var PkiConfigureScepRequestAllowedDigestAlgorithmsEnum;
(function (PkiConfigureScepRequestAllowedDigestAlgorithmsEnum) {
})(PkiConfigureScepRequestAllowedDigestAlgorithmsEnum || (exports.PkiConfigureScepRequestAllowedDigestAlgorithmsEnum = PkiConfigureScepRequestAllowedDigestAlgorithmsEnum = {}));
/**
* @export
* @enum {string}
*/
var PkiConfigureScepRequestAllowedEncryptionAlgorithmsEnum;
(function (PkiConfigureScepRequestAllowedEncryptionAlgorithmsEnum) {
})(PkiConfigureScepRequestAllowedEncryptionAlgorithmsEnum || (exports.PkiConfigureScepRequestAllowedEncryptionAlgorithmsEnum = PkiConfigureScepRequestAllowedEncryptionAlgorithmsEnum = {}));
/**
 * Check if a given object implements the PkiConfigureScepRequest interface.
 */
function instanceOfPkiConfigureScepRequest(value) {
    return true;
}
function PkiConfigureScepRequestFromJSON(json) {
    return PkiConfigureScepRequestFromJSONTyped(json, false);
}
function PkiConfigureScepRequestFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
        return json;
    }
    return {
        'allowedDigestAlgorithms': json['allowed_digest_algorithms'] == null ? undefined : json['allowed_digest_algorithms'],
        'allowedEncryptionAlgorithms': json['allowed_encryption_algorithms'] == null ? undefined : json['allowed_encryption_algorithms'],
        'authenticators': json['authenticators'] == null ? undefined : json['authenticators'],
        'defaultPathPolicy': json['default_path_policy'] == null ? undefined : json['default_path_policy'],
        'enabled': json['enabled'] == null ? undefined : json['enabled'],
        'externalValidation': json['external_validation'] == null ? undefined : json['external_validation'],
        'restrictCaChainToIssuer': json['restrict_ca_chain_to_issuer'] == null ? undefined : json['restrict_ca_chain_to_issuer'],
    };
}
function PkiConfigureScepRequestToJSON(json) {
    return PkiConfigureScepRequestToJSONTyped(json, false);
}
function PkiConfigureScepRequestToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
        return value;
    }
    return {
        'allowed_digest_algorithms': value['allowedDigestAlgorithms'],
        'allowed_encryption_algorithms': value['allowedEncryptionAlgorithms'],
        'authenticators': value['authenticators'],
        'default_path_policy': value['defaultPathPolicy'],
        'enabled': value['enabled'],
        'external_validation': value['externalValidation'],
        'restrict_ca_chain_to_issuer': value['restrictCaChainToIssuer'],
    };
}
