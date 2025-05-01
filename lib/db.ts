import { neon } from '@neondatabase/serverless';

// Ensure the DATABASE_URL environment variable is set
// You can get this from your Neon project settings.
const sql = neon(process.env.DATABASE_URL!);

export default sql;
