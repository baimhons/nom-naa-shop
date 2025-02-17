package models

type Order struct {
	BaseModel
	TrackingID string  `gorm:"tracking_id;not null"`
	CartID     uint    `gorm:"not null"`
	Cart       Cart    `gorm:"foreignKey:CartID"`
	TotalPrice float64 `gorm:"not null"`
	AddressID  uint    `gorm:"not null"`
	Address    Address `gorm:"foreignKey:AddressID"`
}
