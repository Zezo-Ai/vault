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
 * @interface AuthTuneConfigurationParametersRequest
 */
export interface AuthTuneConfigurationParametersRequest {
    /**
     * A list of headers to whitelist and allow a plugin to set on responses.
     * @type {Array<string>}
     * @memberof AuthTuneConfigurationParametersRequest
     */
    allowedResponseHeaders?: Array<string>;
    /**
     * The list of keys in the request data object that will not be HMAC'd by audit devices.
     * @type {Array<string>}
     * @memberof AuthTuneConfigurationParametersRequest
     */
    auditNonHmacRequestKeys?: Array<string>;
    /**
     * The list of keys in the response data object that will not be HMAC'd by audit devices.
     * @type {Array<string>}
     * @memberof AuthTuneConfigurationParametersRequest
     */
    auditNonHmacResponseKeys?: Array<string>;
    /**
     * The default lease TTL for this mount.
     * @type {string}
     * @memberof AuthTuneConfigurationParametersRequest
     */
    defaultLeaseTtl?: string;
    /**
     * User-friendly description for this credential backend.
     * @type {string}
     * @memberof AuthTuneConfigurationParametersRequest
     */
    description?: string;
    /**
     * The name of the key used to sign plugin identity tokens. Defaults to the default key.
     * @type {string}
     * @memberof AuthTuneConfigurationParametersRequest
     */
    identityTokenKey?: string;
    /**
     * Determines the visibility of the mount in the UI-specific listing endpoint. Accepted value are 'unauth' and 'hidden', with the empty default ('') behaving like 'hidden'.
     * @type {string}
     * @memberof AuthTuneConfigurationParametersRequest
     */
    listingVisibility?: string;
    /**
     * The max lease TTL for this mount.
     * @type {string}
     * @memberof AuthTuneConfigurationParametersRequest
     */
    maxLeaseTtl?: string;
    /**
     * The options to pass into the backend. Should be a json object with string keys and values.
     * @type {object}
     * @memberof AuthTuneConfigurationParametersRequest
     */
    options?: object;
    /**
     * A list of headers to whitelist and pass from the request to the plugin.
     * @type {Array<string>}
     * @memberof AuthTuneConfigurationParametersRequest
     */
    passthroughRequestHeaders?: Array<string>;
    /**
     * The semantic version of the plugin to use, or image tag if oci_image is provided.
     * @type {string}
     * @memberof AuthTuneConfigurationParametersRequest
     */
    pluginVersion?: string;
    /**
     * The type of token to issue (service or batch).
     * @type {string}
     * @memberof AuthTuneConfigurationParametersRequest
     */
    tokenType?: string;
    /**
     *
     * @type {boolean}
     * @memberof AuthTuneConfigurationParametersRequest
     */
    trimRequestTrailingSlashes?: boolean;
    /**
     * The user lockout configuration to pass into the backend. Should be a json object with string keys and values.
     * @type {object}
     * @memberof AuthTuneConfigurationParametersRequest
     */
    userLockoutConfig?: object;
}
/**
 * Check if a given object implements the AuthTuneConfigurationParametersRequest interface.
 */
export declare function instanceOfAuthTuneConfigurationParametersRequest(value: object): value is AuthTuneConfigurationParametersRequest;
export declare function AuthTuneConfigurationParametersRequestFromJSON(json: any): AuthTuneConfigurationParametersRequest;
export declare function AuthTuneConfigurationParametersRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): AuthTuneConfigurationParametersRequest;
export declare function AuthTuneConfigurationParametersRequestToJSON(json: any): AuthTuneConfigurationParametersRequest;
export declare function AuthTuneConfigurationParametersRequestToJSONTyped(value?: AuthTuneConfigurationParametersRequest | null, ignoreDiscriminator?: boolean): any;
