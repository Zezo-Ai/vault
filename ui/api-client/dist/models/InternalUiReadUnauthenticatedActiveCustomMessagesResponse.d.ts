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
 * @interface InternalUiReadUnauthenticatedActiveCustomMessagesResponse
 */
export interface InternalUiReadUnauthenticatedActiveCustomMessagesResponse {
    /**
     *
     * @type {object}
     * @memberof InternalUiReadUnauthenticatedActiveCustomMessagesResponse
     */
    keyInfo?: object;
    /**
     *
     * @type {Array<string>}
     * @memberof InternalUiReadUnauthenticatedActiveCustomMessagesResponse
     */
    keys?: Array<string>;
}
/**
 * Check if a given object implements the InternalUiReadUnauthenticatedActiveCustomMessagesResponse interface.
 */
export declare function instanceOfInternalUiReadUnauthenticatedActiveCustomMessagesResponse(value: object): value is InternalUiReadUnauthenticatedActiveCustomMessagesResponse;
export declare function InternalUiReadUnauthenticatedActiveCustomMessagesResponseFromJSON(json: any): InternalUiReadUnauthenticatedActiveCustomMessagesResponse;
export declare function InternalUiReadUnauthenticatedActiveCustomMessagesResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): InternalUiReadUnauthenticatedActiveCustomMessagesResponse;
export declare function InternalUiReadUnauthenticatedActiveCustomMessagesResponseToJSON(json: any): InternalUiReadUnauthenticatedActiveCustomMessagesResponse;
export declare function InternalUiReadUnauthenticatedActiveCustomMessagesResponseToJSONTyped(value?: InternalUiReadUnauthenticatedActiveCustomMessagesResponse | null, ignoreDiscriminator?: boolean): any;
