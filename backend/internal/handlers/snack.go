package handlers

import (
	"strconv"

	"github.com/baimhons/nom-naa-shop.git/internal/dtos/request"
	"github.com/baimhons/nom-naa-shop.git/internal/dtos/response"
	"github.com/baimhons/nom-naa-shop.git/internal/models"
	"github.com/baimhons/nom-naa-shop.git/internal/services"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type SnackHandler struct {
	snackService services.SnackService
}

func NewSnackHandler(snackService services.SnackService) *SnackHandler {
	return &SnackHandler{snackService: snackService}
}

func (h *SnackHandler) CreateSnack(c *fiber.Ctx) error {
	req := c.Locals("req").(request.CreateSnackRequest)
	resp, statusCode, err := h.snackService.CreateSnack(req)
	if err != nil {
		return c.Status(statusCode).JSON(response.ErrorResponse{
			Message: "Failed to create snack: " + err.Error(),
		})
	}
	return c.Status(statusCode).JSON(resp)
}

func (h *SnackHandler) GetSnackImage(c *fiber.Ctx) error {
	id := c.Params("id")
	snack, statusCode, err := h.snackService.GetSnackByID(uuid.MustParse(id))
	if err != nil {
		return c.Status(statusCode).JSON(response.ErrorResponse{
			Message: "Snack not found",
		})
	}

	c.Set("Content-Type", "image/jpeg")            // หรือ image/png
	return c.Send(snack.Data.(models.Snack).Image) // ส่งเป็นไฟล์ภาพ
}

func (h *SnackHandler) GetAllSnacks(c *fiber.Ctx) error {
	// Ensure query parameters are parsed correctly
	page, err := strconv.Atoi(c.Query("page", "0"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Message: "Invalid page parameter",
		})
	}
	pageSize, err := strconv.Atoi(c.Query("page_size", "10"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(response.ErrorResponse{
			Message: "Invalid page_size parameter",
		})
	}
	sort := c.Query("sort", "name")
	order := c.Query("order", "asc")

	// Create a PaginationQuery object
	querys := request.PaginationQuery{
		Page:     &page,
		PageSize: &pageSize,
		Sort:     &sort,
		Order:    &order,
	}

	// Pass the query object to the service
	resp, statusCode, err := h.snackService.GetAllSnacks(querys)
	if err != nil {
		return c.Status(statusCode).JSON(response.ErrorResponse{
			Message: err.Error(),
		})
	}
	return c.Status(statusCode).JSON(resp)
}
