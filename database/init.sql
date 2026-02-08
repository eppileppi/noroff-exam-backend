CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

INSERT IGNORE INTO users (username, password) VALUES ('admin', 'P4ssword');

CREATE TABLE IF NOT EXISTS participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    dob DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS work (
    id INT AUTO_INCREMENT PRIMARY KEY,
    participant_id INT NOT NULL,
    companyname VARCHAR(255) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS home (
    id INT AUTO_INCREMENT PRIMARY KEY,
    participant_id INT NOT NULL,
    country VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

-- Insert Admin User (Password is 'P4ssword' - should be hashed in production but requirements say store credentials?)
-- Requirement: "These credentials needs to be stored in the database." & "Login: admin, Password: P4ssword"
-- I will store it as plain text to strictly follow "Basic Auth" description interpretation for this assignment level, 
-- BUT best practice is hashing. Instructions say "store credentials", doesn't explicitly forbid hashing but usually "admin/P4ssword" implies defaults.
-- However, Basic Auth compares the sent header with stored creds. 
-- I'll stick to a simple strategy: Store as is or hash? 
-- The prompt doesn't explicitly say "store plain text", but "credentials needs to be stored".
-- I will implementing hashing because it's responsible, but I'll write a script to insert it.
-- For the init.sql, I'll put a placeholder or just `INSERT IGNORE` assuming the app might handle seeding or I'll run a seeder script.
-- Actually, let's make a separate seeder script to handle the hashing if I decide to hash. 
-- Wait, "The application will need to save participants’ data; an Admin user must be created... The Admin user will authenticate themselves via Basic authentication."
-- "These credentials needs to be stored in the database."
-- I will create a `database/init.js` script to run this SQL and insert the admin user with hashing if possible, or plain text if simplest. 
-- Let's stick to plain text for the SQL file for now to be explicit, but in a real app I'd hash. 
-- Actually, I'll write a Node script to initialize the DB which is safer.

-- For now, just the tables in SQL.
