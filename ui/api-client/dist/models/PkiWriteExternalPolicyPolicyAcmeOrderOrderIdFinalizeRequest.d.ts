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
 *
 * @export
 * @interface PkiWriteExternalPolicyPolicyAcmeOrderOrderIdFinalizeRequest
 */
export interface PkiWriteExternalPolicyPolicyAcmeOrderOrderIdFinalizeRequest {
    /**
     * ACME request 'payload' value
     * @type {string}
     * @memberof PkiWriteExternalPolicyPolicyAcmeOrderOrderIdFinalizeRequest
     */
    payload?: string;
    /**
     * ACME request 'protected' value
     * @type {string}
     * @memberof PkiWriteExternalPolicyPolicyAcmeOrderOrderIdFinalizeRequest
     */
    _protected?: string;
    /**
     * ACME request 'signature' value
     * @type {string}
     * @memberof PkiWriteExternalPolicyPolicyAcmeOrderOrderIdFinalizeRequest
     */
    signature?: string;
}
/**
 * Check if a given object implements the PkiWriteExternalPolicyPolicyAcmeOrderOrderIdFinalizeRequest interface.
 */
export declare function instanceOfPkiWriteExternalPolicyPolicyAcmeOrderOrderIdFinalizeRequest(value: object): value is PkiWriteExternalPolicyPolicyAcmeOrderOrderIdFinalizeRequest;
export declare function PkiWriteExternalPolicyPolicyAcmeOrderOrderIdFinalizeRequestFromJSON(json: any): PkiWriteExternalPolicyPolicyAcmeOrderOrderIdFinalizeRequest;
export declare function PkiWriteExternalPolicyPolicyAcmeOrderOrderIdFinalizeRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): PkiWriteExternalPolicyPolicyAcmeOrderOrderIdFinalizeRequest;
export declare function PkiWriteExternalPolicyPolicyAcmeOrderOrderIdFinalizeRequestToJSON(json: any): PkiWriteExternalPolicyPolicyAcmeOrderOrderIdFinalizeRequest;
export declare function PkiWriteExternalPolicyPolicyAcmeOrderOrderIdFinalizeRequestToJSONTyped(value?: PkiWriteExternalPolicyPolicyAcmeOrderOrderIdFinalizeRequest | null, ignoreDiscriminator?: boolean): any;
