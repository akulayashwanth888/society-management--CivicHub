
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rgptfhkavluqcqdhhqsy.supabase.co';
const supabaseKey = 'sb_publishable_uOdbQ2vHOdWaAjQnR5IGww__oXRN5ig';

export const supabase = createClient(supabaseUrl, supabaseKey);
