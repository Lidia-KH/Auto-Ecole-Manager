const { ipcMain } = require("electron");
const db = require("./database");
const { resolve } = require("node:dns");
const { getMachineId } = require("./license");


ipcMain.handle("license:getMachineId", () => {
    return getMachineId();
});

const {
    getLicense,
    saveLicense,
    isAppLicensed,
    activateLicense
} = require("./licenseService");

ipcMain.handle(
    "license:get",
    () => getLicense()
);

ipcMain.handle(
    "license:save",
    (_, data) => saveLicense(data)
);


ipcMain.handle(
    "license:isLicensed",
    async () => {
        return await isAppLicensed();
    }
);


ipcMain.handle(
    "license:activate",
    (_, license) => activateLicense(license)
);

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
                else resolve({ success: true, id: this.lastID });
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

ipcMain.handle("students:update", (_, data) =>
  new Promise((res, rej) =>
    db.run(
      `UPDATE students SET numero=?, nom=?, prenom=?, date_de_naissance=?, telephone=?, type_permis=?, status=?, formation_id=?, date_permis_obtenu=?
       WHERE id=?`,
      [data.numero, data.nom, data.prenom, data.date_de_naissance, data.telephone, data.type_permis, data.status, data.formation_id, data.date_permis_obtenu ?? null, data.id],
      function (e) {
        if (e) rej(e)
        else res({ success: true, id: this.lastID })
    }
    )
  )
);

// ====== Payement Handlers ======

// formations handlers

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

ipcMain.handle("formations:add", (_, { nom, prix, heures }) =>
  new Promise((res, rej) =>
    db.run(
      "INSERT INTO formations (nom, prix, heures) VALUES (?, ?, ?)",
      [nom, prix, heures || 0],
      function (e) { e ? rej(e) : res({ success: true, id: this.lastID }) }
    )
  )
);
 
ipcMain.handle("formations:update", (_, { id, prix }) =>
  new Promise((res, rej) =>
    db.run("UPDATE formations SET prix = ? WHERE id = ?", [prix, id],
      e => e ? rej(e) : res({ success: true })
    )
  )
);
 
ipcMain.handle("formations:delete", (_, id) =>
  new Promise((res, rej) =>
    db.run("DELETE FROM formations WHERE id = ?", [id],
      e => e ? rej(e) : res({ success: true })
    )
  )
);


// student payements

ipcMain.handle("student_formations:getByStudent", (_,studentId) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT s.*, f.nom, f.prix
            FROM students s
            JOIN formations f ON f.id = s.formation_id
            WHERE s.id = ?`,
            [studentId],
            (err, row) => {
                if(err) reject(err);
                else resolve(row);
            }
        );
    })
});

ipcMain.handle("student_formations:set", (_, { student_id, formation_id }) => {
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE students SET formation_id = ? WHERE id = ?",
            [formation_id, student_id],
            function (err) {
                if (err) reject(err);
                else resolve({ success: true });
            }
        );
    });
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
            INSERT INTO payements (student_id, montant, motif, scope, date_payement, note)
            VALUES (?,?,?,?,?,?)
            `,
        [
            data.student_id,
            data.montant, 
            data.motif || "autre", 
            data.scope || "formation",
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
            SELECT f.nom, f.prix
            FROM students s
            JOIN formations f ON f.id = s.formation_id
            WHERE s.id = ?
            `,
        [studentId],
        (err, formation) => {
            if(err) {reject(err); return }
            const total_prix = formation?.prix ?? 0

            db.get(
                "SELECT COALESCE(SUM(montant),0) as total FROM payements WHERE student_id = ? AND scope = 'formation'",
                [studentId],
                (err2, result) => {
                    if(err2) {reject(err2); return }
                    const total_paye = result.total
                    resolve({formation_nom: formation?.nom ?? "", total_prix, total_paye, reste: total_prix - total_paye,})
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
            "SELECT COALESCE(SUM(montant),0) as total FROM payements WHERE date_payement >= ? AND scope = 'formation'",
            [today],
            (err, r) => {
                if(err) {reject(err); return}
                results.today = r.total

                db.get(
                    "SELECT COALESCE(SUM(montant),0) as total FROM payements WHERE date_payement = ? AND scope = 'formation'",
                    [firstMonth],
                    (err2, r2) => {
                        if(err2) {reject(err2); return}
                        results.thisMonth = r2.total

                        db.all(
                            `SELECT s.id, s.numero, s.nom, s.prenom, f.prix, COALESCE(SUM(p.montant),0) as total_paye
                            FROM students s
                            JOIN formations f ON f.id = s.formation_id
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
            WHERE scope = 'formation'
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
            LEFT JOIN formations f ON f.id = s.formation_id
            LEFT JOIN payements p ON p.student_id = s.id AND p.scope = 'formation'
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

ipcMain.handle("payements:update", (_, data) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE payements 
             SET montant=?, motif=?, scope=?, date_payement=?, note=?
             WHERE id=?`,
            [
                data.montant,
                data.motif,
                data.scope,
                data.date_payement,
                data.note,
                data.id
            ],
            function(err) {
                if (err) reject(err)
                else resolve({ success: true })
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
            (student_id, type, date_seance, heure, duree, moniteur, voiture, note)
            VALUES (?,?,?,?,?,?,?,?)`,
            [
                data.student_id,
                data.type_seance || data.type || 'code',
                data.date_seance,
                data.heure,
                data.duree || 1,
                data.moniteur || "",
                data.voiture || "",
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

ipcMain.handle("sessions:getAll", () => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT sessions.*,
            students.nom,
            students.prenom,
            students.numero
            FROM sessions
            JOIN students ON students.id = sessions.student_id
            ORDER BY date_seance DESC`,
            [],
            (err, rows) => {
                if(err) reject(err);
                else resolve(rows);

            }
        )
    })
});

// update & delete seances 
ipcMain.handle("sessions:update", (_, data) =>
  new Promise((res, rej) =>
    db.run(
      `UPDATE sessions SET type_seance=?, date_seance=?, heure=?, duree=?, moniteur=?, voiture=?, note=?
       WHERE id=?`,
      [data.type_seance, data.date_seance, data.heure, data.duree, data.moniteur, data.voiture, data.note, data.id],
      e => e ? rej(e) : res({ success: true })
    )
  )
);

ipcMain.handle("sessions:delete", (_, id) =>
  new Promise((res, rej) =>
    db.run("DELETE FROM sessions WHERE id=?", [id], e => e ? rej(e) : res({ success: true }))
  )
);

// === moniteurs handlers ===
 
ipcMain.handle("moniteurs:getAll", () =>
  new Promise((res, rej) =>
    db.all("SELECT * FROM moniteurs ORDER BY nom ASC", [], (e, r) => e ? rej(e) : res(r))
  )
);
 
ipcMain.handle("moniteurs:add", (_, { nom }) =>
  new Promise((res, rej) =>
    db.run("INSERT INTO moniteurs (nom) VALUES (?)", [nom],
      function (e) { e ? rej(e) : res({ success: true, id: this.lastID }) }
    )
  )
);
 
ipcMain.handle("moniteurs:delete", (_, id) =>
  new Promise((res, rej) =>
    db.run("DELETE FROM moniteurs WHERE id = ?", [id],
      e => e ? rej(e) : res({ success: true })
    )
  )
);


// === voitures handlers ===
 
ipcMain.handle("voitures:getAll", () =>
  new Promise((res, rej) =>
    db.all("SELECT * FROM voitures ORDER BY immatriculation ASC", [], (e, r) => e ? rej(e) : res(r))
  )
);
 
ipcMain.handle("voitures:add", (_, { immatriculation }) =>
  new Promise((res, rej) =>
    db.run("INSERT INTO voitures (immatriculation) VALUES (?)", [immatriculation],
      function (e) { e ? rej(e) : res({ success: true, id: this.lastID }) }
    )
  )
);
 
ipcMain.handle("voitures:delete", (_, id) =>
  new Promise((res, rej) =>
    db.run("DELETE FROM voitures WHERE id = ?", [id],
      e => e ? rej(e) : res({ success: true })
    )
  )
);


// === EXAMA HANDLERS ===
ipcMain.handle("exams:getAll", () => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT e.*, s.nom, s.prenom, s.numero, s.telephone
       FROM exams e
       JOIN students s ON s.id = e.student_id
       ORDER BY e.date_examen DESC`,
      [],
      (err, rows) => { if (err) reject(err); else resolve(rows) }
    )
  })
});

ipcMain.handle("exams:getByStudent", (_, studentId) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM exams
       WHERE student_id = ?
       ORDER BY date_examen DESC`,
      [studentId],
      (err, rows) => { if (err) reject(err); else resolve(rows) }
    )
  })
});

// add one exam
ipcMain.handle("exams:add", (_, data) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO exams (student_id, type_examen, date_examen, heure, lieu, resultat, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.student_id,
        data.type_examen,
        data.date_examen,
        data.heure   || null,
        data.lieu    || null,
        data.resultat || "en_attente",
        data.note    || null,
      ],
      function (err) { if (err) reject(err); else resolve({ success: true, id: this.lastID }) }
    )
  })
});

// add multiple exams at once 
ipcMain.handle("exams:addBulk", (_, rows) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(
      `INSERT INTO exams (student_id, type_examen, date_examen, heure, lieu, resultat, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    db.serialize(() => {
      db.run("BEGIN")
      let error = null
      for (const d of rows) {
        stmt.run(
          [d.student_id, d.type_examen, d.date_examen, d.heure || null,
           d.lieu || null, d.resultat || "en_attente", d.note || null],
          (err) => { if (err) error = err }
        )
      }
      stmt.finalize()
      if (error) {
        db.run("ROLLBACK")
        reject(error)
      } else {
        db.run("COMMIT")
        resolve({ success: true, count: rows.length })
      }
    })
  })
});

// update exam (edit details OR set result)
ipcMain.handle("exams:update", (_, data) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE exams
       SET type_examen=?, date_examen=?, heure=?, lieu=?, resultat=?, note=?
       WHERE id=?`,
      [data.type_examen, data.date_examen, data.heure || null,
       data.lieu || null, data.resultat, data.note || null, data.id],
      (err) => { if (err) reject(err); else resolve({ success: true }) }
    )
  })
});
 
// delete exam
ipcMain.handle("exams:delete", (_, id) => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM exams WHERE id=?", [id],
      (err) => { if (err) reject(err); else resolve({ success: true }) }
    )
  })
});

// dashboard stats for exams page
ipcMain.handle("exams:stats", () => {
  return new Promise((resolve, reject) => {
    const today      = new Date().toLocaleDateString("sv-SE")
    const dayOfWeek  = new Date().getDay()
    const monday     = new Date()
    monday.setDate(monday.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    const sunday     = new Date(monday); sunday.setDate(monday.getDate() + 6)
    const weekStart  = monday.toLocaleDateString("sv-SE")
    const weekEnd    = sunday.toLocaleDateString("sv-SE")
    const monthStart = today.slice(0, 7) + "-01"
 
    db.all(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN resultat = 'en_attente' AND date_examen >= ? THEN 1 ELSE 0 END) as upcoming,
        SUM(CASE WHEN resultat = 'reussi'     THEN 1 ELSE 0 END) as reussis,
        SUM(CASE WHEN resultat = 'echoue'     THEN 1 ELSE 0 END) as echoues,
        SUM(CASE WHEN resultat = 'absent'     THEN 1 ELSE 0 END) as absents,
        SUM(CASE WHEN date_examen BETWEEN ? AND ? THEN 1 ELSE 0 END) as this_week,
        SUM(CASE WHEN date_examen >= ?           THEN 1 ELSE 0 END) as this_month
       FROM exams`,
      [today, weekStart, weekEnd, monthStart],
      (err, rows) => { if (err) reject(err); else resolve(rows[0]) }
    )
  })
});

// Whatsapp sending messages
ipcMain.handle("whatsapp:send", async (_, { phone, message }) => {
  const cleanPhone = phone.replace(/\D/g, "");

  const url =
    `https://wa.me/${cleanPhone}` +
    `?text=${encodeURIComponent(message)}`;

  await shell.openExternal(url);
});