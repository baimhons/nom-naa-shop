package request

import "github.com/google/uuid"

type CreateReviewRequest struct {
	SnackID uuid.UUID `json:"snack_id" validate:"required"`
	Rating  int       `json:"rating" validate:"required"`
	Comment string    `json:"comment" validate:"required"`
}
