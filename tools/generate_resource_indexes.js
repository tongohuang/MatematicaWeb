#!/usr/bin/env node
/**
 * Generador de índices de recursos
 * 
 * Este script escanea las carpetas de recursos (HTML, PDF, imágenes) y genera
 * archivos index.json con la información de los archivos encontrados.
 * 
 * Uso:
 *    node generate_resource_indexes.js
 * 
 * El script debe ejecutarse desde la raíz del proyecto.
 */

const fs = require('fs');
const path = require('path');

// Configuración de carpetas
const RESOURCE_FOLDERS = {
    'html': 'activities/html',
    'pdf': 'activities/pdf',
    'image': 'activities/images'
};

/**
 * Obtiene información sobre un archivo
 * @param {string} filePath - Ruta del archivo
 * @returns {Object} - Información del archivo
 */
function getFileInfo(filePath) {
    const stats = fs.statSync(filePath);
    return {
        name: path.basename(filePath),
        size: stats.size,
        lastModified: stats.mtime.toISOString()
    };
}

/**
 * Escanea una carpeta y devuelve información sobre los archivos
 * @param {string} folderPath - Ruta de la carpeta
 * @returns {Array} - Lista de información de archivos
 */
function scanFolder(folderPath) {
    const files = [];
    
    // Verificar si la carpeta existe
    if (!fs.existsSync(folderPath)) {
        console.log(`La carpeta ${folderPath} no existe. Creándola...`);
        fs.mkdirSync(folderPath, { recursive: true });
        return files;
    }
    
    // Escanear archivos en la carpeta
    const fileNames = fs.readdirSync(folderPath);
    
    for (const fileName of fileNames) {
        const filePath = path.join(folderPath, fileName);
        
        // Ignorar carpetas y archivos index.json
        if (fs.statSync(filePath).isDirectory() || fileName === 'index.json') {
            continue;
        }
        
        // Obtener información del archivo
        const fileInfo = getFileInfo(filePath);
        files.push(fileInfo);
    }
    
    return files;
}

/**
 * Genera un archivo index.json para una carpeta de recursos
 * @param {string} folderType - Tipo de carpeta
 * @param {string} folderPath - Ruta de la carpeta
 * @param {boolean} verbose - Mostrar información detallada
 * @returns {number} - Número de archivos indexados
 */
function generateIndex(folderType, folderPath, verbose = false) {
    if (verbose) {
        console.log(`Escaneando carpeta ${folderPath}...`);
    }
    
    // Escanear carpeta
    const files = scanFolder(folderPath);
    
    if (verbose) {
        console.log(`Se encontraron ${files.length} archivos en ${folderPath}`);
    }
    
    // Crear objeto de índice
    const index = {
        files: files,
        lastUpdated: new Date().toISOString()
    };
    
    // Guardar archivo de índice
    const indexPath = path.join(folderPath, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
    
    if (verbose) {
        console.log(`Archivo de índice generado: ${indexPath}`);
    }
    
    return files.length;
}

/**
 * Función principal
 */
function main() {
    // Procesar argumentos
    const args = process.argv.slice(2);
    const verbose = args.includes('-v') || args.includes('--verbose');
    
    console.log("=== Generador de índices de recursos ===");
    
    let totalFiles = 0;
    
    // Generar índices para cada carpeta de recursos
    for (const [folderType, folderPath] of Object.entries(RESOURCE_FOLDERS)) {
        try {
            const fileCount = generateIndex(folderType, folderPath, verbose);
            totalFiles += fileCount;
        } catch (error) {
            console.error(`Error al generar índice para ${folderPath}: ${error.message}`);
        }
    }
    
    console.log(`Se indexaron ${totalFiles} archivos en total.`);
    console.log("Proceso completado.");
}

// Ejecutar función principal
main();
