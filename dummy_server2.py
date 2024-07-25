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
kb_columns = ['id', 'title', 'description', 'content', 'category', 'file_list', 'created_by', 'default_behavior', 'exceptions']
# CHECKING IF knowledge_base TABLE EXISTS
cursor.execute(f"""SELECT * FROM sqlite_master where type='table' AND tbl_name='knowledge_base';""")
table_data = cursor.fetchall()
# CREATING IF IT DOESN'T EXIST ALREADY
if len(table_data) <= 0:
    cursor.execute(f"""CREATE TABLE knowledge_base (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    content TEXT,
    category TEXT,
    file_list TEXT DEFAULT '[]',
    created_by INTEGER NOT NULL,
    default_behavior BOOLEAN DEFAULT 1,
    exceptions TEXT DEFAULT '[]',
    FOREIGN KEY(created_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE);""")
    conn.commit()

# PARSING ARTICLE FROM TUPLE RETURNED BY SQL
def parsed_article(article_tuple):
    parsed_article_object = dict()
    for column, value in zip(kb_columns, article_tuple):
        if(value):
            parsed_article_object.update({column: value})
    return parsed_article_object

def create_article(article_dict):
    try:
        # CREATING AN ARTICLE
        columns = ', '.join(f"'{value}'" for value in article_dict.keys())
        new_values = ', '.join(f'"{value}"' for value in article_dict.values())
        cursor.execute(f"""INSERT INTO knowledge_base ({columns}) VALUES ({new_values});""")
        conn.commit()
        # FETCHING AND RETURNING THE LAST INSERTED ITEM
        article_id = cursor.lastrowid
        cursor.execute(f'SELECT * from knowledge_base WHERE id={article_id}')
        results = cursor.fetchone()
        return {
            'status': 'Success',
            'message': 'Article created successfully',
            'article': parsed_article(results)
        }
    # ANY ERRORS ENCOUNTERED IN GENERAL    
    except Exception as e:
        return {
            'status': 'Failure',
            'message': e.args[0]
        }

def delete_article(article_id):
    try:
        # DELETING AN ARTICLE
        cursor.execute(f"""DELETE FROM knowledge_base WHERE id='{article_id}'""")
        conn.commit()
        return {
            'status': 'Success',
            'message': 'Article deleted successfully'
        }
    # ANY ERRORS ENCOUNTERED IN GENERAL
    except Exception as e:
        return {
            'status': 'Failure',
            'message': e.args[0]
        }

def return_article(article_id):
    try:
        # FINDING THE ARTICLE
        cursor.execute(f"""SELECT * FROM knowledge_base WHERE id='{article_id}'""")
        results = cursor.fetchone()
        # IF THE ARTICLE EXISTS, RETURN IT
        if results:
            return {
                'status': 'Success',
                'message': 'Article fetched successfully',
                'article': parsed_article(results)
            }
        # OTHERWISE RAISE AN ERROR, STATING THAT IT DOESN'T EXIST
        else:
            raise Exception(f"No article with id-{article_id}")
    # ANY ERRORS ENCOUNTERED IN GENERAL
    except Exception as e:
        return {
            'status': 'Failure',
            'message': e.args[0]
        }

def update_article(article_id, article_dict):
    try:
        # UPDATING THE ARTICLE
        new_values = ', '.join([f'{field}="{article_dict[field]}"' for field in article_dict.keys()])
        cursor.execute(f"""UPDATE knowledge_base SET {new_values} WHERE id={article_id}""")
        conn.commit()
        # RETURNING THE ARTICLE
        cursor.execute(f"""SELECT * FROM knowledge_base WHERE id={article_id}""")
        results = cursor.fetchone()
        return {
            'status': 'Success',
            'message': 'Article fetched successfully',
            'article': parsed_article(results)
        }
    # ANY ERRORS ENCOUNTERED IN GENERAL
    except Exception as e:
        return {
            'status': 'Failure',
            'message': e.args[0]
        }

def user_blank_record(user_id):
    try:
        cursor.execute(f"""SELECT * from knowledge_base where title IS NULL and created_by={user_id}""")
        results = cursor.fetchone()
        if(len(results) > 0):
            return {
                'status': 'Success',
                'message': 'Returned blank record for user',
                'article': parsed_article(results)
            }
        else:
            blank_created_article = create_article({'created_by': user_id})
            return {
                'status': 'Success',
                'message': 'Made a blank record for the user',
                'article': blank_created_article['article']
            }
    except Exception as e:
        return {
            'status': 'Failure',
            'message': e.args[0]
        }

default_page_no = 1
default_per_page = 20
def page_filtered_results(search_query='', page_no=default_page_no, per_page=default_per_page):
    cursor.execute(f"""SELECT * FROM knowledge_base 
    WHERE title IS NOT NULL AND title <> '' 
    AND 
    (LOWER(title) LIKE LOWER('%{search_query}%') OR
    LOWER(description) LIKE LOWER('%{search_query}%') OR
    LOWER(content) LIKE LOWER('%{search_query}%') OR
    LOWER(printf('KB%05d', id)) LIKE LOWER('%{search_query}%'))
    LIMIT {per_page} OFFSET {(page_no-1) * per_page};""")
    results = cursor.fetchall()
    return [parsed_article(result) for result in results]

@app.websocket('/kb/search')
async def search_function(websocket: WebSocket):
    page_no = default_page_no
    per_page = default_per_page
    await websocket.accept()
    await websocket.send_json({'results' : page_filtered_results('', page_no, per_page)})
    while True:
        search_query = await websocket.receive_json()
        if 'page_no' in search_query.keys():
            page_no = search_query['per_page']
        if 'per_page' in search_query.keys():
            per_page = search_query['per_page']
        await websocket.send_json({'results' : page_filtered_results(search_query['query'], page_no, per_page)})

@app.get("/kb/page_count")
async def page_count():
    try:
        cursor.execute('SELECT COUNT(*) from knowledge_base')
        return cursor.fetchone()[0]
    except:
        return 1

@app.post("/kb/view/{kb_id}")
async def view_article(kb_id: str):
    try:
        kb_id = int(kb_id[2:])
        return return_article(kb_id)
    except:
        return{
            'status': 'Failure',
            'message': 'Error in processing request'
        }

@app.post("/kb/delete/{kbID}")
async def delete_article(kb_id: str):
    try:
        kb_id = int(kb_id[2:])
        return delete_article(kb_id)
    except:
        return{
            'status': 'Failure',
            'message': 'Error in processing request'
        }

@app.post("/kb/create")
async def create_article(kb_article: dict):
    try:
        return create_article_article(kb_article)
    except:
        return{
            'status': 'Failure',
            'message': 'Error in processing request'
        }

@app.post("/kb/blank_record")
async def create_blank(user_id: int):
    try:
        return user_blank_record(kb_article)
    except:
        return{
            'status': 'Failure',
            'message': 'Error in processing request'
        }

@app.post("/kb/update/{kb_id}")
async def update_article(kb_article: dict, kb_id: str):
    try:
        kb_id = int(kb_id[2:])
        return update_article(kb_id, kb_article)
    except:
        return{
            'status': 'Failure',
            'message': 'Error in processing request'
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)