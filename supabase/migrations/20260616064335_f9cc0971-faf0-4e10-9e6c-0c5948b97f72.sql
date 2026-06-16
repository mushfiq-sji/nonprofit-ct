
-- Enable extensions for cron + http
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ─────────────────────────────────────────────────────────────
-- sync_client_kb_reports() — verbatim copy from SJ Control Tower
-- References projects.project_type, project_milestones, project_monthly_hours,
-- activecollab_tasks, knowledge_base_categories, knowledge_files —
-- none of which exist in this project. Will error at runtime.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_client_kb_reports()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  cat RECORD;
  proj RECORD;
  ms_row RECORD;
  hr_row RECORD;
  task_row RECORD;
  report TEXT;
  v_total_contract NUMERIC;
  v_paid_amount NUMERIC;
  v_pending_amount NUMERIC;
  v_total_hours NUMERIC;
  project_ids UUID[];
  client_search1 TEXT;
  client_search2 TEXT;
  today TEXT := to_char(NOW(), 'YYYY-MM-DD');
  source_uuid UUID := '050cf6c0-b101-4dd0-a845-18542616eb20';
  v_file_slug TEXT;
  v_file_name TEXT;
  v_title TEXT;
  proj_count INT;
BEGIN
  INSERT INTO knowledge_base_categories (id, name, description, collection_name, parent_id, is_active, created_at, updated_at)
  SELECT
    gen_random_uuid(),
    client_label,
    'Client intelligence and project documents for ' || client_label,
    'client_' || replace(gen_random_uuid()::text, '-', ''),
    'a1ccc2d3-2c7e-45ab-a537-6862559ac95c'::uuid,
    true, NOW(), NOW()
  FROM (
    SELECT DISTINCT COALESCE(client_name, client) AS client_label
    FROM projects
    WHERE deleted_at IS NULL
      AND status IN ('active', 'on-hold', 'completed')
      AND COALESCE(client_name, client) IS NOT NULL
      AND COALESCE(client_name, client) NOT ILIKE '%sj innovation%'
      AND COALESCE(client_name, client) NOT ILIKE '%shahed%'
      AND COALESCE(client_name, client) NOT ILIKE '%internal%'
  ) new_clients
  WHERE NOT EXISTS (
    SELECT 1 FROM knowledge_base_categories kbc
    WHERE kbc.parent_id = 'a1ccc2d3-2c7e-45ab-a537-6862559ac95c'
      AND kbc.is_active = true
      AND (
        kbc.name ILIKE '%' || new_clients.client_label || '%'
        OR new_clients.client_label ILIKE '%' || SPLIT_PART(kbc.name, '|', 1) || '%'
        OR new_clients.client_label ILIKE '%' || TRIM(SPLIT_PART(kbc.name, '|', 2)) || '%'
      )
  );

  FOR cat IN
    SELECT id, name,
      TRIM(REPLACE(REPLACE(name, '- Project Documents', ''), '- Client Documents', '')) AS client_name
    FROM knowledge_base_categories
    WHERE parent_id = 'a1ccc2d3-2c7e-45ab-a537-6862559ac95c'
      AND is_active = true
    ORDER BY name
  LOOP
    client_search1 := TRIM(SPLIT_PART(cat.client_name, '|', 1));
    client_search2 := TRIM(SPLIT_PART(cat.client_name, '|', 2));

    SELECT ARRAY_AGG(DISTINCT id) INTO project_ids
    FROM projects
    WHERE deleted_at IS NULL
      AND status IN ('active', 'on-hold', 'completed')
      AND (
        client ILIKE '%' || client_search1 || '%'
        OR client_name ILIKE '%' || client_search1 || '%'
        OR name ILIKE '%' || client_search1 || '%'
        OR (client_search2 <> '' AND (
          client ILIKE '%' || client_search2 || '%'
          OR client_name ILIKE '%' || client_search2 || '%'
          OR name ILIKE '%' || client_search2 || '%'
        ))
      );

    proj_count := COALESCE(array_length(project_ids, 1), 0);

    SELECT
      COALESCE(SUM(amount::numeric), 0),
      COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN amount::numeric ELSE 0 END), 0)
    INTO v_total_contract, v_paid_amount
    FROM project_milestones WHERE project_id = ANY(project_ids);

    v_pending_amount := COALESCE(v_total_contract, 0) - COALESCE(v_paid_amount, 0);

    SELECT COALESCE(SUM(billable_hours), 0) INTO v_total_hours
    FROM project_monthly_hours WHERE project_id = ANY(project_ids);

    report := '# ' || cat.client_name || ' — Client Intelligence Report' || E'\n';
    report := report || '*Auto-generated from Control Tower · Refreshed: ' || today || '*' || E'\n\n---\n\n';
    report := report || '## Client Overview' || E'\n\n';
    report := report || '| Field | Value |' || E'\n|---|---|\n';
    report := report || '| **Active Projects** | ' || proj_count || ' |' || E'\n';
    report := report || '| **Total Contract Value** | $' || TO_CHAR(COALESCE(v_total_contract,0), 'FM999,999,990.00') || ' |' || E'\n';
    report := report || '| **Collected** | $' || TO_CHAR(COALESCE(v_paid_amount,0), 'FM999,999,990.00') || ' ✅ |' || E'\n';
    report := report || '| **Outstanding** | $' || TO_CHAR(COALESCE(v_pending_amount,0), 'FM999,999,990.00') || ' ⏳ |' || E'\n';
    report := report || '| **Total Billable Hours** | ' || TO_CHAR(COALESCE(v_total_hours,0), 'FM999,990.1') || 'h |' || E'\n\n';

    IF proj_count = 0 THEN
      report := report || '*No matching projects found in Control Tower.*' || E'\n\n';
    ELSE
      report := report || '## Active Projects' || E'\n\n';
      FOR proj IN
        SELECT id, name, status, progress, project_type, start_date, end_date, budget::numeric as proj_budget, manager
        FROM projects WHERE id = ANY(project_ids) ORDER BY name
      LOOP
        report := report || '### ' || proj.name || E'\n';
        report := report || '- **Status:** ' || COALESCE(proj.status,'—') || ' | **Progress:** ' || COALESCE(proj.progress::text,'0') || '% | **Type:** ' || COALESCE(proj.project_type,'—') || E'\n';
        report := report || '- **Timeline:** ' || COALESCE(TO_CHAR(proj.start_date,'Mon DD, YYYY'),'—') || ' → ' || COALESCE(TO_CHAR(proj.end_date,'Mon DD, YYYY'),'—') || E'\n';
        IF proj.proj_budget IS NOT NULL THEN report := report || '- **Budget:** $' || TO_CHAR(proj.proj_budget,'FM999,999,990.00') || E'\n'; END IF;
        IF proj.manager IS NOT NULL THEN report := report || '- **Project Manager:** ' || proj.manager || E'\n'; END IF;
        report := report || E'\n';
      END LOOP;

      IF EXISTS (SELECT 1 FROM project_milestones WHERE project_id = ANY(project_ids)) THEN
        report := report || '## Milestones & Billing' || E'\n\n';
        report := report || '| Milestone | Amount | Payment Status | Target Date |' || E'\n|---|---|---|---|\n';
        FOR ms_row IN SELECT name, amount, payment_status, target_date FROM project_milestones WHERE project_id = ANY(project_ids) ORDER BY target_date NULLS LAST LOOP
          report := report || '| ' || REPLACE(LEFT(COALESCE(ms_row.name,'—'),60),'|','/')
                           || ' | $' || TO_CHAR(COALESCE(ms_row.amount::numeric,0),'FM999,999,990.00')
                           || ' | ' || CASE ms_row.payment_status WHEN 'paid' THEN '✅ Paid' WHEN 'in_progress' THEN '🔄 In Progress' ELSE '⏳ Pending' END
                           || ' | ' || COALESCE(TO_CHAR(ms_row.target_date,'Mon DD, YYYY'),'—') || ' |' || E'\n';
        END LOOP;
        report := report || E'\n';
      END IF;

      IF EXISTS (SELECT 1 FROM project_monthly_hours pmh WHERE pmh.project_id = ANY(project_ids) AND COALESCE(pmh.total_hours,0) > 0) THEN
        report := report || '## Hours Logged' || E'\n\n';
        report := report || '| Month | Total Hours | Billable Hours |' || E'\n|---|---|---|\n';
        FOR hr_row IN SELECT pmh.month AS h_month, pmh.total_hours AS h_total, pmh.billable_hours AS h_billable FROM project_monthly_hours pmh WHERE pmh.project_id = ANY(project_ids) AND COALESCE(pmh.total_hours,0) > 0 ORDER BY pmh.month DESC LIMIT 12 LOOP
          report := report || '| ' || TO_CHAR(hr_row.h_month,'Mon YYYY') || ' | ' || TO_CHAR(COALESCE(hr_row.h_total,0),'FM9990.1') || 'h | ' || TO_CHAR(COALESCE(hr_row.h_billable,0),'FM9990.1') || 'h |' || E'\n';
        END LOOP;
        report := report || E'\n';
      END IF;

      IF EXISTS (SELECT 1 FROM activecollab_tasks act WHERE act.project_id = ANY(project_ids) AND act.status != 'completed') THEN
        report := report || '## Open Tasks' || E'\n\n';
        report := report || '| Task | Assignee | Status | Due Date |' || E'\n|---|---|---|---|\n';
        FOR task_row IN SELECT act.task_name AS t_name, act.assignee_name AS t_assignee, act.status AS t_status, act.due_date AS t_due FROM activecollab_tasks act WHERE act.project_id = ANY(project_ids) AND act.status != 'completed' ORDER BY act.due_date NULLS LAST LIMIT 15 LOOP
          report := report || '| ' || REPLACE(LEFT(COALESCE(task_row.t_name,'—'),70),'|','/') || ' | ' || COALESCE(task_row.t_assignee,'Unassigned') || ' | ' || COALESCE(task_row.t_status,'—') || ' | ' || COALESCE(TO_CHAR(task_row.t_due,'Mon DD, YYYY'),'—') || ' |' || E'\n';
        END LOOP;
        report := report || E'\n';
      END IF;
    END IF;

    report := report || '## Action Items for CEO' || E'\n\n';
    IF COALESCE(v_pending_amount,0) > 0 THEN report := report || '- [ ] Chase outstanding payment: **$' || TO_CHAR(v_pending_amount,'FM999,999,990.00') || '**' || E'\n'; END IF;
    IF EXISTS (SELECT 1 FROM project_milestones pm2 WHERE pm2.project_id = ANY(project_ids) AND pm2.payment_status != 'paid' AND pm2.target_date < CURRENT_DATE) THEN
      report := report || '- [ ] **Follow up on overdue milestones**' || E'\n';
    END IF;
    IF proj_count > 0 THEN report := report || '- [ ] Review project progress and unblock stuck tasks' || E'\n'; END IF;
    report := report || '- [ ] Schedule QBR / status call with client' || E'\n';
    report := report || E'\n---\n*Auto-generated · Refreshed ' || today || ' · Runs every Monday 6am.*' || E'\n';

    v_file_slug := TRIM(BOTH '-' FROM LEFT(LOWER(REGEXP_REPLACE(cat.name,'[^a-z0-9]+','-','gi')),55));
    v_file_name := 'sj-client-' || v_file_slug || '-intelligence-' || today || '.md';
    v_title := TRIM(REPLACE(REPLACE(cat.name,'- Project Documents',''),'- Client Documents',''));

    DELETE FROM knowledge_files kf WHERE kf.category_id = cat.id AND kf.file_name LIKE 'sj-client-%-intelligence-%.md';

    INSERT INTO knowledge_files (source_id, category_id, title, file_name, content, file_type, processing_status)
    VALUES (source_uuid, cat.id, v_title || ' — Client Intelligence Report (Auto-Generated)', v_file_name, report, 'markdown', 'pending');

  END LOOP;
END;
$func$;

-- ─────────────────────────────────────────────────────────────
-- Cron schedules (drop-then-create for idempotency)
-- ─────────────────────────────────────────────────────────────

-- auto-status-transition-2h (every 2 hours)
DO $$
BEGIN
  PERFORM cron.unschedule(jobid)
  FROM cron.job
  WHERE jobname = 'auto-status-transition-2h';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'auto-status-transition-2h',
  '0 */2 * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://rdrcphneopaadqbxyaoc.supabase.co/functions/v1/auto-status-transition',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcmNwaG5lb3BhYWRxYnh5YW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NjIwMjQsImV4cCI6MjA4ODEzODAyNH0.7TSpF8E-IRib9cglxzlDRU7Q6y4k1ZyZWeGBM08U2so'
    ),
    body := jsonb_build_object('cron', true),
    timeout_milliseconds := 600000
  ) AS request_id;
  $cron$
);

-- deal-daily-classifier (daily 12:00 UTC)
DO $$
BEGIN
  PERFORM cron.unschedule(jobid)
  FROM cron.job
  WHERE jobname = 'deal-daily-classifier';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'deal-daily-classifier',
  '0 12 * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://rdrcphneopaadqbxyaoc.supabase.co/functions/v1/deal-classify-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcmNwaG5lb3BhYWRxYnh5YW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NjIwMjQsImV4cCI6MjA4ODEzODAyNH0.7TSpF8E-IRib9cglxzlDRU7Q6y4k1ZyZWeGBM08U2so'
    ),
    body := jsonb_build_object('cron', true),
    timeout_milliseconds := 600000
  ) AS request_id;
  $cron$
);

-- client-kb-weekly-sync (Monday 06:00 UTC)
DO $$
BEGIN
  PERFORM cron.unschedule(jobid)
  FROM cron.job
  WHERE jobname = 'client-kb-weekly-sync';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'client-kb-weekly-sync',
  '0 6 * * 1',
  $cron$ SELECT public.sync_client_kb_reports(); $cron$
);
