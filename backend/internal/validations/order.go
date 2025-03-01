package validations

import (
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/response"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type OrderValidationImp struct {
}

type OrderValidation interface {
	ValidateConfirmOrder(c *fiber.Ctx) error
}

func NewOrderValidation() OrderValidation {
	return &OrderValidationImp{}
}

func (v *OrderValidationImp) ValidateConfirmOrder(c *fiber.Ctx) error {
	var req request.OrderRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Message: "Invalid request body",
		})
	}

	if req.CartID == uuid.Nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Message: "Cart ID is required",
		})
	}

	c.Locals("req", req)
	return c.Next()
}
