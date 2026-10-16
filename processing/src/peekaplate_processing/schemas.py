from decimal import Decimal
from typing import Annotated, Literal
from pydantic import BaseModel, ConfigDict, Field



NonEmptyText = Annotated[str, Field(min_length=1)]


class DishDraft(BaseModel):

    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
        validate_assignment=True,
    )

    name:str=Field(min_length=1, max_length=160)
    description:str|None=Field(default=None, min_length=1, max_length=4000)
    category:NonEmptyText|None=None

    price_amount:Decimal|None=Field(
        default=None,
        ge=0,
        allow_inf_nan=False,
    )
    price_currency:str|None=Field(
        default=None,
        pattern=r"^[A-Z]{3}$",
    )

    ingredients:list[NonEmptyText]|None=None

    source_id:NonEmptyText
    source_text:NonEmptyText
    image_id:NonEmptyText|None=None

    review_warnings:list[NonEmptyText]=Field(default_factory=list)
    status:Literal["needs_review"]="needs_review"
