/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import AdapterError from '@ember-data/adapter/error';
import { set } from '@ember/object';
import ApplicationAdapter from './application';
import { encodePath } from 'vault/utils/path-encoding-helpers';

export default ApplicationAdapter.extend({
  url(path) {
    const url = `${this.buildURL()}/auth`;
    return path ? url + '/' + encodePath(path) : url;
  },

  // used in updateRecord
  pathForType() {
    return 'mounts/auth';
  },

  findAll(store, type, sinceToken, snapshotRecordArray) {
    const isUnauthenticated = snapshotRecordArray?.adapterOptions?.unauthenticated;
    // sys/internal/ui/mounts returns the actual value of the system TTL
    // instead of '0' which just indicates the mount is using system defaults
    if (isUnauthenticated) {
      const url = `/${this.urlPrefix()}/internal/ui/mounts`;
      return this.ajax(url, 'GET', {
        unauthenticated: true,
      })
        .then((result) => {
          return {
            data: result.data.auth,
          };
        })
        .catch(() => {
          return { data: {} };
        });
    }
    // if authenticated, findAll will use GET sys/auth instead
    return this.ajax(this.url(), 'GET').catch((e) => {
      if (e instanceof AdapterError) {
        set(e, 'policyPath', 'sys/auth');
      }
      throw e;
    });
  },

  // findAll makes a network request and supplements the ember-data store with what the API returns.
  // after upgrading to ember-data 5.3.2 the store was becoming cluttered with outdated records, so
  // use query to refresh the store with each request. this is ideal for list views
  query() {
    const url = `/${this.urlPrefix()}/internal/ui/mounts`;
    return this.ajax(url, 'GET')
      .then((result) => {
        return {
          data: result.data.auth,
        };
      })
      .catch((e) => {
        if (e instanceof AdapterError) {
          set(e, 'policyPath', 'sys/internal/ui/mounts');
        }
        throw e;
      });
  },

  createRecord(store, type, snapshot) {
    const serializer = store.serializerFor(type.modelName);
    const data = serializer.serialize(snapshot);
    const path = snapshot.attr('path');

    return this.ajax(this.url(path), 'POST', { data }).then(() => {
      // ember data doesn't like 204s if it's not a DELETE
      data.config.id = path; // config relationship needs an id so use path for now
      return {
        data: { ...data, path: path + '/', id: path },
      };
    });
  },

  urlForDeleteRecord(id, modelName, snapshot) {
    return this.url(snapshot.id);
  },

  tune(path, data) {
    const url = `${this.buildURL()}/${this.pathForType()}/${encodePath(path)}tune`;
    return this.ajax(url, 'POST', { data });
  },

  resetPassword(backend, username, password) {
    // For userpass auth types only
    const url = `/v1/auth/${encodePath(backend)}/users/${encodePath(username)}/password`;
    return this.ajax(url, 'POST', { data: { password } });
  },
});
