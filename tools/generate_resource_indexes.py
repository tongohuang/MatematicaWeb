#!/usr/bin/env python3
"""
Generador de índices de recursos

Este script escanea las carpetas de recursos (HTML, PDF, imágenes) y genera
archivos index.json con la información de los archivos encontrados.

Uso:
    python generate_resource_indexes.py

El script debe ejecutarse desde la raíz del proyecto.
"""

import os
import json
import datetime
import argparse
from pathlib import Path

# Configuración de carpetas
RESOURCE_FOLDERS = {
    'html': 'activities/html',
    'pdf': 'activities/pdf',
    'image': 'activities/images'
}

def get_file_info(file_path):
    """Obtiene información sobre un archivo"""
    stats = os.stat(file_path)
    return {
        'name': os.path.basename(file_path),
        'size': stats.st_size,
        'lastModified': datetime.datetime.fromtimestamp(stats.st_mtime).isoformat()
    }

def scan_folder(folder_path):
    """Escanea una carpeta y devuelve información sobre los archivos"""
    files = []
    
    # Verificar si la carpeta existe
    if not os.path.exists(folder_path):
        print(f"La carpeta {folder_path} no existe. Creándola...")
        os.makedirs(folder_path, exist_ok=True)
        return files
    
    # Escanear archivos en la carpeta
    for file_name in os.listdir(folder_path):
        file_path = os.path.join(folder_path, file_name)
        
        # Ignorar carpetas y archivos index.json
        if os.path.isdir(file_path) or file_name == 'index.json':
            continue
        
        # Obtener información del archivo
        file_info = get_file_info(file_path)
        files.append(file_info)
    
    return files

def generate_index(folder_type, folder_path, verbose=False):
    """Genera un archivo index.json para una carpeta de recursos"""
    if verbose:
        print(f"Escaneando carpeta {folder_path}...")
    
    # Escanear carpeta
    files = scan_folder(folder_path)
    
    if verbose:
        print(f"Se encontraron {len(files)} archivos en {folder_path}")
    
    # Crear objeto de índice
    index = {
        'files': files,
        'lastUpdated': datetime.datetime.now().isoformat()
    }
    
    # Guardar archivo de índice
    index_path = os.path.join(folder_path, 'index.json')
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2)
    
    if verbose:
        print(f"Archivo de índice generado: {index_path}")
    
    return len(files)

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description='Generador de índices de recursos')
    parser.add_argument('-v', '--verbose', action='store_true', help='Mostrar información detallada')
    args = parser.parse_args()
    
    print("=== Generador de índices de recursos ===")
    
    total_files = 0
    
    # Generar índices para cada carpeta de recursos
    for folder_type, folder_path in RESOURCE_FOLDERS.items():
        try:
            file_count = generate_index(folder_type, folder_path, args.verbose)
            total_files += file_count
        except Exception as e:
            print(f"Error al generar índice para {folder_path}: {e}")
    
    print(f"Se indexaron {total_files} archivos en total.")
    print("Proceso completado.")

if __name__ == '__main__':
    main()
