/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import WifConfigForm from './wif-config';
import FormField from 'vault/utils/forms/field';
import FormFieldGroup from 'vault/utils/forms/field-group';

import type { AzureConfigFormData } from 'vault/vault/secrets/engine';

export default class AzureConfigForm extends WifConfigForm<AzureConfigFormData> {
  // the "clientSecret" param is not checked because it's never returned by the API.
  // thus we can never say for sure if the account accessType has been configured so we always return false
  isAccountPluginConfigured = false;

  get isWifPluginConfigured() {
    const { identity_token_audience, identity_token_ttl } = this.data;
    return !!identity_token_audience || !!identity_token_ttl;
  }

  accountFields = [
    new FormField('subscription_id', 'string', { label: 'Subscription ID' }),
    new FormField('tenant_id', 'string', { label: 'Tenant ID' }),
    new FormField('client_id', 'string', { label: 'Client ID' }),
    new FormField('client_secret', 'string', { sensitive: true }),
  ];

  optionFields = [
    new FormField('environment', 'string', {
      subText:
        'This value can also be provided with the AZURE_ENVIRONMENT environment variable. If not specified, Vault will use Azure Public Cloud.',
    }),
    new FormField('root_password_ttl', 'string', {
      label: 'Root password TTL',
      editType: 'ttl',
      // default is 15768000 sec. The api docs say 182 days, but this should be updated to 182.5 days.
      helperTextDisabled: 'Vault will use the default of 182 days.',
      helperTextEnabled:
        'Specifies how long the root password is valid for in Azure when rotate-root generates a new client secret.',
    }),
  ];

  wifFields = [
    this.commonWifFields.issuer,
    this.accountFields[0] as FormField,
    this.accountFields[1] as FormField,
    this.accountFields[2] as FormField,
    this.commonWifFields.identity_token_audience,
    this.commonWifFields.identity_token_ttl,
  ];

  get formFieldGroups() {
    const defaultFields = this.accessType === 'account' ? this.accountFields : this.wifFields;
    return [
      new FormFieldGroup('default', defaultFields),
      new FormFieldGroup('More options', this.optionFields),
    ];
  }
}
