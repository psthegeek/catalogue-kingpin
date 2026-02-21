
-- Add profile attributes for segmentation
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS loyalty_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS user_segment text DEFAULT 'new_user',
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS demographic_attributes jsonb DEFAULT '{}';

-- User events table for behavioral tracking
CREATE TABLE public.user_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  page_url text,
  referrer text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_events_user_id ON public.user_events(user_id);
CREATE INDEX idx_user_events_event_type ON public.user_events(event_type);
CREATE INDEX idx_user_events_created_at ON public.user_events(created_at DESC);
CREATE INDEX idx_user_events_session_id ON public.user_events(session_id);

ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for unauthenticated visitors)
CREATE POLICY "Anyone can insert events"
ON public.user_events
FOR INSERT
WITH CHECK (true);

-- Only authenticated users can view their own events
CREATE POLICY "Users can view their own events"
ON public.user_events
FOR SELECT
USING (auth.uid() = user_id);

-- User segments table for auto + manual segmentation
CREATE TABLE public.user_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  segment_name text NOT NULL,
  segment_value text NOT NULL,
  source text NOT NULL DEFAULT 'auto',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, segment_name)
);

ALTER TABLE public.user_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own segments"
ON public.user_segments
FOR SELECT
USING (auth.uid() = user_id);

-- Admin-only insert/update/delete will be handled via edge functions with service role

CREATE TRIGGER update_user_segments_updated_at
BEFORE UPDATE ON public.user_segments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
