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
 * @interface AppRoleReadRoleResponse
 */
export interface AppRoleReadRoleResponse {
    /**
     * Impose secret ID to be presented when logging in using this role.
     * @type {boolean}
     * @memberof AppRoleReadRoleResponse
     */
    bindSecretId?: boolean;
    /**
     * If true, the secret identifiers generated using this role will be cluster local. This can only be set during role creation and once set, it can't be reset later
     * @type {boolean}
     * @memberof AppRoleReadRoleResponse
     */
    localSecretIds?: boolean;
    /**
     * Use "token_period" instead. If this and "token_period" are both specified, only "token_period" will be used.
     * @type {number}
     * @memberof AppRoleReadRoleResponse
     * @deprecated
     */
    period?: number;
    /**
     * Use "token_policies" instead. If this and "token_policies" are both specified, only "token_policies" will be used.
     * @type {Array<string>}
     * @memberof AppRoleReadRoleResponse
     * @deprecated
     */
    policies?: Array<string>;
    /**
     * Comma separated string or list of CIDR blocks. If set, specifies the blocks of IP addresses which can perform the login operation.
     * @type {Array<string>}
     * @memberof AppRoleReadRoleResponse
     */
    secretIdBoundCidrs?: Array<string>;
    /**
     * Number of times a secret ID can access the role, after which the secret ID will expire.
     * @type {number}
     * @memberof AppRoleReadRoleResponse
     */
    secretIdNumUses?: number;
    /**
     * Duration in seconds after which the issued secret ID expires.
     * @type {number}
     * @memberof AppRoleReadRoleResponse
     */
    secretIdTtl?: number;
    /**
     * Comma separated string or JSON list of CIDR blocks. If set, specifies the blocks of IP addresses which are allowed to use the generated token.
     * @type {Array<string>}
     * @memberof AppRoleReadRoleResponse
     */
    tokenBoundCidrs?: Array<string>;
    /**
     * If set, tokens created via this role carry an explicit maximum TTL. During renewal, the current maximum TTL values of the role and the mount are not checked for changes, and any updates to these values will have no effect on the token being renewed.
     * @type {number}
     * @memberof AppRoleReadRoleResponse
     */
    tokenExplicitMaxTtl?: number;
    /**
     * The maximum lifetime of the generated token
     * @type {number}
     * @memberof AppRoleReadRoleResponse
     */
    tokenMaxTtl?: number;
    /**
     * If true, the 'default' policy will not automatically be added to generated tokens
     * @type {boolean}
     * @memberof AppRoleReadRoleResponse
     */
    tokenNoDefaultPolicy?: boolean;
    /**
     * The maximum number of times a token may be used, a value of zero means unlimited
     * @type {number}
     * @memberof AppRoleReadRoleResponse
     */
    tokenNumUses?: number;
    /**
     * If set, tokens created via this role will have no max lifetime; instead, their renewal period will be fixed to this value.
     * @type {number}
     * @memberof AppRoleReadRoleResponse
     */
    tokenPeriod?: number;
    /**
     * Comma-separated list of policies
     * @type {Array<string>}
     * @memberof AppRoleReadRoleResponse
     */
    tokenPolicies?: Array<string>;
    /**
     * The initial ttl of the token to generate
     * @type {number}
     * @memberof AppRoleReadRoleResponse
     */
    tokenTtl?: number;
    /**
     * The type of token to generate, service or batch
     * @type {string}
     * @memberof AppRoleReadRoleResponse
     */
    tokenType?: string;
}
/**
 * Check if a given object implements the AppRoleReadRoleResponse interface.
 */
export declare function instanceOfAppRoleReadRoleResponse(value: object): value is AppRoleReadRoleResponse;
export declare function AppRoleReadRoleResponseFromJSON(json: any): AppRoleReadRoleResponse;
export declare function AppRoleReadRoleResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): AppRoleReadRoleResponse;
export declare function AppRoleReadRoleResponseToJSON(json: any): AppRoleReadRoleResponse;
export declare function AppRoleReadRoleResponseToJSONTyped(value?: AppRoleReadRoleResponse | null, ignoreDiscriminator?: boolean): any;
