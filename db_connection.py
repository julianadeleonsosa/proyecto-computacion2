# ============================================================
#  db_connection.py — Conexión a MySQL
# ============================================================
import mysql.connector
from mysql.connector import Error
import os

DB_CONFIG = {
    'host':     os.getenv('DB_HOST',     'localhost'),
    'port':     int(os.getenv('DB_PORT', '3306')),
    'user':     os.getenv('DB_USER',     'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME',     'penca_mundial2026'),
    'charset':  'utf8mb4',
    'autocommit': True,
}

_connection = None

def get_connection():
    global _connection
    try:
        if _connection is None or not _connection.is_connected():
            _connection = mysql.connector.connect(**DB_CONFIG)
    except Error as e:
        print(f"[DB ERROR] {e}")
        raise
    return _connection

def get_cursor(dictionary=True):
    return get_connection().cursor(dictionary=dictionary)

def close():
    global _connection
    if _connection and _connection.is_connected():
        _connection.close()
        _connection = None
