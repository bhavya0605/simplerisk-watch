from db.database import SessionLocal
from db.models import User
from api.auth_utils import get_password_hash
db = SessionLocal()
try:
    pwd = get_password_hash("testpass")
    u = User(email="test@example.com", hashed_password=pwd)
    db.add(u)
    db.commit()
    print("SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.query(User).filter(User.email=="test@example.com").delete()
    db.commit()
