const { contextBridge, ipcRenderer } = require("electron");
const { default: Students } = require("../renderer/src/pages/Students");

contextBridge.executeInMainWorld("api", {
    getStudents: () => ipcRenderer.invoke("students:getAll"),

    addStudent: (Student) =>
        ipcRenderer.invoke("students:add", Student),

    searchStudents: (query) =>
        ipcRenderer.invoke("students:search", query),

    deleteStudent: (id) =>
        ipcRenderer.invoke("students:delete", id),
});