import { neon } from '@neondatabase/serverless';

// Ensure the DATABASE_URL environment variable is set
// You can get this from your Neon project settings.
const sql = neon(process.env.DATABASE_URL!);

// --- User Secret Table ---
// CREATE TABLE IF NOT EXISTS user_secrets (
//   id SERIAL PRIMARY KEY,
//   username VARCHAR(255) UNIQUE NOT NULL,
//   secret_question VARCHAR(255) NOT NULL,
//   secret_answer_hash VARCHAR(255) NOT NULL
// );

export default sql;
