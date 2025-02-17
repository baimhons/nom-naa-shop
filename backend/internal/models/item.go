package models

type Item struct {
	BaseModel
	SnackID  uint  `gorm:"not null"`
	Snack    Snack `gorm:"foreignKey:SnackID"`
	Quantity int   `gorm:"not null"`
	CartID   uint  `gorm:"not null"`
}
