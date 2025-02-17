package models

type Review struct {
	BaseModel
	UserID  uint   `gorm:"not null"`
	User    User   `gorm:"foreignKey:UserID"`
	SnackID uint   `gorm:"not null"`
	Snack   Snack  `gorm:"foreignKey:SnackID"`
	Rating  int    `gorm:"not null"`
	Comment string `gorm:"not null"`
}
