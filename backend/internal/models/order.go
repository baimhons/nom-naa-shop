package models

import (
	"github.com/google/uuid"
)

type Order struct {
	BaseModel
	TrackingID string    `gorm:"tracking_id;not null"`
	CartID     uuid.UUID `gorm:"not null"`
	Cart       Cart      `gorm:"foreignKey:CartID"`
	TotalPrice float64   `gorm:"not null"`
	AddressID  uuid.UUID `gorm:"not null"`
	Address    Address   `gorm:"foreignKey:AddressID"`
}
