const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { app } = require("electron");

const dbPath = path.join(app.getPath("userData"), "autoecole.db");

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero TEXT UNIQUE,
            nom TEXT,
            prenom TEXT,
            date_de_naissance TEXT,
            telephone TEXT,
            type_permis TEXT,
            status TEXT DEFAULT 'actif',
            date_inscription TEXT
        )
    `);
});

module.exports = db;