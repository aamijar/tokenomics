#!/usr/bin/env python3
import sqlite3

def check_database():
    conn = sqlite3.connect('tokenomics.db')
    cursor = conn.cursor()
    
    print('=== USERS ===')
    cursor.execute('SELECT id, username, email FROM users ORDER BY id')
    for row in cursor.fetchall():
        print(f'ID: {row[0]}, Username: {row[1]}, Email: {row[2]}')

    print('\n=== TOKENS ===')
    cursor.execute('SELECT u.username, t.token_type, t.balance FROM users u JOIN tokens t ON u.id = t.user_id ORDER BY u.username, t.token_type')
    for row in cursor.fetchall():
        print(f'User: {row[0]}, Token: {row[1]}, Balance: {row[2]}')

    print('\n=== API KEYS ===')
    cursor.execute('SELECT u.username, s.token_type, s.user_type, s.is_active FROM users u JOIN seller_api_keys s ON u.id = s.user_id ORDER BY u.username')
    for row in cursor.fetchall():
        print(f'User: {row[0]}, Token: {row[1]}, Type: {row[2]}, Active: {row[3]}')

    print('\n=== ORDERS ===')
    cursor.execute('SELECT u.username, o.from_token, o.to_token, o.amount, o.status FROM users u JOIN orders o ON u.id = o.user_id ORDER BY o.id')
    for row in cursor.fetchall():
        print(f'User: {row[0]}, From: {row[1]}, To: {row[2]}, Amount: {row[3]}, Status: {row[4]}')

    print('\n=== TRANSACTIONS ===')
    cursor.execute('SELECT u.username, th.token_type, th.amount, th.transaction_type, th.description FROM users u JOIN transaction_history th ON u.id = th.user_id ORDER BY th.created_at')
    for row in cursor.fetchall():
        print(f'User: {row[0]}, Token: {row[1]}, Change: {row[2]}, Type: {row[3]}, Desc: {row[4]}')

    conn.close()

if __name__ == "__main__":
    check_database()
