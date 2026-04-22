// Centralized typed-loose Supabase client for new tables that
// the auto-generated types haven't picked up yet.
import { supabase } from "@/integrations/supabase/client";
export const db = supabase as any;
export { supabase };
