package models

type Cart struct {
	BaseModel
	Items     []Item  `gorm:"foreignKey:CartID"`
	UserID    uint    `gorm:"not null"`
	User      User    `gorm:"foreignKey:UserID"`
	Status    string  `gorm:"status;default:pending"`
	AddressID uint    `gorm:"not null"`
	Address   Address `gorm:"foreignKey:AddressID"`
}
