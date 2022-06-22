from flask_login import UserMixin
from sqlalchemy import Column, Integer, String
from werkzeug.security import generate_password_hash, check_password_hash

from asreview.auth.database import Base

class User(UserMixin, Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True)
    hashed_password = Column(String(100), unique=True)

    def __init__(self, username=None, password=None):
        self.username = username
        self.hashed_password = generate_password_hash(password)

    def verify_password(self, password):
        return check_password_hash(self.hashed_password, password)

    def __repr__(self):
        return f'<User {self.username!r}>'






