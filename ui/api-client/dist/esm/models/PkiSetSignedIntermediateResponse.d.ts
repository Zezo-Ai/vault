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
 * @interface PkiSetSignedIntermediateResponse
 */
export interface PkiSetSignedIntermediateResponse {
    /**
     * Existing issuers specified as part of the import bundle of this request
     * @type {Array<string>}
     * @memberof PkiSetSignedIntermediateResponse
     */
    existingIssuers?: Array<string>;
    /**
     * Existing keys specified as part of the import bundle of this request
     * @type {Array<string>}
     * @memberof PkiSetSignedIntermediateResponse
     */
    existingKeys?: Array<string>;
    /**
     * Net-new issuers imported as a part of this request
     * @type {Array<string>}
     * @memberof PkiSetSignedIntermediateResponse
     */
    importedIssuers?: Array<string>;
    /**
     * Net-new keys imported as a part of this request
     * @type {Array<string>}
     * @memberof PkiSetSignedIntermediateResponse
     */
    importedKeys?: Array<string>;
    /**
     * A mapping of issuer_id to key_id for all issuers included in this request
     * @type {object}
     * @memberof PkiSetSignedIntermediateResponse
     */
    mapping?: object;
}
/**
 * Check if a given object implements the PkiSetSignedIntermediateResponse interface.
 */
export declare function instanceOfPkiSetSignedIntermediateResponse(value: object): value is PkiSetSignedIntermediateResponse;
export declare function PkiSetSignedIntermediateResponseFromJSON(json: any): PkiSetSignedIntermediateResponse;
export declare function PkiSetSignedIntermediateResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): PkiSetSignedIntermediateResponse;
export declare function PkiSetSignedIntermediateResponseToJSON(json: any): PkiSetSignedIntermediateResponse;
export declare function PkiSetSignedIntermediateResponseToJSONTyped(value?: PkiSetSignedIntermediateResponse | null, ignoreDiscriminator?: boolean): any;
