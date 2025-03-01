package request

import "github.com/google/uuid"

type AddItemToCartRequest struct {
	SnackID  uuid.UUID `json:"snack_id" validate:"required"`
	Quantity int       `json:"quantity" validate:"required,min=1"`
}

type UpdateItemFromCartRequest struct {
	ItemID   uuid.UUID `json:"item_id" validate:"required"`
	SnackID  uuid.UUID `json:"snack_id" validate:"required"`
	Quantity int       `json:"quantity" validate:"required,min=1"`
}

type ConfirmCartRequest struct {
	CartID uuid.UUID `json:"cart_id" validate:"required"`
}
