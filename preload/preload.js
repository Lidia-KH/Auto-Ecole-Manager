const { contextBridge, ipcRenderer } = require("electron");

console.log("== PRELOAD LOADED SUCCESSFULLY");

contextBridge.exposeInMainWorld("api", {
    getMachineId: () =>
        ipcRenderer.invoke("license:getMachineId"),
    getLicense: () =>
        ipcRenderer.invoke("license:get"),

    saveLicense: (data) =>
        ipcRenderer.invoke("license:save", data),

    isAppLicensed: () =>
        ipcRenderer.invoke("license:isLicensed"),

    activateLicense: (license) =>
        ipcRenderer.invoke("license:activate", license),


    getStudents: () => 
        ipcRenderer.invoke("students:getAll"),

    addStudent: (Student) =>
        ipcRenderer.invoke("students:add", Student),

    searchStudents: (query) =>
        ipcRenderer.invoke("students:search", query),

    deleteStudent: (id) =>
        ipcRenderer.invoke("students:delete", id),
    getStudentById: (id) => 
        ipcRenderer.invoke("students:getById", id),
    updateStudent: (data) => 
        ipcRenderer.invoke("students:update", data),


    getPayementsDashboardStats: () =>
        ipcRenderer.invoke("payements:dashboardStats"),
    getPayementsAllBalances: () =>
        ipcRenderer.invoke("payements:allBalances"),
    getPayementsMonthlyRevenue: () => 
        ipcRenderer.invoke("payements:monthlyRevenue"),
    getPayementsByStudent: (id) =>
        ipcRenderer.invoke("payements:getByStudent", id),
    getPayementsBalance: (id) => 
        ipcRenderer.invoke("payements:getBalance", id),
    addPayement: (p) =>
        ipcRenderer.invoke("payements:add", p),
    deletePayement: (id) => 
        ipcRenderer.invoke("payements:delete", id),
    updatePayement: (p) =>
        ipcRenderer.invoke("payements:update", p),
    getFormations: () => 
        ipcRenderer.invoke("formations:getAll"),
    addFormation:     (data) => 
        ipcRenderer.invoke("formations:add", data),
    updateFormation:  (data) => 
        ipcRenderer.invoke("formations:update", data),
    deleteFormation:  (id)   => 
        ipcRenderer.invoke("formations:delete", id),
    setStudentFormation: (data) =>
        ipcRenderer.invoke("student_formations:set", data),

    getSessionByStudent: (id) =>
        ipcRenderer.invoke("sessions:getByStudent", id),
    addSession: (data) =>
        ipcRenderer.invoke("sessions:add", data),
    getAllSessions: () =>
        ipcRenderer.invoke("sessions:getAll"),
    updateSession: (data) => 
        ipcRenderer.invoke("sessions:update", data),
    deleteSession: (id) =>
        ipcRenderer.invoke("sessions:delete", id),
    getMoniteurs: () =>
        ipcRenderer.invoke("moniteurs:getAll"),
    addMoniteur:      (data) => 
        ipcRenderer.invoke("moniteurs:add", data),
    deleteMoniteur:   (id)   => 
        ipcRenderer.invoke("moniteurs:delete", id),

    getVoitures: () =>
        ipcRenderer.invoke("voitures:getAll"),
    addVoiture:       (data) => 
        ipcRenderer.invoke("voitures:add", data),
    deleteVoiture:    (id)   => 
        ipcRenderer.invoke("voitures:delete", id),



    getAllExams: () => 
        ipcRenderer.invoke("exams:getAll"),
    getExamsByStudent: (id) => 
        ipcRenderer.invoke("exams:getByStudent", id),
    addExam: (data) => 
        ipcRenderer.invoke("exams:add", data),
    addExamsBulk: (rows) => 
        ipcRenderer.invoke("exams:addBulk", rows),
    updateExam: (data) => 
        ipcRenderer.invoke("exams:update", data),
    deleteExam: (id) => 
        ipcRenderer.invoke("exams:delete", id),
    getExamsStats: () => 
        ipcRenderer.invoke("exams:stats"),


    sendWhatsappMessage: (payload) =>
        ipcRenderer.invoke("whatsapp:send", payload),


    
});