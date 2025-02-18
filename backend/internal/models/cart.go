package models

import (
	"github.com/google/uuid"
)

type Cart struct {
	BaseModel
	Items     []Item    `gorm:"foreignKey:CartID"`
	UserID    uuid.UUID `gorm:"not null"`
	User      User      `gorm:"foreignKey:UserID"`
	Status    string    `gorm:"status;default:pending"`
	AddressID uuid.UUID `gorm:"not null"`
	Address   Address   `gorm:"foreignKey:AddressID"`
}
