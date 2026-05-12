import { storage } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadSituacionFiscal(clienteId: number, file: File): Promise<string> {
    try {
        const path = `client/${clienteId}/docs/${file.name}`;
        const storageRef = ref(storage, path);

        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        return url;
    } catch (error) {
        console.error("Error al subir el archivo a Firebase Storage:", error);
        throw error;
    }
}