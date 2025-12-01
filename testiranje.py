from sqlalchemy import inspect
from app.database import engine

inspector = inspect(engine)
print("Finalna lista tabela:", inspector.get_table_names())  # Sada bi trebalo da pokaže sve