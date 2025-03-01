package handlers

import (
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
	"github.com/baimhons/nom-naa-shop.git/internal/models"
	"github.com/baimhons/nom-naa-shop.git/internal/services"
	"github.com/gofiber/fiber/v2"
)

type OrderHandler struct {
	orderService services.OrderService
}

func NewOrderHandler(orderService services.OrderService) *OrderHandler {
	return &OrderHandler{orderService: orderService}
}

func (h *OrderHandler) ConfirmOrder(c *fiber.Ctx) error {
	userContext := c.Locals("userContext").(models.UserContext)

	req := c.Locals("req").(request.OrderRequest)

	order := models.Order{
		AddressID:     req.AddressID,
		CartID:        req.CartID,
		PaymentMethod: req.PaymentMethod,
	}

	order, status, err := h.orderService.ConfirmOrder(order, userContext)
	if err != nil {
		return c.Status(status).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Order confirmed successfully",
		"order":   order,
	})
}
