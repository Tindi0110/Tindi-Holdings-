import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type CorporateMetric =
  Database["public"]["Tables"]["corporate_metrics"]["Row"];
export type MetricHistory =
  Database["public"]["Tables"]["metric_history"]["Row"];
export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type SiteSetting = Database["public"]["Tables"]["site_settings"]["Row"];
export type EntityStatus = Database["public"]["Enums"]["entity_status"];
export type MetricClassification =
  Database["public"]["Enums"]["metric_classification"];
export type MetricVisibility = Database["public"]["Enums"]["metric_visibility"];

// -----------------------------------------------------------------------
// SITE SETTINGS
// -----------------------------------------------------------------------

/** Fetch all public site settings as a key-value map */
export async function getSiteSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .eq("is_public", true)
    .order("key");

  if (error) {
    console.error("[getSiteSettings]", error.message);
    return {};
  }

  return Object.fromEntries((data ?? []).map((s) => [s.key, s.value ?? ""]));
}

/** Fetch all settings (admin only — includes non-public) */
export async function getAllSiteSettings(): Promise<SiteSetting[]> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("key");

  if (error) {
    console.error("[getAllSiteSettings]", error.message);
    return [];
  }
  return data ?? [];
}

/** Update a site setting value */
export async function updateSiteSetting(
  key: string,
  value: string,
  adminId: string,
  adminName: string,
): Promise<void> {
  const { error } = await supabase
    .from("site_settings")
    .update({ value, updated_by: adminId, updated_at: new Date().toISOString() })
    .eq("key", key);

  if (error) throw new Error(`Failed to update setting '${key}': ${error.message}`);

  // Log the audit event
  await logAuditEvent({
    action: "UPDATE_SITE_SETTING",
    entity_type: "site_setting",
    entity_id: key,
    new_data: { key, value },
    performed_by: adminId,
    performed_by_name: adminName,
  });
}

// -----------------------------------------------------------------------
// CORPORATE METRICS
// -----------------------------------------------------------------------

/** Get all PUBLIC featured metrics for use on the homepage/public pages */
export async function getPublicMetrics(): Promise<CorporateMetric[]> {
  const { data, error } = await supabase
    .from("corporate_metrics")
    .select("*")
    .eq("visibility", "PUBLIC")
    .order("display_order");

  if (error) {
    console.error("[getPublicMetrics]", error.message);
    return [];
  }
  return data ?? [];
}

/** Get featured public metrics only (for homepage stats strip) */
export async function getFeaturedMetrics(): Promise<CorporateMetric[]> {
  const { data, error } = await supabase
    .from("corporate_metrics")
    .select("*")
    .eq("visibility", "PUBLIC")
    .eq("is_featured", true)
    .order("display_order");

  if (error) {
    console.error("[getFeaturedMetrics]", error.message);
    return [];
  }
  return data ?? [];
}

/** Get ALL metrics (admin use — includes non-public) */
export async function getAllMetrics(): Promise<CorporateMetric[]> {
  const { data, error } = await supabase
    .from("corporate_metrics")
    .select("*")
    .order("display_order");

  if (error) {
    console.error("[getAllMetrics]", error.message);
    return [];
  }
  return data ?? [];
}

/** Get metric history for a specific metric */
export async function getMetricHistory(metricId: string): Promise<MetricHistory[]> {
  const { data, error } = await supabase
    .from("metric_history")
    .select("*")
    .eq("metric_id", metricId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[getMetricHistory]", error.message);
    return [];
  }
  return data ?? [];
}

/** Update a metric value — automatically records history */
export async function updateMetricValue(params: {
  metricId: string;
  newValue: number | null;
  newDisplay: string | null;
  changeNote: string;
  adminId: string;
  adminName: string;
}): Promise<void> {
  const { metricId, newValue, newDisplay, changeNote, adminId, adminName } = params;

  // Fetch existing metric for history
  const { data: existing, error: fetchError } = await supabase
    .from("corporate_metrics")
    .select("current_value, current_display")
    .eq("id", metricId)
    .single();

  if (fetchError) throw new Error(`Metric not found: ${fetchError.message}`);

  // Update the metric
  const { error: updateError } = await supabase
    .from("corporate_metrics")
    .update({
      current_value: newValue,
      current_display: newDisplay,
      last_verified_at: new Date().toISOString(),
      last_verified_by: adminId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", metricId);

  if (updateError) throw new Error(`Failed to update metric: ${updateError.message}`);

  // Record history
  const { error: historyError } = await supabase.from("metric_history").insert({
    metric_id: metricId,
    old_value: existing.current_value,
    new_value: newValue,
    old_display: existing.current_display,
    new_display: newDisplay,
    change_note: changeNote,
    changed_by: adminId,
    changed_by_name: adminName,
    created_at: new Date().toISOString(),
  });

  if (historyError) console.error("[updateMetricValue history]", historyError.message);

  // Audit log
  await logAuditEvent({
    action: "UPDATE_METRIC",
    entity_type: "corporate_metric",
    entity_id: metricId,
    old_data: { value: existing.current_value, display: existing.current_display },
    new_data: { value: newValue, display: newDisplay, note: changeNote },
    performed_by: adminId,
    performed_by_name: adminName,
  });
}

/** Create a new corporate metric */
export async function createMetric(
  metric: Database["public"]["Tables"]["corporate_metrics"]["Insert"],
  adminId: string,
  adminName: string,
): Promise<CorporateMetric> {
  const { data, error } = await supabase
    .from("corporate_metrics")
    .insert(metric)
    .select()
    .single();

  if (error) throw new Error(`Failed to create metric: ${error.message}`);

  await logAuditEvent({
    action: "CREATE_METRIC",
    entity_type: "corporate_metric",
    entity_id: data.id,
    new_data: { name: data.name, slug: data.slug },
    performed_by: adminId,
    performed_by_name: adminName,
  });

  return data;
}

// -----------------------------------------------------------------------
// COMPANIES
// -----------------------------------------------------------------------

/** Get all public companies ordered by display_order */
export async function getPublicCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("is_public", true)
    .order("display_order");

  if (error) {
    console.error("[getPublicCompanies]", error.message);
    return [];
  }
  return data ?? [];
}

/** Get all companies (admin) */
export async function getAllCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("display_order");

  if (error) {
    console.error("[getAllCompanies]", error.message);
    return [];
  }
  return data ?? [];
}

/** Get a single company by slug */
export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (error) return null;
  return data;
}

/** Update a subsidiary's operational status and note */
export async function updateCompanyStatus(params: {
  companyId: string;
  status: EntityStatus;
  statusNote?: string;
  adminId: string;
  adminName: string;
}): Promise<void> {
  const { companyId, status, statusNote, adminId, adminName } = params;

  const { data: existing } = await supabase
    .from("companies")
    .select("status, status_note, name")
    .eq("id", companyId)
    .single();

  const { error } = await supabase
    .from("companies")
    .update({
      status,
      status_note: statusNote ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", companyId);

  if (error) throw new Error(`Failed to update subsidiary status: ${error.message}`);

  await logAuditEvent({
    action: "UPDATE_SUBSIDIARY_STATUS",
    entity_type: "company",
    entity_id: companyId,
    old_data: existing ?? {},
    new_data: { status, status_note: statusNote },
    performed_by: adminId,
    performed_by_name: adminName,
  });
}

/** Update full corporate metric details */
export async function updateMetricFull(params: {
  metricId: string;
  current_value: number | null;
  current_display: string | null;
  target_value: number | null;
  target_display: string | null;
  classification: MetricClassification;
  visibility: MetricVisibility;
  is_featured: boolean;
  changeNote?: string;
  adminId: string;
  adminName: string;
}): Promise<void> {
  const {
    metricId,
    current_value,
    current_display,
    target_value,
    target_display,
    classification,
    visibility,
    is_featured,
    changeNote = "Updated from Admin Panel",
    adminId,
    adminName,
  } = params;

  const { data: existing, error: fetchError } = await supabase
    .from("corporate_metrics")
    .select("*")
    .eq("id", metricId)
    .single();

  if (fetchError) throw new Error(`Metric not found: ${fetchError.message}`);

  const { error } = await supabase
    .from("corporate_metrics")
    .update({
      current_value,
      current_display,
      target_value,
      target_display,
      classification,
      visibility,
      is_featured,
      last_verified_at: new Date().toISOString(),
      last_verified_by: adminId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", metricId);

  if (error) throw new Error(`Failed to update metric: ${error.message}`);

  // Record history if value changed
  if (existing.current_value !== current_value || existing.current_display !== current_display) {
    await supabase.from("metric_history").insert({
      metric_id: metricId,
      old_value: existing.current_value,
      new_value: current_value,
      old_display: existing.current_display,
      new_display: current_display,
      change_note: changeNote,
      changed_by: adminId,
      changed_by_name: adminName,
      created_at: new Date().toISOString(),
    });
  }

  await logAuditEvent({
    action: "UPDATE_METRIC_FULL",
    entity_type: "corporate_metric",
    entity_id: metricId,
    old_data: existing,
    new_data: { current_value, target_value, classification, visibility, is_featured },
    performed_by: adminId,
    performed_by_name: adminName,
  });
}

// -----------------------------------------------------------------------
// AUDIT LOGS
// -----------------------------------------------------------------------

type AuditLogInsert = {
  action: string;
  entity_type?: string;
  entity_id?: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  performed_by?: string;
  performed_by_name?: string;
};

export async function logAuditEvent(params: AuditLogInsert): Promise<void> {
  const { error } = await supabase.from("audit_logs").insert({
    action: params.action,
    entity_type: params.entity_type ?? null,
    entity_id: params.entity_id ?? null,
    old_data: params.old_data ? (params.old_data as Record<string, unknown>) : null,
    new_data: params.new_data ? (params.new_data as Record<string, unknown>) : null,
    performed_by: params.performed_by ?? null,
    performed_by_name: params.performed_by_name ?? null,
    created_at: new Date().toISOString(),
  });

  if (error) {
    // Non-fatal — audit log failure should not break the main operation
    console.error("[logAuditEvent]", error.message);
  }
}

/** Get recent audit log entries (admin only) */
export async function getAuditLogs(limit = 50) {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getAuditLogs]", error.message);
    return [];
  }
  return data ?? [];
}

// -----------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------

/** Human-readable label for entity_status */
export function getStatusLabel(status: EntityStatus): string {
  const labels: Record<EntityStatus, string> = {
    PRE_LAUNCH: "Pre-Launch",
    ACTIVE: "Active",
    IN_DEVELOPMENT: "In Development",
    PILOT: "Pilot",
    PLANNED: "Planned",
    FUTURE: "Future Venture",
    PAUSED: "Paused",
    CLOSED: "Closed",
  };
  return labels[status] ?? status;
}

/** Human-readable label for metric_classification */
export function getClassificationLabel(
  classification: MetricClassification,
): string {
  const labels: Record<MetricClassification, string> = {
    VERIFIED: "Verified",
    PROJECTED: "Projected",
    TARGET: "Target",
    ESTIMATED: "Estimated",
    INTERNAL: "Internal",
  };
  return labels[classification] ?? classification;
}

/**
 * Format a metric for display on the public website.
 * Returns what should be shown to visitors — never fabricates data.
 */
export function formatMetricDisplay(metric: CorporateMetric): {
  primary: string;
  secondary: string | null;
  showTarget: boolean;
} {
  const hasCurrentValue =
    metric.current_value !== null && metric.current_value !== undefined;
  const hasDisplay = !!metric.current_display;

  // If there's an explicit display override (e.g. "Pre-launch"), use it
  if (hasDisplay && !hasCurrentValue) {
    return {
      primary: metric.current_display!,
      secondary: metric.target_display
        ? `Target: ${metric.target_display}`
        : null,
      showTarget: !!metric.target_display,
    };
  }

  // If there's a real current value, format it
  if (hasCurrentValue) {
    const formatted = `${metric.prefix ?? ""}${(metric.current_value ?? 0).toLocaleString()}${metric.suffix ?? ""}`;
    return {
      primary: formatted,
      secondary: metric.target_display
        ? `Target: ${metric.target_display}`
        : null,
      showTarget: !!metric.target_display,
    };
  }

  // Nothing verified — show "Pre-launch" safely
  return {
    primary: "Pre-launch",
    secondary: metric.target_display
      ? `Target: ${metric.target_display}`
      : null,
    showTarget: !!metric.target_display,
  };
}
