import { createClient } from '@supabase/supabase-js';
import { appConfig } from '../config';

// Cliente único do Supabase, usado por todos os "services" em src/services.
// Requer a dependência @supabase/supabase-js (rode: npm install @supabase/supabase-js).
export const supabase = createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey);
