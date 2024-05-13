from fastapi import FastAPI, File, UploadFile, Form, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os
from typing import Optional
import uuid
import sqlite3

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Create the "uploads" directory if it doesn't exist
uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
app.mount(f"/{uploads_dir}", StaticFiles(directory=uploads_dir), name="uploads")

# Create a SQLite database to store image and location data
db_file = "data.db"
if not os.path.exists(db_file):
    conn = sqlite3.connect(db_file)
    c = conn.cursor()
    c.execute("""CREATE TABLE images
                  (id INTEGER PRIMARY KEY AUTOINCREMENT, file_name TEXT, file_path TEXT, location TEXT)""")
    conn.commit()
    conn.close()

@app.get("/")
def read_index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/upload")
def read_upload(request: Request, type: str = None):
    return templates.TemplateResponse("upload.html", {"request": request, "type": type})

@app.post("/upload/image")
async def upload_image(file: UploadFile = File(...), location: Optional[str] = Form(None)):
    print(f"Received file: {file.filename}")
    if location:
        print(f"Received location: {location}")
    if file.filename:
        file_extension = file.filename.split(".")[-1]
        file_name = f"{uuid.uuid4().hex}.{file_extension}"
        file_path = os.path.join(uploads_dir, file_name)
        with open(file_path, "wb") as buffer:
            contents = await file.read()
            buffer.write(contents)
        if location:
            conn = sqlite3.connect(db_file)
            c = conn.cursor()
            c.execute("INSERT INTO images (file_name, file_path, location) VALUES (?, ?, ?)",
                      (file_name, file_path, location))
            conn.commit()
            conn.close()
            print(f"Location: {location}")
            return {"message": "File uploaded successfully", "detail": location, "file_path": f"/{uploads_dir}/{file_name}"}
        else:
            return {"message": "File uploaded successfully", "file_path": f"/{uploads_dir}/{file_name}"}
    else:
        return {"message": "No file was provided"}

@app.get("/uploads")
def get_uploads():
    conn = sqlite3.connect(db_file)
    c = conn.cursor()
    c.execute("SELECT file_name, file_path, location FROM images")
    data = c.fetchall()
    conn.close()
    return [{"file_name": row[0], "file_path": row[1], "location": row[2]} for row in data]