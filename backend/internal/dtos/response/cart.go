package response

import (
	"github.com/baimhons/nom-naa-shop.git/internal/models"
	"github.com/google/uuid"
)

type CartResponse struct {
	ID     uuid.UUID     `json:"id"`
	UserID uuid.UUID     `json:"user_id"`
	Items  []models.Item `json:"items"`
}
