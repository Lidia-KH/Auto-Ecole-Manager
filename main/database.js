const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { app } = require("electron");
const { formatWithOptions } = require("util");

const dbPath = path.join(app.getPath("userData"), "autoecole.db");
console.log("Database:", dbPath);

const db = new sqlite3.Database(dbPath, err => {
    if (err) {
        console.error("Database error:", err);
    } else {
        console.log("SQLite connected.");
    }
});

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
            date_inscription TEXT,
            date_permis_obtenu TEXT,
            formation_id INTEGER NOT NULL REFERENCES formations(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS payements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL REFERENCES students(id),
            montant INTEGER NOT NULL,
            motif TEXT DEFAULT 'autre',
            scope TEXT DEFAULT 'formation',
            date_payement TEXT DEFAULT CURRENT_DATE,
            note TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS formations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            prix INTEGER NOT NULL,
            heures INTEGER DEFAULT 0      
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS student_formations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL REFERENCES students(id),
            formation_id INTEGER NOT NULL REFERENCES formations(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL REFERENCES students(id),
            type_seance TEXT NOT NULL,
            date_seance TEXT NOT NULL,
            heure TEXT,
            duree INTEGER DEFAULT 1,
            moniteur TEXT,
            voiture TEXT,
            note TEXT
        )    
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS moniteurs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL
    )`);

    db.run(`
        CREATE TABLE IF NOT EXISTS voitures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        immatriculation TEXT NOT NULL
    )`);
    db.run(`
        CREATE TABLE IF NOT EXISTS exams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL REFERENCES students(id),
        type_examen TEXT NOT NULL,
        date_examen TEXT NOT NULL,
        heure TEXT,
        lieu TEXT,
        resultat TEXT DEFAULT 'en_attente',
        note TEXT,
        created_at TEXT DEFAULT (datetime('now'))
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS license (
            id INTEGER PRIMARY KEY CHECK(id = 1),

            customer_name TEXT,

            machine_id TEXT NOT NULL,

            license_key TEXT NOT NULL,

            activated_at TEXT DEFAULT CURRENT_TIMESTAMP,

            expires_at TEXT
        )
    `);
});

module.exports = db;
