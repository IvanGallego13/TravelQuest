import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY; // Supabase API Key

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
