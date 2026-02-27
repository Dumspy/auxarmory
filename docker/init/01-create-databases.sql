SELECT 'CREATE DATABASE auxarmory_test'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'auxarmory_test'
)\gexec
