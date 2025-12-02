from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


# startups → only accepted applications, minimal doc
class Startup(BaseModel):
    id: str = Field(alias="_id")
    applicationId: str  # foreign-key style reference to applications._id
    companyName: str

    # Business fields requested (names chosen to match the list)
    industry: Optional[str] = None
    location: Optional[str] = None
    founderName: Optional[str] = None
    founderContact: Optional[str] = None
    round: Optional[str] = None
    amountRaising: Optional[str] = None
    valuation: Optional[str] = None
    status: Optional[str] = None
    dealLead: Optional[str] = None
    dateAdded: Optional[datetime] = None
    source: Optional[str] = None
    summary: Optional[str] = None
    notes: Optional[str] = None
    deckLink: Optional[str] = None
    cplLink: Optional[str] = None  # CPL link (was commonplaceNotesLink)
    keyInsight: Optional[str] = None
    nextAction: Optional[str] = None
    reminderDate: Optional[datetime] = None

    # existing technical fields
    dateAccepted: datetime
    context: Optional[Dict[str, Any]] = None
    vc_notes: Optional[str] = None

    class Config:
        validate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }


class StartupCreate(BaseModel):
    applicationId: str
    companyName: str

    # Allow providing business fields on create (optional except the two required above)
    industry: Optional[str] = None
    location: Optional[str] = None
    founderName: Optional[str] = None
    founderContact: Optional[str] = None
    round: Optional[str] = None
    amountRaising: Optional[str] = None
    valuation: Optional[str] = None
    status: Optional[str] = None
    dealLead: Optional[str] = None
    dateAdded: Optional[datetime] = None
    source: Optional[str] = None
    summary: Optional[str] = None
    notes: Optional[str] = None
    deckLink: Optional[str] = None
    cplLink: Optional[str] = None
    keyInsight: Optional[str] = None
    nextAction: Optional[str] = None
    reminderDate: Optional[datetime] = None

    context: Optional[Dict[str, Any]] = None
    dateAccepted: datetime


class StartupUpdate(BaseModel):
    # make all updatable business fields optional for partial updates
    companyName: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    founderName: Optional[str] = None
    founderContact: Optional[str] = None
    round: Optional[str] = None
    amountRaising: Optional[str] = None
    valuation: Optional[str] = None
    status: Optional[str] = None
    dealLead: Optional[str] = None
    dateAdded: Optional[datetime] = None
    source: Optional[str] = None
    summary: Optional[str] = None
    notes: Optional[str] = None
    deckLink: Optional[str] = None
    cplLink: Optional[str] = None
    keyInsight: Optional[str] = None
    nextAction: Optional[str] = None
    reminderDate: Optional[datetime] = None

    context: Optional[Dict[str, Any]] = None
    dateAccepted: Optional[datetime] = None
