/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { service } from '@ember/service';
import Route from '@ember/routing/route';
import { action } from '@ember/object';

import config from 'vault/config/environment';

import ControlGroupError from 'vault/lib/control-group-error';

export default class ApplicationRoute extends Route {
  @service analytics;
  @service controlGroup;
  @service('router') routing;
  @service('namespace') namespaceService;
  @service('flags') flagsService;

  @action
  willTransition() {
    window.scrollTo(0, 0);
  }
  @action
  error(error, transition) {
    const controlGroup = this.controlGroup;
    if (error instanceof ControlGroupError) {
      return controlGroup.handleError(error);
    }
    if (error.path === '/v1/sys/wrapping/unwrap') {
      controlGroup.unmarkTokenForUnwrap();
    }

    const router = this.routing;
    //FIXME transition.intent likely needs to be replaced
    let errorURL = transition.intent.url;
    const { name, contexts, queryParams } = transition.intent;

    // If the transition is internal to Ember, we need to generate the URL
    // from the route parameters ourselves
    if (!errorURL) {
      try {
        errorURL = router.urlFor(name, ...(contexts || []), { queryParams });
      } catch (e) {
        // If this fails, something weird is happening with URL transitions
        errorURL = null;
      }
    }
    // because we're using rootURL, we need to trim this from the front to get
    // the ember-routeable url
    if (errorURL) {
      errorURL = errorURL.replace('/ui', '');
    }

    error.errorURL = errorURL;

    // if we have queryParams, update the namespace so that the observer can fire on the controller
    if (queryParams) {
      /* eslint-disable-next-line ember/no-controller-access-in-routes */
      this.controllerFor('vault.cluster').set('namespaceQueryParam', queryParams.namespace || '');
    }

    // Assuming we have a URL, push it into browser history and update the
    // location bar for the user
    if (errorURL) {
      router.location.setURL(errorURL);
    }

    return true;
  }

  beforeModel() {
    return this.flagsService.fetchFeatureFlags();
  }

  afterModel() {
    const { environment, APP } = config;
    const { ANALYTICS_CONFIG } = APP;

    // if the app is built for dev  -> attempt to start the analytics service based on the config setting
    // if the app is built for prod -> attempt to start the analytics service based on the config setting AND HVD ownership
    // if the app is built for test -> don't start the analytics service
    if (environment === 'development') {
      this.analytics.start('posthog', ANALYTICS_CONFIG);
    } else if (environment === 'production' && this.flagsService.isHvdManaged) {
      this.analytics.start('posthog', ANALYTICS_CONFIG);
    }
  }
}
