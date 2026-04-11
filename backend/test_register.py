from db.database import SessionLocal
from db.models import User
db = SessionLocal()
try:
    db.query(User).filter(User.email == "t@m.com").first()
    print("USER QUERY WORKED!")
except Exception as e:
    import traceback
    traceback.print_exc()
