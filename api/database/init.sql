-- Initialisierung basierend auf einer frischen Postgres installation.
-- Kreiert die Datenbank und die drei benutzten Tabelle (sowie Indizes für eine schnellere
-- Abfrage).

CREATE database logbook;
\c logbook

CREATE TABLE accounts (
	user_id serial PRIMARY KEY,
	username VARCHAR UNIQUE NOT NULL,
	password VARCHAR NOT NULL,
	email VARCHAR UNIQUE NOT NULL
);
CREATE UNIQUE INDEX username_idx ON accounts (username);

CREATE TABLE sessions (
  session_id serial PRIMARY KEY,
  session_token VARCHAR UNIQUE NOT NULL,
  user_id integer NOT NULL,
  created_on TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX session_token_idx ON sessions (session_token);

CREATE TABLE jumps (
  jump_id serial PRIMARY KEY,
  description VARCHAR NOT NULL,
  user_id integer  NOT NULL,
  date_string VARCHAR NOT NULL
);
CREATE  INDEX user_jumps ON jumps (user_id);