/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { service } from '@ember/service';
import { or } from '@ember/object/computed';
import { isBlank } from '@ember/utils';
import Component from '@ember/component';
import { task, waitForEvent } from 'ember-concurrency';
import { set } from '@ember/object';

import FocusOnInsertMixin from 'vault/mixins/focus-on-insert';
import keys from 'core/utils/keys';

const LIST_ROOT_ROUTE = 'vault.cluster.secrets.backend.list-root';
const SHOW_ROUTE = 'vault.cluster.secrets.backend.show';

export default Component.extend(FocusOnInsertMixin, {
  router: service(),
  mode: null,
  onDataChange() {},
  onRefresh() {},
  key: null,
  errorMessage: '',
  autoRotateInvalid: false,
  requestInFlight: or('key.isLoading', 'key.isReloading', 'key.isSaving'),

  willDestroyElement() {
    if (this.key && this.key.isError && !this.key.isDestroyed && !this.key.isDestroying) {
      this.key.rollbackAttributes();
    }
    this._super(...arguments);
  },

  get breadcrumbs() {
    const baseCrumbs = [
      {
        label: 'Secrets',
        route: 'vault.cluster.secrets',
      },
      {
        label: this.key.backend,
        route: 'vault.cluster.secrets.backend.list-root',
        model: this.key.backend,
      },
    ];
    if (this.mode === 'show') {
      return [
        ...baseCrumbs,
        {
          label: this.key.id,
        },
      ];
    } else if (this.mode === 'edit') {
      return [
        ...baseCrumbs,
        {
          label: this.key.id,
          route: 'vault.cluster.secrets.backend.show',
          models: [this.key.backend, this.key.id],
          query: { tab: 'details' },
        },
        { label: 'Edit' },
      ];
    } else if (this.mode === 'create') {
      return [...baseCrumbs, { label: 'Create' }];
    }
    return baseCrumbs;
  },

  waitForKeyUp: task(function* () {
    while (true) {
      const event = yield waitForEvent(document.body, 'keyup');
      this.onEscape(event);
    }
  })
    .on('didInsertElement')
    .cancelOn('willDestroyElement'),

  transitionToRoute() {
    this.router.transitionTo(...arguments);
  },

  onEscape(e) {
    const isEscKeyPressed = keys.ESC.includes(e.key);
    if (isEscKeyPressed || this.mode !== 'show') {
      return;
    }
    this.transitionToRoute(LIST_ROOT_ROUTE);
  },

  hasDataChanges() {
    this.onDataChange(this.key.hasDirtyAttributes);
  },

  persistKey(method, successCallback) {
    const key = this.key;
    return key[method]().then(() => {
      if (!key.isError) {
        successCallback(key);
      }
    });
  },

  actions: {
    createOrUpdateKey(type, event) {
      event.preventDefault();
      // reset error message
      set(this, 'errorMessage', '');

      const keyId = this.key.id || this.key.name;

      if (type === 'create' && isBlank(keyId)) {
        // manually set error message
        set(this, 'errorMessage', 'Name is required.');
        return;
      }

      this.persistKey(
        'save',
        () => {
          this.hasDataChanges();
          this.transitionToRoute(SHOW_ROUTE, keyId, { queryParams: { tab: 'details' } });
        },
        type === 'create'
      );
    },

    setValueOnKey(key, event) {
      set(this.key, key, event.target.checked);
    },

    handleAutoRotateChange(ttlObj) {
      if (ttlObj.enabled) {
        set(this.key, 'autoRotatePeriod', ttlObj.goSafeTimeString);
        this.set('autoRotateInvalid', ttlObj.seconds < 3600);
      } else {
        set(this.key, 'autoRotatePeriod', 0);
      }
    },

    derivedChange(val) {
      this.key.setDerived(val);
    },

    convergentEncryptionChange(val) {
      this.key.setConvergentEncryption(val);
    },

    refresh() {
      this.onRefresh();
    },

    deleteKey() {
      this.persistKey('destroyRecord', () => {
        this.hasDataChanges();
        this.transitionToRoute(LIST_ROOT_ROUTE);
      });
    },
  },
});
