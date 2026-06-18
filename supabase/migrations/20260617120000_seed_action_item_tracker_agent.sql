-- Seed Action Item Tracker agent for nonprofit operational agents
INSERT INTO public.ai_agents (
  name,
  slug,
  category,
  description,
  system_prompt,
  provider_config,
  required_role,
  is_enabled,
  memory_enabled,
  avatar,
  welcome_message,
  conversation_starters
)
SELECT
  'Action Item Tracker',
  'action-item-tracker',
  'meetings',
  'Tracks board pending actions, flags overdue and blocked items with recommended next steps.',
  'You are an operations analyst for a nonprofit board. Track pending action items, flag overdue and blocked work, and recommend the single highest-priority next step.',
  '{"provider": "openai", "model": "gpt-4o", "temperature": 0.2, "max_tokens": 2500}'::jsonb,
  'user',
  true,
  false,
  '📋',
  'I track board action items and flag what needs attention today.',
  '["What board actions are overdue?", "Show blocked items", "What should the ED do first?"]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_agents WHERE slug = 'action-item-tracker'
);
