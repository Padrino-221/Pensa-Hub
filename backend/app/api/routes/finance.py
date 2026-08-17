from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.core.database import get_db
from app.models import RoleEnum, Transaction, TransactionTypeEnum, User
from app.schemas import TransactionCreate, TransactionOut, TransactionUpdate
from app.services import audit

router = APIRouter(prefix="/finance", tags=["finance"])

# Per matrix: Finance Secretary has exclusive CRUD; everyone except IT Head can view.
CRUD_ROLES = {RoleEnum.finance_secretary}
VIEW_ROLES = {
    RoleEnum.super_admin,
    RoleEnum.admin_student,
    RoleEnum.admin_alumni,
    RoleEnum.finance_secretary,
}


@router.post("/transactions", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*CRUD_ROLES)),
):
    transaction = Transaction(
        member_id=payload.member_id,
        type=payload.type,
        amount=payload.amount,
        description=payload.description,
        recorded_by=current_user.id,
        transaction_date=payload.transaction_date,
    )
    db.add(transaction)
    audit.log(db, current_user.id, "finance.transaction_created", "transactions", transaction.id)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.get("/transactions", response_model=list[TransactionOut])
def list_transactions(
    type: TransactionTypeEnum | None = Query(default=None),
    member_id: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*VIEW_ROLES)),
):
    q = db.query(Transaction)
    if type:
        q = q.filter(Transaction.type == type)
    if member_id:
        q = q.filter(Transaction.member_id == member_id)
    return q.order_by(Transaction.transaction_date.desc()).all()


@router.get("/transactions/{transaction_id}", response_model=TransactionOut)
def get_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*VIEW_ROLES)),
):
    transaction = db.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return transaction


@router.patch("/transactions/{transaction_id}", response_model=TransactionOut)
def update_transaction(
    transaction_id: str,
    payload: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*CRUD_ROLES)),
):
    transaction = db.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(transaction, field, value)
    audit.log(db, current_user.id, "finance.transaction_updated", "transactions", transaction.id)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*CRUD_ROLES)),
):
    transaction = db.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    db.delete(transaction)
    audit.log(db, current_user.id, "finance.transaction_deleted", "transactions", transaction.id)
    db.commit()


@router.get("/reports/summary")
def financial_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*VIEW_ROLES)),
):
    income_types = [
        TransactionTypeEnum.tithe,
        TransactionTypeEnum.offering,
        TransactionTypeEnum.dues,
    ]
    income = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(Transaction.type.in_(income_types))
        .scalar()
    )
    expenses = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(Transaction.type == TransactionTypeEnum.expense)
        .scalar()
    )

    by_type = {
        t.value: db.query(func.coalesce(func.sum(Transaction.amount), Decimal("0")))
        .filter(Transaction.type == t)
        .scalar()
        for t in TransactionTypeEnum
    }

    return {
        "total_income": income,
        "total_expenses": expenses,
        "balance": income - expenses,
        "by_type": {k: str(v) for k, v in by_type.items()},
    }