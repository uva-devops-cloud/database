const AWS = require('aws-sdk');
const { Client } = require('pg');

// Configure AWS SDK with retries and timeouts
const awsConfig = {
  maxRetries: 3,
  httpOptions: { timeout: 5000 }
};
const SecretsManager = new AWS.SecretsManager(awsConfig);
const S3 = new AWS.S3(awsConfig);

// Helper for timestamps in logs
const logWithTimestamp = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

exports.handler = async function(event) {
  logWithTimestamp('Starting database migration job');
  // Define client variable properly at function scope
  let client = null;
  
  try {
    // Get DB credentials from Secrets Manager
    logWithTimestamp('Retrieving database credentials from Secrets Manager');
    const secret = await SecretsManager.getSecretValue({
      SecretId: process.env.DB_SECRET_ARN
    }).promise();
    logWithTimestamp('Successfully retrieved database credentials');
    
    // Use the secret string directly as password (no JSON parsing)
    const password = secret;
    logWithTimestamp(`Using database: ${process.env.DB_NAME} on host ${process.env.DB_HOST}`);
    
    // Connect to DB
    logWithTimestamp(`Initializing database client`);
    client = new Client({
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: 'dbadmin',
      password: password, // Use password directly instead of secretData.password
      port: 5432,
      // Add connection timeout
      connectionTimeoutMillis: 10000,
      query_timeout: 30000
    });
    
    logWithTimestamp('Attempting database connection');
    await client.connect();
    logWithTimestamp('Successfully connected to database');
    
    // Create migrations table if doesn't exist
    logWithTimestamp('Creating migrations table if it does not exist');
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    logWithTimestamp('Migrations table setup complete');
    
    // Download migrations from S3
    logWithTimestamp(`Listing migration files from S3 bucket: ${process.env.MIGRATIONS_BUCKET}`);
    const { Contents } = await S3.listObjects({
      Bucket: process.env.MIGRATIONS_BUCKET,
      Prefix: 'migrations/'
    }).promise();
    logWithTimestamp(`Found ${Contents ? Contents.length : 0} objects in S3 bucket`);
    
    // Sort migrations
    const migrations = Contents
      .map(obj => obj.Key)
      .filter(key => key.endsWith('.sql'))
      .sort();
    logWithTimestamp(`Found ${migrations.length} SQL migration files`);
    logWithTimestamp(`Migration files found: ${JSON.stringify(migrations)}`);
    
    // Get applied migrations
    logWithTimestamp('Fetching already applied migrations from database');
    const { rows } = await client.query('SELECT version FROM schema_migrations');
    const appliedMigrations = rows.map(row => row.version);
    logWithTimestamp(`Already applied migrations: ${JSON.stringify(appliedMigrations)}`);
    
    let appliedCount = 0;
    
    // Apply new migrations in transaction
    for (const migrationKey of migrations) {
      const filename = migrationKey.split('/').pop();
      const version = filename.split('__')[0]; // Get V1, V2, etc.
      
      if (!appliedMigrations.includes(version)) {
        logWithTimestamp(`Preparing to apply migration: ${filename}`);
        
        // Get migration content
        logWithTimestamp(`Fetching migration file content from S3: ${migrationKey}`);
        const { Body } = await S3.getObject({
          Bucket: process.env.MIGRATIONS_BUCKET,
          Key: migrationKey
        }).promise();
        
        const sql = Body.toString('utf-8');
        logWithTimestamp(`Migration file size: ${sql.length} bytes`);
        
        logWithTimestamp(`Starting transaction for migration: ${filename}`);
        await client.query('BEGIN');
        try {
          logWithTimestamp(`Executing SQL for migration: ${filename}`);
          await client.query(sql);
          logWithTimestamp(`Recording migration in schema_migrations table`);
          await client.query(
            'INSERT INTO schema_migrations(version) VALUES($1)', 
            [version]
          );
          logWithTimestamp(`Committing transaction for migration: ${filename}`);
          await client.query('COMMIT');
          logWithTimestamp(`Migration ${filename} applied successfully`);
          appliedCount++;
        } catch (err) {
          logWithTimestamp(`Error in migration ${filename}, rolling back`);
          await client.query('ROLLBACK');
          console.error(`Error applying migration ${filename}:`, err);
          throw err;
        }
      } else {
        logWithTimestamp(`Skipping already applied migration: ${filename}`);
      }
    }
    
    logWithTimestamp(`Migration job completed. Applied ${appliedCount} new migrations.`);
    return { 
      statusCode: 200,
      body: JSON.stringify({ 
        message: `Migrations completed successfully. Applied ${appliedCount} new migrations.`
      })
    };
  } catch (error) {
    logWithTimestamp(`Migration job FAILED with error: ${error.message}`);
    console.error('Migration error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    if (client) {
      logWithTimestamp('Closing database connection');
      try {
        await client.end();
        logWithTimestamp('Database connection closed successfully');
      } catch (err) {
        logWithTimestamp(`Error closing database connection: ${err.message}`);
      }
    }
    logWithTimestamp('Lambda execution finished');
  }
}