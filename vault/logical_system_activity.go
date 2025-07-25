// Copyright (c) HashiCorp, Inc.
// SPDX-License-Identifier: BUSL-1.1

package vault

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"path"
	"strings"
	"time"

	"github.com/hashicorp/go-secure-stdlib/parseutil"
	"github.com/hashicorp/vault/helper/namespace"
	"github.com/hashicorp/vault/helper/timeutil"
	"github.com/hashicorp/vault/sdk/framework"
	"github.com/hashicorp/vault/sdk/helper/errutil"
	"github.com/hashicorp/vault/sdk/logical"
)

// defaultToRetentionMonthsMaxWarning is a warning message for setting the max retention_months value when retention_months value is more than activityLogMaximumRetentionMonths
var defaultToRetentionMonthsMaxWarning = fmt.Sprintf("retention_months cannot be greater than %d; capped to %d.", activityLogMaximumRetentionMonths, activityLogMaximumRetentionMonths)

const (
	// WarningCurrentBillingPeriodDeprecated is a warning string that is used to indicate that the current_billing_period field, as the default start time will automatically be the billing period start date
	WarningCurrentBillingPeriodDeprecated = "current_billing_period is deprecated; unless otherwise specified, all requests will default to the current billing period"

	// WarningProvidedStartAndEndTimesIgnored is a warning string that is used to indicate that the provided start and end times by the user have been aligned to a billing period's start and end times
	WarningProvidedStartAndEndTimesIgnored = "start_time and end_time parameters can only be used to specify the beginning or end of the same billing period. The values provided for these parameters are not supported and are ignored. Showing the data for the entire billing period corresponding to start_time. If start_time is not provided, the billing period is determined based on the end_time."

	// WarningEndTimeAsCurrentMonthOrFutureIgnored is a warning string that is used to indicate the provided end time has been adjusted to the previous month if it was provided to be within the current month or in future date
	WarningEndTimeAsCurrentMonthOrFutureIgnored = "end_time parameter can only be used to specify a date until the end of previous month. The value provided for this parameter was in the current month or in the future date and was therefore ignored. The response includes data until the end of the previous month."

	// ErrWaitingForClientIDsToLoadToMemory is an error string that is used to indicate that the clientIDs are currently being loaded to memory which is needed to compute the actual values for new clients in the current month.
	ErrWaitingForClientIDsToLoadToMemory = "We are gathering the most up-to-date client usage information. Please try again later."

	// WarningCurrentMonthDataNotIncluded is a warning string that is used to indicate the the current month's data will be included in the next billing period, and not the current
	WarningCurrentMonthDataNotIncluded = "The current month's data will not be included in the current billing period client count as this month is outside of the 12 month billing period. This data will be included in the next billing period"
)

type StartEndTimesWarnings struct {
	TimesAlignedToBilling       bool
	EndTimeAdjustedToPastMonth  bool
	CurrentMonthDataNotIncluded bool
}

// activityQueryPath is available in every namespace
func (b *SystemBackend) activityQueryPath() *framework.Path {
	return &framework.Path{
		Pattern: "internal/counters/activity$",

		DisplayAttrs: &framework.DisplayAttributes{
			OperationPrefix: "internal-client-activity",
			OperationVerb:   "report",
			OperationSuffix: "counts",
		},

		Fields: map[string]*framework.FieldSchema{
			"current_billing_period": {
				Deprecated:  true,
				Type:        framework.TypeBool,
				Description: "Query utilization for configured billing period",
			},
			"start_time": {
				Type:        framework.TypeTime,
				Description: "Start of query interval",
			},
			"end_time": {
				Type:        framework.TypeTime,
				Description: "End of query interval",
			},
			"limit_namespaces": {
				Type:        framework.TypeInt,
				Default:     0,
				Description: "Limit query output by namespaces",
			},
		},
		HelpSynopsis:    strings.TrimSpace(sysHelp["activity-query"][0]),
		HelpDescription: strings.TrimSpace(sysHelp["activity-query"][1]),

		Operations: map[logical.Operation]framework.OperationHandler{
			logical.ReadOperation: &framework.PathOperation{
				Callback: b.handleClientMetricQuery,
				Summary:  "Report the client count metrics, for this namespace and all child namespaces.",
			},
		},
	}
}

// monthlyActivityCountPath is available in every namespace
func (b *SystemBackend) monthlyActivityCountPath() *framework.Path {
	return &framework.Path{
		Pattern: "internal/counters/activity/monthly$",

		DisplayAttrs: &framework.DisplayAttributes{
			OperationPrefix: "internal-client-activity",
			OperationVerb:   "report",
			OperationSuffix: "counts-this-month",
		},

		HelpSynopsis:    strings.TrimSpace(sysHelp["activity-monthly"][0]),
		HelpDescription: strings.TrimSpace(sysHelp["activity-monthly"][1]),
		Operations: map[logical.Operation]framework.OperationHandler{
			logical.ReadOperation: &framework.PathOperation{
				Callback: b.handleMonthlyActivityCount,
				Summary:  "Report the number of clients for this month, for this namespace and all child namespaces.",
			},
		},
	}
}

func (b *SystemBackend) activityPaths() []*framework.Path {
	return []*framework.Path{
		b.monthlyActivityCountPath(),
		b.activityQueryPath(),
		{
			Pattern: "internal/counters/activity/export$",

			DisplayAttrs: &framework.DisplayAttributes{
				OperationPrefix: "internal-client-activity",
				OperationVerb:   "export",
			},

			Fields: map[string]*framework.FieldSchema{
				"start_time": {
					Type:        framework.TypeTime,
					Description: "Start of query interval",
				},
				"end_time": {
					Type:        framework.TypeTime,
					Description: "End of query interval",
				},
				"format": {
					Type:        framework.TypeString,
					Description: "Format of the file. Either a CSV or a JSON file with an object per line.",
					Default:     "json",
				},
			},

			HelpSynopsis:    strings.TrimSpace(sysHelp["activity-export"][0]),
			HelpDescription: strings.TrimSpace(sysHelp["activity-export"][1]),

			Operations: map[logical.Operation]framework.OperationHandler{
				logical.ReadOperation: &framework.PathOperation{
					Callback: b.handleClientExport,
					Summary:  "Returns a deduplicated export of all clients that had activity within the provided start and end times for this namespace and all child namespaces.",
				},
			},
		},
	}
}

// rootActivityPaths are available only in the root namespace
func (b *SystemBackend) rootActivityPaths() []*framework.Path {
	paths := []*framework.Path{
		b.activityQueryPath(),
		b.monthlyActivityCountPath(),
		{
			Pattern: "internal/counters/config$",

			DisplayAttrs: &framework.DisplayAttributes{
				OperationPrefix: "internal-client-activity",
			},

			Fields: map[string]*framework.FieldSchema{
				"default_report_months": {
					Type:        framework.TypeInt,
					Default:     12,
					Description: "Number of months to report if no start date specified.",
					Deprecated:  true,
				},
				"retention_months": {
					Type:        framework.TypeInt,
					Default:     ActivityLogMinimumRetentionMonths,
					Description: "Number of months of client data to retain. Setting to 0 will clear all existing data.",
				},
				"enabled": {
					Type:        framework.TypeString,
					Default:     "default",
					Description: "Enable or disable collection of client count: enable, disable, or default.",
				},
			},
			HelpSynopsis:    strings.TrimSpace(sysHelp["activity-config"][0]),
			HelpDescription: strings.TrimSpace(sysHelp["activity-config"][1]),
			Operations: map[logical.Operation]framework.OperationHandler{
				logical.ReadOperation: &framework.PathOperation{
					Callback: b.handleActivityConfigRead,
					DisplayAttrs: &framework.DisplayAttributes{
						OperationVerb:   "read",
						OperationSuffix: "configuration",
					},
					Summary: "Read the client count tracking configuration.",
				},
				logical.UpdateOperation: &framework.PathOperation{
					Callback: b.handleActivityConfigUpdate,
					DisplayAttrs: &framework.DisplayAttributes{
						OperationVerb: "configure",
					},
					Summary: "Enable or disable collection of client count, set retention period, or set default reporting period.",
				},
			},
		},
		{
			Pattern: "internal/counters/activity/export$",

			DisplayAttrs: &framework.DisplayAttributes{
				OperationPrefix: "internal-client-activity",
				OperationVerb:   "export",
			},

			Fields: map[string]*framework.FieldSchema{
				"start_time": {
					Type:        framework.TypeTime,
					Description: "Start of query interval",
				},
				"end_time": {
					Type:        framework.TypeTime,
					Description: "End of query interval",
				},
				"format": {
					Type:        framework.TypeString,
					Description: "Format of the file. Either a CSV or a JSON file with an object per line.",
					Default:     "json",
				},
			},

			HelpSynopsis:    strings.TrimSpace(sysHelp["activity-export"][0]),
			HelpDescription: strings.TrimSpace(sysHelp["activity-export"][1]),

			Operations: map[logical.Operation]framework.OperationHandler{
				logical.ReadOperation: &framework.PathOperation{
					Callback: b.handleClientExport,
					Summary:  "Report the client count metrics, for this namespace and all child namespaces.",
				},
			},
		},
	}
	if writePath := b.activityWritePath(); writePath != nil {
		paths = append(paths, writePath)
	}
	return paths
}

func parseStartEndTimes(d *framework.FieldData, billingStartTime time.Time) (time.Time, time.Time, error) {
	startTime := d.Get("start_time").(time.Time)
	endTime := d.Get("end_time").(time.Time)

	// If a specific endTime is used, then respect that
	// otherwise we want to query up until the end of the current month.
	//
	// Also convert any user inputs to UTC to avoid
	// problems later.
	if endTime.IsZero() {
		endTime = time.Now().UTC()
	} else {
		endTime = endTime.UTC()
	}

	// If startTime is not specified, we would like to query
	// from the beginning of the billing period
	if startTime.IsZero() {
		startTime = billingStartTime
	} else {
		startTime = startTime.UTC()
	}
	if startTime.After(endTime) {
		return time.Time{}, time.Time{}, fmt.Errorf("start_time is later than end_time")
	}

	return startTime, endTime, nil
}

// This endpoint is not used by the UI. The UI's "export" feature is entirely client-side.
func (b *SystemBackend) handleClientExport(ctx context.Context, req *logical.Request, d *framework.FieldData) (*logical.Response, error) {
	b.Core.activityLogLock.RLock()
	a := b.Core.activityLog
	b.Core.activityLogLock.RUnlock()
	if a == nil {
		return logical.ErrorResponse("no activity log present"), nil
	}

	startTime, endTime, err := parseStartEndTimes(d, b.Core.BillingStart())
	if err != nil {
		return logical.ErrorResponse(err.Error()), nil
	}

	// This is to avoid the default 90s context timeout.
	timeout := 10 * time.Minute
	if durationRaw := os.Getenv("VAULT_ACTIVITY_EXPORT_DURATION"); durationRaw != "" {
		d, err := parseutil.ParseDurationSecond(durationRaw)
		if err == nil {
			timeout = d
		}
	}

	ns, err := namespace.FromContext(ctx)
	if err != nil {
		return nil, err
	}

	nsActiveContext := namespace.ContextWithNamespace(b.Core.activeContext, ns)
	runCtx, cancelFunc := context.WithTimeout(nsActiveContext, timeout)
	defer cancelFunc()

	err = a.writeExport(runCtx, req.ResponseWriter, d.Get("format").(string), startTime, endTime)
	if err != nil {
		if errors.Is(err, ErrActivityExportInProgress) || strings.HasPrefix(err.Error(), ActivityExportInvalidFormatPrefix) {
			return logical.ErrorResponse(err.Error()), nil
		} else {
			return nil, err
		}
	}

	// default status to 204, this will get rewritten to 200 later if the export writes data to req.ResponseWriter
	respNoContent, err := logical.RespondWithStatusCode(&logical.Response{}, req, http.StatusNoContent)
	return respNoContent, err
}

func (b *SystemBackend) handleClientMetricQuery(ctx context.Context, req *logical.Request, d *framework.FieldData) (*logical.Response, error) {
	b.Core.activityLogLock.RLock()
	a := b.Core.activityLog
	b.Core.activityLogLock.RUnlock()
	if a == nil {
		return logical.ErrorResponse("no activity log present"), nil
	}

	warnings := make([]string, 0)

	if _, ok := d.GetOk("current_billing_period"); ok {
		warnings = append(warnings, WarningCurrentBillingPeriodDeprecated)
	}

	var err error
	var timeWarnings StartEndTimesWarnings
	now := time.Now()
	startTime, endTime, timeWarnings, err := getStartEndTime(d, now, b.Core.BillingStart())
	if err != nil {
		return logical.ErrorResponse(err.Error()), nil
	}

	var limitNamespaces int
	if limitNamespacesRaw, ok := d.GetOk("limit_namespaces"); ok {
		limitNamespaces = limitNamespacesRaw.(int)
	}

	// if end time is in the current month and the clientIDs are still being loaded to memory, return an error
	// this will not block on CE as endtime cannot be in the current month
	if !a.GetClientIDsUsageInfoLoaded() && timeutil.EndOfMonth(endTime).Equal(timeutil.EndOfMonth(now.UTC())) {
		return nil, errutil.InternalError{Err: ErrWaitingForClientIDsToLoadToMemory}
	}

	results, err := a.handleQuery(ctx, startTime, endTime, limitNamespaces)
	if err != nil {
		return nil, err
	}
	if results == nil {
		resp204, err := logical.RespondWithStatusCode(&logical.Response{
			Warnings: warnings,
		}, req, http.StatusNoContent)
		return resp204, err
	}

	if timeWarnings.EndTimeAdjustedToPastMonth {
		warnings = append(warnings, WarningEndTimeAsCurrentMonthOrFutureIgnored)
	}
	if timeWarnings.TimesAlignedToBilling {
		warnings = append(warnings, WarningProvidedStartAndEndTimesIgnored)
	}
	if timeWarnings.CurrentMonthDataNotIncluded {
		warnings = append(warnings, WarningCurrentMonthDataNotIncluded)
	}

	return &logical.Response{
		Warnings: warnings,
		Data:     results,
	}, nil
}

func (b *SystemBackend) handleMonthlyActivityCount(ctx context.Context, req *logical.Request, d *framework.FieldData) (*logical.Response, error) {
	b.Core.activityLogLock.RLock()
	a := b.Core.activityLog
	b.Core.activityLogLock.RUnlock()
	if a == nil {
		return logical.ErrorResponse("no activity log present"), nil
	}

	results, err := a.partialMonthClientCount(ctx)
	if err != nil {
		return nil, err
	}
	if results == nil {
		return logical.RespondWithStatusCode(nil, req, http.StatusNoContent)
	}

	return &logical.Response{
		Data: results,
	}, nil
}

func (b *SystemBackend) handleActivityConfigRead(ctx context.Context, req *logical.Request, d *framework.FieldData) (*logical.Response, error) {
	b.Core.activityLogLock.RLock()
	a := b.Core.activityLog
	b.Core.activityLogLock.RUnlock()
	if a == nil {
		return logical.ErrorResponse("no activity log present"), nil
	}

	config, err := a.loadConfigOrDefault(ctx)
	if err != nil {
		return nil, err
	}

	qa, err := a.queriesAvailable(ctx)
	if err != nil {
		return nil, err
	}

	if config.Enabled == "default" {
		config.Enabled = activityLogEnabledDefaultValue
	}

	return &logical.Response{
		Data: map[string]interface{}{
			"retention_months":         config.RetentionMonths,
			"enabled":                  config.Enabled,
			"queries_available":        qa,
			"reporting_enabled":        b.Core.AutomatedLicenseReportingEnabled(),
			"billing_start_timestamp":  b.Core.BillingStart(),
			"minimum_retention_months": a.configOverrides.MinimumRetentionMonths,
		},
	}, nil
}

func (b *SystemBackend) handleActivityConfigUpdate(ctx context.Context, req *logical.Request, d *framework.FieldData) (*logical.Response, error) {
	b.Core.activityLogLock.RLock()
	a := b.Core.activityLog
	b.Core.activityLogLock.RUnlock()
	if a == nil {
		return logical.ErrorResponse("no activity log present"), nil
	}

	warnings := make([]string, 0)

	config, err := a.loadConfigOrDefault(ctx)
	if err != nil {
		return nil, err
	}

	prevRetentionMonths := config.RetentionMonths

	{
		// Parse the default report months
		if _, ok := d.GetOk("default_report_months"); ok {
			warnings = append(warnings, fmt.Sprintf("default_report_months is deprecated: defaulting to billing start time"))
		}

		if config.DefaultReportMonths <= 0 {
			return logical.ErrorResponse("default_report_months must be greater than 0"), logical.ErrInvalidRequest
		}
	}

	{
		// Parse the retention months
		// For CE, this value can be between 0 and 60
		// When reporting is enabled, this value can be between 48 and 60
		if retentionMonthsRaw, ok := d.GetOk("retention_months"); ok {
			config.RetentionMonths = retentionMonthsRaw.(int)
		}

		if config.RetentionMonths < 0 {
			return logical.ErrorResponse("retention_months must be greater than or equal to 0"), logical.ErrInvalidRequest
		}

		if config.RetentionMonths > activityLogMaximumRetentionMonths {
			config.RetentionMonths = activityLogMaximumRetentionMonths
			warnings = append(warnings, defaultToRetentionMonthsMaxWarning)
		}
	}

	{
		// Parse the enabled setting
		if enabledRaw, ok := d.GetOk("enabled"); ok {
			enabledStr := enabledRaw.(string)

			// If we switch from enabled to disabled, then we return a warning to the client.
			// We have to keep the default state of activity log enabled in mind
			if config.Enabled == "enable" && enabledStr == "disable" ||
				!activityLogEnabledDefault && config.Enabled == "enable" && enabledStr == "default" ||
				activityLogEnabledDefault && config.Enabled == "default" && enabledStr == "disable" {

				// if reporting is enabled, the activity log cannot be disabled. Manual Reporting is always enabled on ent.
				if a.core.ManualLicenseReportingEnabled() {
					return logical.ErrorResponse("cannot disable the activity log while Reporting is enabled"), logical.ErrInvalidRequest
				}
				warnings = append(warnings, "the current monthly segment will be deleted because the activity log was disabled")
			}

			switch enabledStr {
			case "default", "enable", "disable":
				config.Enabled = enabledStr
			default:
				return logical.ErrorResponse("enabled must be one of \"default\", \"enable\", \"disable\""), logical.ErrInvalidRequest
			}
		}
	}

	enabled := config.Enabled == "enable"
	if !enabled && config.Enabled == "default" {
		enabled = activityLogEnabledDefault
	}

	if enabled && config.RetentionMonths == 0 {
		return logical.ErrorResponse("retention_months cannot be 0 while enabled"), logical.ErrInvalidRequest
	}

	// if manual license reporting is enabled, retention months must at least be 48 months
	if a.core.ManualLicenseReportingEnabled() && config.RetentionMonths < ActivityLogMinimumRetentionMonths {
		return logical.ErrorResponse("retention_months must be at least %d while Reporting is enabled", ActivityLogMinimumRetentionMonths), logical.ErrInvalidRequest
	}

	// Store the config
	entry, err := logical.StorageEntryJSON(path.Join(activitySubPath, activityConfigKey), config)
	if err != nil {
		return nil, err
	}
	if err := req.Storage.Put(ctx, entry); err != nil {
		return nil, err
	}

	// Set the new config on the activity log
	a.SetConfig(ctx, config)

	// Update Census agent's metadata if retention months change
	if prevRetentionMonths != config.RetentionMonths {
		if err := b.Core.SetRetentionMonths(config.RetentionMonths); err != nil {
			return nil, err
		}
	}

	if len(warnings) > 0 {
		return &logical.Response{
			Warnings: warnings,
		}, nil
	}

	return nil, nil
}
