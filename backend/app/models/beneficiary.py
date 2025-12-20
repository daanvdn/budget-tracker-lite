from sqlalchemy import Column, Integer, String
from app.database.database import Base


class Beneficiary(Base):
    __tablename__ = "beneficiaries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
