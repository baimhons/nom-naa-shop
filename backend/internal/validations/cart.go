package validations

import (
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
	"github.com/gofiber/fiber/v2"
)

type CartValidate interface {
	ValidateAddItemToCart(c *fiber.Ctx) error
}

type CartValidateImpl struct{}

func NewCartValidate() *CartValidateImpl {
	return &CartValidateImpl{}
}

func (v *CartValidateImpl) ValidateAddItemToCart(c *fiber.Ctx) error {
	var req request.AddItemToCartRequest

	if err := validateCommonRequestBody(c, &req); err != nil {
		return err
	}

	if req.Quantity <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Quantity must be greater than 0",
		})
	}

	c.Locals("req", req)
	return c.Next()
}

func (v *CartValidateImpl) ValidateUpdateItemFromCart(c *fiber.Ctx) error {
	var req request.UpdateItemFromCartRequest

	if err := validateCommonRequestBody(c, &req); err != nil {
		return err
	}

	if req.Quantity <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Quantity must be greater than 0",
		})
	}

	c.Locals("req", req)
	return c.Next()
}
