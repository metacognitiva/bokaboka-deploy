#!/usr/bin/env python3
"""
Script para importar dados do Manus DB (formato JSON) para MySQL
"""
import json
import mysql.connector
import os
from pathlib import Path

# Configurações do banco de dados
DB_CONFIG = {
    'host': 'localhost',
    'user': 'bokaboka',
    'password': 'bokaboka123',
    'database': 'bokaboka'
}

# Diretório com os arquivos JSON do Manus
MANUS_DB_DIR = Path('/home/ubuntu/bokaboka/.manus/db')

def connect_db():
    """Conecta ao banco de dados MySQL"""
    return mysql.connector.connect(**DB_CONFIG)

def parse_value(value):
    """Converte valores do JSON para formato MySQL"""
    if value == "NULL" or value is None:
        return None
    return value

def import_data_from_json(json_file):
    """Importa dados de um arquivo JSON do Manus"""
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'rows' not in data:
            return 0
        
        rows = data['rows']
        if not rows:
            return 0
        
        # Detectar tabela baseado no conteúdo
        first_row = rows[0]
        table_name = None
        
        # Identificar tabela pelos campos
        if 'displayName' in first_row and 'category' in first_row:
            table_name = 'professionals'
        elif 'professionalId' in first_row and 'rating' in first_row:
            table_name = 'reviews'
        elif 'elements' in first_row and 'backgroundColor' in first_row:
            table_name = 'stories'
        elif 'openId' in first_row and 'userType' in first_row:
            table_name = 'users'
        elif 'name' in first_row and 'icon' in first_row and 'displayOrder' in first_row:
            table_name = 'categories'
        
        if not table_name:
            return 0
        
        conn = connect_db()
        cursor = conn.cursor()
        
        imported_count = 0
        
        for row in rows:
            # Preparar campos e valores
            fields = list(row.keys())
            values = [parse_value(row[field]) for field in fields]
            
            # Construir query INSERT com ON DUPLICATE KEY UPDATE
            placeholders = ', '.join(['%s'] * len(fields))
            fields_str = ', '.join([f'`{field}`' for field in fields])
            
            # Para UPDATE, usar todos os campos exceto id
            update_parts = [f'`{field}`=VALUES(`{field}`)' for field in fields if field != 'id']
            update_str = ', '.join(update_parts)
            
            query = f"""
                INSERT INTO {table_name} ({fields_str})
                VALUES ({placeholders})
                ON DUPLICATE KEY UPDATE {update_str}
            """
            
            try:
                cursor.execute(query, values)
                imported_count += 1
            except mysql.connector.Error as e:
                print(f"Erro ao inserir em {table_name}: {e}")
                continue
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return imported_count
        
    except Exception as e:
        print(f"Erro ao processar {json_file}: {e}")
        return 0

def main():
    """Função principal"""
    print("🚀 Iniciando importação de dados do Manus DB...")
    
    # Listar todos os arquivos JSON de query (não de erro)
    json_files = sorted([
        f for f in MANUS_DB_DIR.glob('db-query-*.json')
        if 'error' not in f.name
    ])
    
    print(f"📁 Encontrados {len(json_files)} arquivos de query")
    
    total_imported = 0
    tables_imported = {}
    
    for json_file in json_files:
        count = import_data_from_json(json_file)
        if count > 0:
            total_imported += count
            table = json_file.stem
            tables_imported[table] = tables_imported.get(table, 0) + count
    
    print(f"\n✅ Importação concluída!")
    print(f"📊 Total de registros importados: {total_imported}")
    
    if tables_imported:
        print("\n📋 Resumo por arquivo:")
        for table, count in sorted(tables_imported.items()):
            print(f"   - {table}: {count} registros")
    
    # Verificar dados importados
    conn = connect_db()
    cursor = conn.cursor()
    
    print("\n📈 Contagem de registros nas tabelas:")
    tables = ['professionals', 'users', 'reviews', 'stories', 'categories']
    for table in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"   - {table}: {count} registros")
        except:
            pass
    
    cursor.close()
    conn.close()

if __name__ == '__main__':
    main()
