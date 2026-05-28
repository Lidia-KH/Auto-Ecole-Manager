const { ipcMain } = require("electron");
const db = require("./database");
const { resolve } = require("node:dns");

// ====== Students Handlers ======

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

// ====== Payement Handlers ======

ipcMain.handle("formations:getAll", () => {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM formations ORDER BY prix ASC",
            [],
            (err, rows) => {
                if(err) reject(err);
                else resolve(rows);
            }
        )
    })
});

// student payements

ipcMain.handle("student_formations:getByStudent", (_,studentId) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT sf.*, f.nom, f.prix
            FROM student_formations sf
            JOIN formations f ON f.id = sf.formation_id
            WHERE sf.student_id = ?`,
            [studentId],
            (err, row) => {
                if(err) reject(err);
                else resolve(row);
            }
        );
    })
});

ipcMain.handle("student_formations:set", (_, {student_id, formation_id}) =>{
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM student_formations WHERE student_id = ?",
            [student_id],
            (err) => {
                if (err) {reject(err); return}
                db.run(
                    "INSERT INTO student_formations (student_id, formation_id) VALUES (?,?)",
                    [student_id, formation_id],
                    function (err) {
                        if (err) reject(err)
                        else resolve({ success: true })
                    }
                )
            }
        )
    })
});

// global payements related

ipcMain.handle("payements:getByStudent", (_, studentId) => {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM payements WHERE student_id = ? ORDER BY date_payement DESC",
            [studentId],
            (err, rows) => {
                if(err) reject(err);
                else resolve(rows)
            }
        )
    })
});

ipcMain.handle("payements:add", (_, data) => {
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO payements (student_id, montant, motif, date_payement, note)
            VALUES (?,?,?,?,?)
            `,
        [
            data.student_id,
            data.montant, 
            data.motif || "autre", 
            data.date_payement || new Date().toLocaleDateString("sv-SE"), 
            data.note || ""
        ],
    function(err) {
        if(err) reject(err)
        else resolve({ success:true, id: this.lastID })
    })
    })
});

ipcMain.handle("payements:delete", (_,id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM payements WHERE id = ?",
            [id],
            function (err) {
                if(err) reject(err)
                else resolve({ success:true })
            }
        )
    })
});

ipcMain.handle("payements:getBalance", (_, studentId) =>{
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT f.prix
            FROM student_formations sf
            JOIN formations f ON f.id = sf.formation_id
            WHERE sf.student_id = ?
            `,
        [studentId],
        (err, formation) => {
            if(err) {reject(err); return }
            const total_prix = formation?.prix ?? 0

            db.get(
                "SELECT COALESCE(SUM(montant),0) as total FROM payements WHERE student_id = ?",
                [studentId],
                (err2, result) => {
                    if(err2) {reject(err2); return }
                    const total_paye = result.total
                    resolve({total_prix, total_paye, reste: total_prix - total_paye,})
                }
            )
        })
    })
});

// for dashboard stats

ipcMain.handle("payements:dashboardStats", () => {
    return new Promise((resolve, reject) => {
        let today = new Date().toLocaleDateString("sv-SE")
        const firstMonth = today.slice(0, 7) + "-01"

        const results = {}

        db.get(
            "SELECT COALESCE(SUM(montant),0) as total FROM payements WHERE date_payement = ?",
            [today],
            (err, r) => {
                if(err) {reject(err); return}
                results.today = r.total

                db.get(
                    "SELECT COALESCE(SUM(montant),0) as total FROM payements WHERE date_payement = ?",
                    [firstMonth],
                    (err2, r2) => {
                        if(err2) {reject(err2); return}
                        results.thisMonth = r2.total

                        db.all(
                            `SELECT s.id, s.numero, s.nom, s.prenom, f.prix, COALESCE(SUM(p.montant),0) as total_paye
                            FROM students s
                            JOIN student_formations sf ON sf.student_id = s.id
                            JOIN formations f ON f.id = sf.formation_id
                            LEFT JOIN payements p ON p.student_id = s.id
                            GROUP BY s.id
                            HAVING f.prix - total_paye > 0
                            ORDER BY (f.prix - total_paye) DESC`,
                            [],
                            (err3, debtors) => {
                                if(err3) {reject(err3); return}
                                results.debtors = debtors.map(d => ({
                                    ...d,
                                    reste:d.prix - d.total_paye,
                                }))
                                results.totalUnpaid = results.debtors.reduce((s, d) => s + d.reste, 0)
                                results.unpaidCount = results.debtors.length
                                resolve(results)
                            }
                        )
                    }
                )

                
            }
        )
    })
});

ipcMain.handle("payements:monthlyRevenue", () => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT strftime('%Y-%m', date_payement) as month, SUM(montant) as total
            FROM payements
            GROUP BY month
            ORDER BY month DESC
            LIMIT 6`,
            [],
            (err, rows) => {
                if(err) reject(err);
                else resolve(rows.reverse());
            }
        )
    })
});

ipcMain.handle("payements:allBalances", () =>{
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT s.id, s.numero, s.nom, s.prenom, s.telephone,
            f.nom as formation_nom, f.prix, COALESCE(SUM(p.montant),0) as total_paye
            FROM students s
            LEFT JOIN student_formations sf ON sf.student_id = s.id
            LEFT JOIN formations f ON f.id = sf.formation_id
            LEFT JOIN payements p ON p.student_id = s.id
            GROUP BY s.id
            ORDER BY (f.prix - COALESCE(SUM(p.montant),0)) DESC`,
            [],
            (err, rows) => {
                if(err) reject(err);
                else resolve(rows.map(r => ({
                    ...r,
                    reste: (r.prix ?? 0) - r.total_paye,
                })))
            }
        )
    })
});

// ====== Session handler ======

ipcMain.handle("sessions:getByStudent", (_, studentId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM sessions
            WHERE student_id = ?
            ORDER BY date_seance DESC`,
            [studentId],
            (err, rows) => {
                if(err) reject(err);
                else resolve(rows);
            }
        )
    })
});

ipcMain.handle("sessions:add", (_, data) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO sessions
            (student_id, type_seance, date_seance, duree, note)
            VALUES (?,?,?,?,?)`,
            [
                data.student_id,
                data.type_seance,
                data.date_seance,
                data.duree || 1,
                data.note || ""
            ],
            function(err){
                if(err) reject(err);
                else resolve({
                    success:true,
                    id:this.lastID
                })
            }
        )
    })
});