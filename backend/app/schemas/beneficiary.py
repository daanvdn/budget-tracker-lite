from pydantic import BaseModel
from typing import Optional


class BeneficiaryCreate(BaseModel):
    name: str


class BeneficiaryUpdate(BaseModel):
    name: Optional[str] = None


class BeneficiaryResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True
