const { ipcMain } = require("electron");
const db = require("./database");

// function generateNumero() {
//     return "AE-" + Math.floor(Math.random() * 100000);
// }

ipcMain.handle("students:getAll", async () => {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM students ORDER BY id DESC",
            [],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
});

ipcMain.handle("students:add", async (_, student) => {
    return new Promise((resolve, reject) => {
        // const numero = generateNumero();

        db.run(
            `
            INSERT INTO students
            (numero, nom, prenom, date_de_naissance, telephone, type_permis, status, date_inscription)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                student.numero,
                student.nom,
                student.prenom,
                student.date_de_naissance,
                student.telephone,
                student.type_permis,
                student.status,
                new Date().toLocaleDateString('sv-SE'),
            ],
            function (err) {
                if (err) reject(err);
                else resolve({ success: true });
            }
        );
    });
});

ipcMain.handle("students:search", async (_, query) => {
    return new Promise((resolve, reject) => {
        db.all(
            `
            SELECT * FROM students
            WHERE nom LIKE ?
            OR prenom LIKE ?
            OR numero LIKE ?
            OR telephone LIKE ?
            ORDER BY id DESC
            `,
            [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
});

ipcMain.handle("students:delete", async (_,id) => {
    return new Promise((resolve, reject) => {
        db.run(

            "DELETE FROM students WHERE id = ?",
            [id],
            function (err){
                if (err) reject(err);
                else resolve({success:true});
            }
        );
    });
});

ipcMain.handle("students:getById", async (_, id) => {
    return new Promise((resolve, reject) => {
        db.get(

            "SELECT * FROM students WHERE id = ?",
            [id],
            (err, row) => {
                if (err) reject(err);
                else resolve(row);
            }
        );
    });
});