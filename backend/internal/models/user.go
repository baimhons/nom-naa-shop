package models

type User struct {
	BaseModel
	Username    string `gorm:"not null,unique"`
	FirstName   string `gorm:"not null"`
	LastName    string `gorm:"not null"`
	Address     string `gorm:"not null"`
	Email       string `gorm:"not null,unique"`
	Password    string `gorm:"not null"`
	PhoneNumber string `gorm:"not null"`
	Role        string `gorm:"not null"`
}
