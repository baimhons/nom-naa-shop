package models

import (
	"github.com/google/uuid"
)

type Item struct {
	BaseModel
	SnackID  uuid.UUID `gorm:"not null"`
	Snack    Snack     `gorm:"foreignKey:SnackID"`
	Quantity int       `gorm:"not null"`
	CartID   uuid.UUID `gorm:"not null"`
}
