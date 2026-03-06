/**
 * Quarterly Digest Edge Function
 *
 * Generates a comprehensive quarterly digest report using AI.
 * Aggregates data from meetings and projects to produce an executive
 * summary with highlights, risks, and recommendations.
 *
 * Input:  { quarter?: string, pod_id?: string }
 * Output: { digest: QuarterlyDigest }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { chatCompletion, logUsage } from '../_shared/ai-provider-routing.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getQuarterDateRange(quarter?: string): { start: string; end: string; label: string } {
  const now = new Date()
  const currentQ = Math.ceil((now.getMonth() + 1) / 3)
  const currentYear = now.getFullYear()

  let q = currentQ
  let year = currentYear

  if (quarter) {
    const match = quarter.match(/Q(\d)\s*(\d{4})/)
    if (match) {
      q = parseInt(match[1])
      year = parseInt(match[2])
    }
  }

  const startMonth = (q - 1) * 3
  const start = new Date(year, startMonth, 1).toISOString()
  const end = new Date(year, startMonth + 3, 0, 23, 59, 59).toISOString()

  return { start, end, label: `Q${q} ${year}` }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { quarter } = await req.json()
    const range = getQuarterDateRange(quarter)

    // Gather quarterly data in parallel
    const [meetingsResult, projectsResult] = await Promise.all([
      // Meetings this quarter
      supabaseClient
        .from('meetings')
        .select('title, scheduled_at, status, duration_minutes')
        .gte('scheduled_at', range.start)
        .lte('scheduled_at', range.end)
        .limit(50),

      // Projects active this quarter
      supabaseClient
        .from('projects')
        .select('name, status, start_date, end_date')
        .gte('updated_at', range.start)
        .limit(30),
    ])

    const meetings = meetingsResult.data || []
    const projects = projectsResult.data || []

    const projectStats = {
      total: projects.length,
      active: projects.filter((p: Record<string, string>) => p.status === 'active').length,
      completed: projects.filter((p: Record<string, string>) => p.status === 'completed').length,
    }

    const contextText = `
Quarter: ${range.label}

MEETINGS: ${meetings.length} meetings held
${meetings.slice(0, 20).map((m: Record<string, string>) => `- ${m.title} (${m.status})`).join('\n')}

PROJECTS (${projectStats.total} total, ${projectStats.active} active, ${projectStats.completed} completed):
${projects.slice(0, 20).map((p: Record<string, string>) => `- ${p.name} (${p.status})`).join('\n')}
`

    // Generate digest via AI
    const result = await chatCompletion(supabaseClient, {
      messages: [
        {
          role: 'system',
          content: `You are an executive business analyst creating a quarterly digest report.

Based on the provided data, generate a comprehensive digest with:
- executive_summary: 3-5 sentence overview of the quarter
- highlights: Array of positive achievements (3-5 items)
- risks: Array of concerns or risks (2-4 items)
- recommendations: Array of actionable recommendations for next quarter (3-5 items)
- metrics_summary: Key performance metrics in plain text

Be specific, reference actual data points, and provide actionable insights.

Respond with JSON: { "executive_summary", "highlights", "risks", "recommendations", "metrics_summary" }`
        },
        {
          role: 'user',
          content: `Generate a quarterly digest for this data:\n${contextText}`
        }
      ],
      temperature: 0.5,
      max_tokens: 2000,
    })

    let digest = {}
    try {
      digest = JSON.parse(result.content)
    } catch {
      digest = {
        executive_summary: 'Unable to generate digest from available data.',
        highlights: [],
        risks: [],
        recommendations: [],
      }
    }

    // Log AI usage
    await logUsage(
      supabaseClient,
      null,
      null,
      'quarterly-digest',
      result.input_tokens || 0,
      result.output_tokens || 0,
      0,
      0
    )

    return new Response(
      JSON.stringify({
        digest,
        quarter: range.label,
        stats: { meetings: meetings.length, projects: projectStats },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: unknown) {
    console.error('Quarterly digest error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
