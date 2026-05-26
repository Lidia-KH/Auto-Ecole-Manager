const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { app } = require("electron");
const { formatWithOptions } = require("util");

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
    db.run(`
        CREATE TABLE IF NOT EXISTS payements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL REFERENCES students(id),
            montant INTEGER NOT NULL,
            motif TEXT DEFAULT 'autre',
            date_payement TEXT DEFAULT CURRENT_DATE,
            note TEXT
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS formations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            prix INTEGER NOT NULL        
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS student_formations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL REFERENCES students(id),
            formation_id INTEGER NOT NULL REFERENCES formations(id)
        )
    `);
});

module.exports = db;
