package utils

import (
	"time"

	"github.com/baimhons/nom-naa-shop.git/internal/configs"
	"github.com/golang-jwt/jwt/v5"
)

func GenerateToken(data map[string]interface{}, exp int64) (string, error) {
	claim := jwt.MapClaims(data)
	claim["exp"] = exp
	claim["iat"] = time.Now().Unix()

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claim)

	tokenString, err := token.SignedString([]byte(configs.ENV.JWT_SECRET))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}
