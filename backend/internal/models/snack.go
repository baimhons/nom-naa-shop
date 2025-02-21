package models

type Snack struct {
	BaseModel
	Name        string   `gorm:"not null"`
	Price       float64  `gorm:"not null"`
	Quantity    int      `gorm:"not null"`
	Type        string   `gorm:"not null"`
	Image       []byte   `gorm:"type:bytea"`
	Description string   `gorm:"not null"`
	Reviews     []Review `gorm:"foreignKey:SnackID"`
}
