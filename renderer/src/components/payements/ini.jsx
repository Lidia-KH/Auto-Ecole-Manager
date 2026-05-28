export default function ini(nom, prenom) {
    return ((nom?.[0] ?? "") + (prenom?.[0] ?? "")).toUpperCase()
}