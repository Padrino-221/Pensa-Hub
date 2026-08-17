from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import MemberTypeEnum, RoleEnum, TransactionTypeEnum, AttendanceStatusEnum


class LoginRequest(BaseModel):
    email: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1, max_length=200)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    full_name: str
    email: str
    phone: str
    role: RoleEnum
    is_active: bool
    created_by: str | None


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str
    role: RoleEnum


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    role: RoleEnum | None = None
    is_active: bool | None = None
    password: str | None = Field(default=None, min_length=6)


class MemberBase(BaseModel):
    full_name: str
    phone: str
    email: str | None = None
    date_joined: date


class MemberCreate(MemberBase):
    member_type: MemberTypeEnum
    program_of_study: str | None = None
    level: int | None = Field(default=None, ge=100, le=400)
    graduation_year: int | None = None
    occupation: str | None = None


class MemberUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    email: str | None = None
    program_of_study: str | None = None
    level: int | None = Field(default=None, ge=100, le=400)
    graduation_year: int | None = None
    occupation: str | None = None
    date_joined: date | None = None
    is_active: bool | None = None


class MemberOut(MemberBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    member_type: MemberTypeEnum
    program_of_study: str | None
    level: int | None
    graduation_year: int | None
    occupation: str | None
    is_active: bool
    added_by: str


class AttendanceSessionCreate(BaseModel):
    date: date
    service_type: str
    title: str | None = None


class AttendanceSessionUpdate(BaseModel):
    title: str | None = None
    total_attendance: int | None = Field(default=None, ge=0)
    total_males: int | None = Field(default=None, ge=0)
    total_females: int | None = Field(default=None, ge=0)
    speaker: str | None = None
    topic: str | None = None
    challenges: str | None = None
    attitude_of_executives: str | None = None
    remarks: str | None = None


class AttendanceSessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    date: date
    service_type: str
    title: str | None
    total_attendance: int | None
    total_males: int | None
    total_females: int | None
    speaker: str | None
    topic: str | None
    challenges: str | None
    attitude_of_executives: str | None
    remarks: str | None
    recorded_by: str
    created_at: datetime


class AttendanceRecordCreate(BaseModel):
    member_id: str
    status: AttendanceStatusEnum = AttendanceStatusEnum.present


class AttendanceRecordUpdate(BaseModel):
    status: AttendanceStatusEnum


class AttendanceRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    session_id: str
    member_id: str
    status: AttendanceStatusEnum
    checked_in_at: datetime | None


class TransactionBase(BaseModel):
    type: TransactionTypeEnum
    amount: Decimal
    description: str | None = None
    transaction_date: date


class TransactionCreate(TransactionBase):
    member_id: str | None = None


class TransactionUpdate(BaseModel):
    type: TransactionTypeEnum | None = None
    amount: Decimal | None = None
    description: str | None = None
    transaction_date: date | None = None
    member_id: str | None = None


class TransactionOut(TransactionBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    member_id: str | None
    recorded_by: str
    created_at: datetime


class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    action: str
    target_table: str | None
    target_id: str | None
    timestamp: datetime


class Message(BaseModel):
    detail: str


class SiteSettingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    section: str
    value: str
    updated_by: str | None
    updated_at: datetime


class SiteSettingUpdate(BaseModel):
    value: str


class ContactMessageCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    subject: str = Field(min_length=1, max_length=300)
    message: str = Field(min_length=1, max_length=5000)


class ContactMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: str
    subject: str
    message: str
    is_read: bool
    created_at: datetime