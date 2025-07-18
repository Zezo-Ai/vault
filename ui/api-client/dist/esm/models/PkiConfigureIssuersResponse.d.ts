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
 * @interface PkiConfigureIssuersResponse
 */
export interface PkiConfigureIssuersResponse {
    /**
     * Reference (name or identifier) to the default issuer.
     * @type {string}
     * @memberof PkiConfigureIssuersResponse
     */
    _default?: string;
    /**
     * Whether the default issuer should automatically follow the latest generated or imported issuer. Defaults to false.
     * @type {boolean}
     * @memberof PkiConfigureIssuersResponse
     */
    defaultFollowsLatestIssuer?: boolean;
}
/**
 * Check if a given object implements the PkiConfigureIssuersResponse interface.
 */
export declare function instanceOfPkiConfigureIssuersResponse(value: object): value is PkiConfigureIssuersResponse;
export declare function PkiConfigureIssuersResponseFromJSON(json: any): PkiConfigureIssuersResponse;
export declare function PkiConfigureIssuersResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): PkiConfigureIssuersResponse;
export declare function PkiConfigureIssuersResponseToJSON(json: any): PkiConfigureIssuersResponse;
export declare function PkiConfigureIssuersResponseToJSONTyped(value?: PkiConfigureIssuersResponse | null, ignoreDiscriminator?: boolean): any;
