package handlers

import (
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/response"
	"github.com/baimhons/nom-naa-shop.git/internal/services"
	"github.com/gofiber/fiber/v2"
)

type UserHandler struct {
	userService services.UserService
}

func NewUserHandler(userService services.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

func (h *UserHandler) RegisterUser(c *fiber.Ctx) error {
	req, ok := c.Locals("req").(request.RegisterUser)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Message: "Invalid request",
		})
	}

	user, statusCode, err := h.userService.RegisterUser(req)
	if err != nil {
		return c.Status(statusCode).JSON(response.ErrorResponse{
			Message: err.Error(),
		})
	}

	return c.Status(statusCode).JSON(response.SuccessResponse{
		Message: "User registered successfully",
		Data:    user,
	})
}
