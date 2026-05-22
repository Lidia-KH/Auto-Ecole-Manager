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
});