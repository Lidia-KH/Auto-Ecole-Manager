const { contextBridge, ipcRenderer } = require("electron");

console.log("== PRELOAD LOADED SUCCESSFULLY");

contextBridge.exposeInMainWorld("api", {
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
    getFormations: () => 
        ipcRenderer.invoke("formations:getAll"),
    setStudentFormation: (data) =>
        ipcRenderer.invoke("student_formations:set", data),

    getSessionByStudent: (id) =>
        ipcRenderer.invoke("sessions:getByStudent", id),
    addSession: (data) =>
        ipcRenderer.invoke("sessions:add", data),
    getAllSessions: () =>
        ipcRenderer.invoke("sessions:getAll")
    
});