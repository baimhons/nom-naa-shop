package models

import (
	"github.com/golang-jwt/jwt/v5"
)

type UserContext struct {
	ID       string `gorm:"id"`
	Username string `gorm:"username"`
	Email    string `gorm:"email"`
	Role     string `gorm:"role"`
	jwt.RegisteredClaims
}
