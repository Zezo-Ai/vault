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
 * @interface PkiReadCertDeltaCrlResponse
 */
export interface PkiReadCertDeltaCrlResponse {
    /**
     * Issuing CA Chain
     * @type {string}
     * @memberof PkiReadCertDeltaCrlResponse
     */
    caChain?: string;
    /**
     * Certificate
     * @type {string}
     * @memberof PkiReadCertDeltaCrlResponse
     */
    certificate?: string;
    /**
     * ID of the issuer
     * @type {string}
     * @memberof PkiReadCertDeltaCrlResponse
     */
    issuerId?: string;
    /**
     * Revocation time
     * @type {number}
     * @memberof PkiReadCertDeltaCrlResponse
     */
    revocationTime?: number;
    /**
     * Revocation time RFC 3339 formatted
     * @type {string}
     * @memberof PkiReadCertDeltaCrlResponse
     */
    revocationTimeRfc3339?: string;
}
/**
 * Check if a given object implements the PkiReadCertDeltaCrlResponse interface.
 */
export declare function instanceOfPkiReadCertDeltaCrlResponse(value: object): value is PkiReadCertDeltaCrlResponse;
export declare function PkiReadCertDeltaCrlResponseFromJSON(json: any): PkiReadCertDeltaCrlResponse;
export declare function PkiReadCertDeltaCrlResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): PkiReadCertDeltaCrlResponse;
export declare function PkiReadCertDeltaCrlResponseToJSON(json: any): PkiReadCertDeltaCrlResponse;
export declare function PkiReadCertDeltaCrlResponseToJSONTyped(value?: PkiReadCertDeltaCrlResponse | null, ignoreDiscriminator?: boolean): any;
