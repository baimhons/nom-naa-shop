package services

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/baimhons/nom-naa-shop.git/internal/dtos/response"
	"github.com/baimhons/nom-naa-shop.git/internal/models"
	"github.com/baimhons/nom-naa-shop.git/internal/repositories"
	"github.com/baimhons/nom-naa-shop.git/internal/utils"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type RefreshTokenService interface {
	RefreshToken(userContext models.UserContext) (resp response.SuccessResponse, statusCode int, err error)
}

type refreshTokenService struct {
	userRepository repositories.UserRepository
	redisClient    *redis.Client
}

func NewRefreshTokenService(userRepository repositories.UserRepository, redisClient *redis.Client) RefreshTokenService {
	return &refreshTokenService{
		userRepository: userRepository,
		redisClient:    redisClient,
	}
}

func (as *refreshTokenService) RefreshToken(userContext models.UserContext) (resp response.SuccessResponse, statusCode int, err error) {
	user := models.User{}
	if err := as.userRepository.GetBy("email", userContext.Email, &user); err != nil {
		if err == gorm.ErrRecordNotFound {
			return resp, http.StatusNotFound, errors.New("user not found")
		}
		return resp, http.StatusInternalServerError, err
	}

	timeNow := time.Now()
	accessTokenExp := timeNow.Add(time.Hour * 1)
	refreshTokenExp := timeNow.Add(time.Hour * 24)

	accessToken, err := utils.GenerateToken(map[string]interface{}{
		"email":    user.Email,
		"username": user.Username,
		"exp":      accessTokenExp.Unix(),
	}, accessTokenExp.Unix())

	if err != nil {
		return resp, http.StatusInternalServerError, err
	}

	refreshToken, err := utils.GenerateToken(map[string]interface{}{
		"email":    user.Email,
		"username": user.Username,
		"exp":      refreshTokenExp.Unix(),
	}, refreshTokenExp.Unix())

	if err != nil {
		return resp, http.StatusInternalServerError, err
	}

	if err := as.redisClient.Set(context.Background(), fmt.Sprintf("refresh_token:%s", user.ID), refreshToken, refreshTokenExp.Sub(timeNow)); err != nil {
		return resp, http.StatusInternalServerError, err.Err()
	}

	return response.SuccessResponse{
		Message: "Token refreshed successfully",
		Data: response.LoginUserResponse{
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
		},
	}, http.StatusOK, nil
}
