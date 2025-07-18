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
 * @interface PkiConfigureCmpRequest
 */
export interface PkiConfigureCmpRequest {
    /**
     * Fields parsed from the CSR that appear in the audit and can be used by sentinel policies. Options are: [csr common_name alt_names ip_sans uri_sans other_sans signature_bits exclude_cn_from_sans ou organization country locality province street_address postal_code serial_number use_pss key_type key_bits add_basic_constraints]
     * @type {Array<string>}
     * @memberof PkiConfigureCmpRequest
     */
    auditFields?: Array<string>;
    /**
     * A map of authentication type to authentication parameters
     * @type {object}
     * @memberof PkiConfigureCmpRequest
     */
    authenticators?: object;
    /**
     * the policy to be used for non-role-qualified CMP requests; valid values are 'sign-verbatim ', or "role:<role_name>" to specify a role to use as this policy.
     * @type {string}
     * @memberof PkiConfigureCmpRequest
     */
    defaultPathPolicy?: string;
    /**
     * A comma-separated list of validations not to perform on CMPv2 messages. Possible entries are DisableCertTimeValidation and DisableMatchingKeyIdValidation.
     * @type {Array<string>}
     * @memberof PkiConfigureCmpRequest
     */
    disabledValidations?: Array<string>;
    /**
     * Parse CSR to that its fields can be used by sentinel policies.
     * @type {boolean}
     * @memberof PkiConfigureCmpRequest
     */
    enableSentinelParsing?: boolean;
    /**
     * whether CMPv2 is enabled, defaults to false
     * @type {boolean}
     * @memberof PkiConfigureCmpRequest
     */
    enabled?: boolean;
}
/**
 * Check if a given object implements the PkiConfigureCmpRequest interface.
 */
export declare function instanceOfPkiConfigureCmpRequest(value: object): value is PkiConfigureCmpRequest;
export declare function PkiConfigureCmpRequestFromJSON(json: any): PkiConfigureCmpRequest;
export declare function PkiConfigureCmpRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): PkiConfigureCmpRequest;
export declare function PkiConfigureCmpRequestToJSON(json: any): PkiConfigureCmpRequest;
export declare function PkiConfigureCmpRequestToJSONTyped(value?: PkiConfigureCmpRequest | null, ignoreDiscriminator?: boolean): any;
