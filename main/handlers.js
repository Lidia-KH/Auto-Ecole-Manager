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
            (numero, nom, prenom, date_de_naissance, telephone, type_permis, date_inscription)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                student.numero,
                student.nom,
                student.prenom,
                student.telephone,
                student.date_de_naissance,
                student.type_permis,
                new Date().toISOString(),
            ],
            function (err) {
                if (err) reject(err);
                else resolve({ success: true });
            }
        );
    });
});

ipcMain.handle("student:search", async (_, query) => {
    return new promise((resolve, reject) => {
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