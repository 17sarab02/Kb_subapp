from fastapi import FastAPI, Depends, HTTPException
from fastapi.websockets import WebSocket
from starlette.middleware.cors import CORSMiddleware
import json
import sqlite3
import random

conn = sqlite3.connect('./user_database.db')
cursor = conn.cursor()
app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

cursor.execute(f"""SELECT * FROM sqlite_master where type='table' AND tbl_name='knowledge_base';""")
table_data = cursor.fetchall()
if len(table_data) <= 0:
    print('Creating table')
    cursor.execute(f"""CREATE TABLE knowledge_base (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    category TEXT,
    file_list TEXT,
    created_by INTEGER,
    default_behavior BOOLEAN,
    exceptions TEXT,
    FOREIGN KEY(created_by) REFERENCES users(id));""")

def parseArticle(article_tuple):
    return {
        'id': article_tuple[0],
        'title': article_tuple[1],
        'description': article_tuple[2],
        'category': article_tuple[3],
        'file_list': article_tuple[4],
        'created_by': article_tuple[5],
        'default_behavior': 'restricted' if article_tuple[6] == 'false' else 'allowed',
        'exceptions': article_tuple[7]
    }

@app.websocket('/kb/search')
async def searchQuery(websocket: WebSocket):
    await websocket.accept()
    cursor.execute(f"""SELECT * FROM knowledge_base WHERE title IS NOT NULL and title <> '' LIMIT 20;""")
    await websocket.send_text(json.dumps([parseArticle(ourArticle) for ourArticle in cursor.fetchall()]))
    while True:
        searchTerms = await websocket.receive_text()
        print(searchTerms)
        cursor.execute(f"""SELECT * FROM knowledge_base WHERE LOWER(title) LIKE LOWER('%{searchTerms}%') OR LOWER(description) LIKE LOWER('%{searchTerms}%');""")
        await websocket.send_text(json.dumps([parseArticle(ourArticle) for ourArticle in cursor.fetchall()]))

@app.post("/kb/view/{kbID}")
async def view_article(kbID: str):
    try:
        kbID = int(kbID[2:])
        cursor.execute(f'SELECT * from knowledge_base WHERE id={kbID}')
        ourArticle = cursor.fetchone()
        return {
            'Status': 'Success',
            'Message': 'Article Found',
            'Article': parseArticle(ourArticle)
        }
    except:
        return{
            'Status': 'Failure',
            'Message': 'Article Not Found'
        }

@app.post("/kb/delete/{kbID}")
async def delete_article(kbID: str):
    try:
        kbID = int(kbID[2:])
        cursor.execute(f'DELETE FROM knowledge_base WHERE id={kbID}')
        conn.commit()
        return {
            'Status': 'Success',
            'Message': 'Article Deleted'
            }
    except:
        return{
            'Status': 'Failure',
            'Message': 'Article Could Not Be Deleted'
        }

@app.post("/kb/create")
async def create_article(kbArticle: dict):
        query = f"""INSERT INTO knowledge_base (title, description, category, file_list, created_by, default_behavior, exceptions) VALUES ("{kbArticle['title']}", "{kbArticle['description']}", "{kbArticle['category']}", "[]", {kbArticle['userID']}, "{'true' if kbArticle['default_behavior']=='allowed' else 'false'}", "{kbArticle['exceptions']}");"""
        print(query)
        cursor.execute(query)
        conn.commit()
        article_id = cursor.lastrowid
        cursor.execute(f'SELECT * from knowledge_base WHERE id={article_id}')
        ourArticle = cursor.fetchone()
        return {
            'Status': 'Success',
            'Message': 'Article Added',
            'Article': parseArticle(ourArticle)
        }

@app.post("/kb/update/{kbID}")
async def update_article(kbArticle: dict, kbID: str):
    try:
        kbID = int(kbID[2:])
        conditions = ', '.join([f"{field}='{kbArticle[field]}'" for field in kbArticle.keys()])
        query = f"""UPDATE knowledge_base SET {conditions} WHERE id={kbID}"""
        cursor.execute(query)
        query = f"""DELETE FROM knowledge_base WHERE title=''"""
        cursor.execute(query)
        conn.commit()
        return {
            'Status': 'Success',
            'Message': 'Article Updated Successfully'
        }
    except:
        return {
            'Status': 'Failure',
            'Message': 'Article could not be updated'
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)