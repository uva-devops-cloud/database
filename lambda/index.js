const AWS = require('aws-sdk');
const { Client } = require('pg');

exports.handler = async (event) => {
  console.log('Starting database migration job');
  
  // Get DB credentials from Secrets Manager
  const secretsManager = new AWS.SecretsManager();
  const secret = await secretsManager.getSecretValue({
    SecretId: process.env.DB_SECRET_ARN
  }).promise();
  
  const password = JSON.parse(secret.SecretString);
  
  // Connect to DB
  const client = new Client({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: 'dbadmin',
    password: password,
    port: 5432,
  });
  
  try {
    await client.connect();
    
    // Create migrations table if doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Download migrations from S3
    const s3 = new AWS.S3();
    const { Contents } = await s3.listObjects({
      Bucket: process.env.MIGRATIONS_BUCKET,
      Prefix: 'migrations/'
    }).promise();
    
    // Sort migrations
    const migrations = Contents
      .map(obj => obj.Key)
      .filter(key => key.endsWith('.sql'))
      .sort();
    
    // Get applied migrations
    const { rows } = await client.query('SELECT version FROM schema_migrations');
    const appliedMigrations = rows.map(row => row.version);
    
    let appliedCount = 0;
    
    // Apply new migrations in transaction
    for (const migrationKey of migrations) {
      const filename = migrationKey.split('/').pop();
      const version = filename.split('__')[0]; // Get V1, V2, etc.
      
      if (!appliedMigrations.includes(version)) {
        console.log(`Applying migration: ${filename}`);
        
        // Get migration content
        const { Body } = await s3.getObject({
          Bucket: process.env.MIGRATIONS_BUCKET,
          Key: migrationKey
        }).promise();
        
        const sql = Body.toString('utf-8');
        
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query(
            'INSERT INTO schema_migrations(version) VALUES($1)', 
            [version]
          );
          await client.query('COMMIT');
          console.log(`Migration ${filename} applied successfully`);
          appliedCount++;
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`Error applying migration ${filename}:`, err);
          throw err;
        }
      }
    }
    
    return { 
      statusCode: 200,
      body: JSON.stringify({ 
        message: `Migrations completed successfully. Applied ${appliedCount} new migrations.`
      })
    };
  } catch (error) {
    console.error('Migration error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    await client.end();
  }
};